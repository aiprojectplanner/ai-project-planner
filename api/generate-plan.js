export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { idea } = req.body || {};

  if (!idea || !idea.trim()) {
    return res.status(400).json({ error: "Project idea is required" });
  }

  const prompt = `
You are an AI project planning assistant.

Create a structured project plan for this idea:
"${idea}"

Return JSON only. Do not add markdown, explanation, or code fences.

Use exactly this schema:
{
  "projectTitle": "string",
  "projectType": "string",
  "duration": "string",
  "priority": "string",
  "summary": "string",
  "phases": [
    {
      "title": "string",
      "tasks": ["string", "string", "string"]
    }
  ],
  "timeline": [
    {
      "task": "string",
      "start": 0,
      "duration": 1
    }
  ],
  "recommendedTools": ["string", "string"],
  "keyRisks": ["string", "string"]
}

Rules:
- 3 to 4 phases preferred
- 3 to 5 tasks per phase preferred
- timeline should have 5 to 8 items
- start must be 0 or greater (weeks)
- duration must be at least 1 (weeks)
- recommendedTools should list specific software or technologies
- keyRisks should list potential blockers or challenges
- keep output concise and product-oriented
`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.SITE_URL || "https://ai-project-planner-psi.vercel.app",
        "X-OpenRouter-Title": process.env.SITE_NAME || "AI Project Planner"
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You must return valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "OpenRouter request failed",
        details: data
      });
    }

    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      return res.status(500).json({
        error: "Model returned empty content",
        details: data
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({
        error: "Model did not return valid JSON",
        raw: text
      });
    }

    // basic normalization
    parsed.projectTitle = parsed.projectTitle || `Generated plan for: ${idea}`;
    parsed.projectType = parsed.projectType || "General Project";
    parsed.duration = parsed.duration || "Estimated timeline: 4-8 weeks";
    parsed.priority = parsed.priority || "Priority: structured execution";
    parsed.summary = parsed.summary || "This plan provides a structured path from idea to execution.";
    parsed.phases = Array.isArray(parsed.phases) ? parsed.phases : [];
    parsed.timeline = Array.isArray(parsed.timeline) ? parsed.timeline : [];
    parsed.recommendedTools = Array.isArray(parsed.recommendedTools) ? parsed.recommendedTools : [];
    parsed.keyRisks = Array.isArray(parsed.keyRisks) ? parsed.keyRisks : [];

    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({
      error: "Server error while generating plan",
      details: error.message
    });
  }
}
