import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

function parseModelPriorityList() {
  const raw = process.env.OPENROUTER_MODELS
  if (raw && raw.trim()) {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }
  const single = process.env.OPENROUTER_MODEL && process.env.OPENROUTER_MODEL.trim()
  if (single) return [single]
  return ['google/gemini-2.5-flash']
}

/** HTTP status where trying the next model may help (region, capacity, upstream). */
function shouldTryNextOpenRouterStatus(status) {
  if (status === 401 || status === 400) return false
  return [403, 404, 408, 409, 413, 429, 500, 502, 503, 504].includes(status)
}

function clampInt(v, min, max) {
  const n = Number.parseInt(String(v), 10)
  if (Number.isNaN(n)) return min
  return Math.min(max, Math.max(min, n))
}

const WEEKS_PER_MONTH = 52 / 12
const MAX_PROJECT_MONTHS = 18
const MAX_TOTAL_WEEKS = Math.floor(MAX_PROJECT_MONTHS * WEEKS_PER_MONTH) // ~78

function monthsToWeeks(months) {
  const m = clampInt(months, 1, MAX_PROJECT_MONTHS)
  return Math.max(1, Math.floor(m * WEEKS_PER_MONTH))
}

function normalizeGeneratedPlan(parsed, constraints) {
  const maxTotalWeeks =
    constraints?.expectedTotalMonths != null
      ? monthsToWeeks(constraints.expectedTotalMonths)
      : clampInt(constraints?.expectedTotalWeeks ?? monthsToWeeks(12), 1, MAX_TOTAL_WEEKS)
  const maxTasks = clampInt(constraints?.maxTasks ?? 9, 1, 19)
  const maxTaskDurationWeeks = 6
  const maxTaskNameLen = 48

  const projectTitle =
    typeof parsed?.projectTitle === 'string' && parsed.projectTitle.trim()
      ? parsed.projectTitle.trim().slice(0, 80)
      : 'Project Plan'

  if (!Array.isArray(parsed?.timeline)) return null

  const rawItems = parsed.timeline
    .map((item) => {
      const task = typeof item?.task === 'string' ? item.task.trim() : ''
      const duration = clampInt(item?.duration, 1, maxTaskDurationWeeks)
      const start = Number.parseInt(String(item?.start ?? 0), 10)
      return { task, duration, start: Number.isNaN(start) ? 0 : start }
    })
    .filter((x) => x.task && x.duration >= 1)

  if (rawItems.length === 0) return null

  // Use model-provided ordering as a hint, but always pack sequentially for readability.
  rawItems.sort((a, b) => a.start - b.start)
  const picked = rawItems.slice(0, maxTasks)

  let curStart = 0
  const timeline = []
  for (const it of picked) {
    if (timeline.length >= maxTasks) break
    if (curStart >= maxTotalWeeks) break

    let dur = it.duration
    if (curStart + dur > maxTotalWeeks) dur = maxTotalWeeks - curStart
    if (dur <= 0) break

    timeline.push({
      task: it.task.slice(0, maxTaskNameLen),
      start: curStart,
      duration: dur,
    })

    curStart += dur
  }

  if (timeline.length === 0) return null

  return { projectTitle, timeline }
}

async function callOpenRouter({ apiKey, model, prompt }) {
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
    }),
  })
  const data = await response.json().catch(() => ({}))
  return { response, data }
}

async function authenticateAndAuthorizeProUser(req) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
  if (!token) {
    return { ok: false, status: 401, body: { error: 'Unauthorized', message: 'Missing bearer token.' } }
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      ok: false,
      status: 500,
      body: { error: 'Server Configuration Error', message: 'Supabase env is missing for auth validation.' },
    }
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user) {
    return { ok: false, status: 401, body: { error: 'Unauthorized', message: 'Invalid or expired token.' } }
  }

  const profileClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  })
  const { data: profile, error: profileError } = await profileClient
    .from('profiles')
    .select('plan_tier')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return {
      ok: false,
      status: 403,
      body: { error: 'Pro Plan Required', message: 'Plan profile not found for current user.' },
    }
  }

  if (profile.plan_tier !== 'pro') {
    return {
      ok: false,
      status: 403,
      body: { error: 'Pro Plan Required', message: 'AI Planner is available for Pro users only.' },
    }
  }

  return { ok: true, user, profile }
}

