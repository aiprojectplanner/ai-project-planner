import dotenv from 'dotenv'

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

export default async function handler(req, res) {
  // Set response headers early to avoid caching and ensure JSON responses.
  res.setHeader('Content-Type', 'application/json');

  console.log("--- AI Generator Diagnostic Start ---");
  console.log("Method:", req.method);
  
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { idea } = req.body || {};
    console.log("Received idea:", idea);

    if (!idea || !idea.trim()) {
      return res.status(400).json({ error: "Project idea is required" });
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

    const prompt = `
You are an AI project planning assistant.
Create a structured project plan for: "${idea}"
Return JSON only. No markdown.
Schema: { "projectTitle": "string", "timeline": [{ "task": "string", "start": 0, "duration": 1 }] }
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

      console.log('JSON Parsed Successfully with model:', model)
      return res.status(200).json(parsed)
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