export default async function handler(req, res) {
  // Set response headers early to avoid caching and ensure JSON responses.
  res.setHeader('Content-Type', 'application/json');

  console.log("--- AI Generator Diagnostic Start ---");
  console.log("Method:", req.method);
  
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { idea, constraints } = req.body || {}
    console.log("Received idea:", idea);

    if (!idea || !idea.trim()) {
      return res.status(400).json({ error: "Project idea is required" });
    }

    const authz = await authenticateAndAuthorizeProUser(req)
    if (!authz.ok) {
      return res.status(authz.status).json(authz.body)
    }

    // Strict API key validation.
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("CRITICAL ERROR: OPENROUTER_API_KEY is undefined in process.env");
      return res.status(500).json({ 
        error: "Server Configuration Error", 
        message: "API Key is missing from the server environment. Please check .env.local" 
      });
    }

    console.log("API Key found (length):", apiKey.length);

    const maxTotalMonths =
      constraints?.expectedTotalMonths != null
        ? clampInt(constraints.expectedTotalMonths, 1, MAX_PROJECT_MONTHS)
        : clampInt(Math.round((constraints?.expectedTotalWeeks ?? monthsToWeeks(12)) / WEEKS_PER_MONTH), 1, MAX_PROJECT_MONTHS)

    const maxTotalWeeks = monthsToWeeks(maxTotalMonths)
    const maxTasks = clampInt(constraints?.maxTasks ?? 9, 1, 19)
    const templateKey = constraints?.templateKey || 'other'

    const templateHint =
      templateKey === 'ecom'
        ? 'Template: E-commerce. Focus on store foundation, product discovery, checkout flow, marketing/ads, and conversion tracking.'
        : templateKey === 'saas'
          ? 'Template: SaaS software. Focus on MVP definition, user onboarding, core feature roadmap, infrastructure, and QA/testing.'
          : 'Template: Other. Focus on clear MVP scope, implementation phases, testing/QA, and a deliverable roadmap.'

    const prompt = `
You are an AI project planning assistant.

Task: Create a structured project plan for the user idea:
"${idea}"

Quality constraints (must follow):
- Output MUST be JSON only (no markdown, no extra text).
- Return exactly this schema:
  { "projectTitle": "string", "timeline": [{ "task": "string", "start": 0, "duration": 1 }] }
- total project length MUST NOT exceed ${maxTotalMonths} months (~${maxTotalWeeks} weeks).
- Use at most ${maxTasks} tasks.
- Each task duration must be an integer between 1 and 6 weeks.
- Task "start" must be sequential from 0 (start at 0, then continue increasing by previous task duration).
- Keep task names concise (<= 48 characters).
- Be consistent and avoid wildly long timelines.

${templateHint}
`;

    const models = parseModelPriorityList()
    if (models.length === 0) {
      return res.status(500).json({
        error: 'Server Configuration Error',
        message: 'No OpenRouter models configured. Set OPENROUTER_MODELS or OPENROUTER_MODEL.',
      })
    }

    console.log('OpenRouter model priority list:', models)

    let lastFailure = null

      for (const model of models) {
      console.log('Calling OpenRouter with model:', model)
      let response
      let data
      try {
        const out = await callOpenRouter({ apiKey, model, prompt })
        response = out.response
        data = out.data
      } catch (err) {
        console.error('OpenRouter fetch failed for model', model, err.message)
        lastFailure = { model, status: 0, details: { message: err.message } }
        continue
      }

      console.log('OpenRouter Response Status:', response.status)

      if (!response.ok) {
        console.error('OpenRouter Error Data:', JSON.stringify(data))
        lastFailure = { model, status: response.status, details: data }
        if (shouldTryNextOpenRouterStatus(response.status)) {
          continue
        }
        return res.status(response.status).json({
          error: 'AI Service Error',
          details: data,
        })
      }

      const text = data?.choices?.[0]?.message?.content
      console.log('AI Raw Text Received.')

      if (!text || typeof text !== 'string') {
        lastFailure = { model, status: response.status, details: { message: 'Empty model content' } }
        continue
      }

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        lastFailure = {
          model,
          status: response.status,
          details: { message: 'AI did not return a valid JSON object' },
        }
        continue
      }

      let parsed
      try {
        parsed = JSON.parse(jsonMatch[0])
      } catch (e) {
        lastFailure = {
          model,
          status: response.status,
          details: { message: 'JSON parse failed', error: e.message },
        }
        continue
      }

      const normalized = normalizeGeneratedPlan(parsed, {
        expectedTotalMonths: maxTotalMonths,
        expectedTotalWeeks: maxTotalWeeks,
        maxTasks,
      })

      if (!normalized) {
        lastFailure = {
          model,
          status: response.status,
          details: { message: 'Normalized plan validation failed' },
        }
        continue
      }

      console.log('JSON Parsed Successfully with model:', model)
      return res.status(200).json(normalized)
    }

    console.error('All OpenRouter models failed. Last:', JSON.stringify(lastFailure))
    return res.status(502).json({
      error: 'AI Service Error',
      message: 'All configured models failed or returned unusable output.',
      lastAttempt: lastFailure,
    })

  } catch (error) {
    console.error("DIAGNOSTIC CRASH:", error.message);
    return res.status(500).json({
      error: "Internal Diagnostic Error",
      message: error.message,
      stack: error.stack
    });
  }
}
