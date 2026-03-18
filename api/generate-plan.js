import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

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

    console.log("Calling OpenRouter...");
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4
      })
    });

    const data = await response.json();
    console.log("OpenRouter Response Status:", response.status);

    if (!response.ok) {
      console.error("OpenRouter Error Data:", JSON.stringify(data));
      return res.status(response.status).json({
        error: "AI Service Error",
        details: data
      });
    }

    const text = data?.choices?.[0]?.message?.content;
    console.log("AI Raw Text Received.");

    // Minimal JSON extraction from model output.
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI did not return a valid JSON object");
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    console.log("JSON Parsed Successfully.");
    
    return res.status(200).json(parsed);

  } catch (error) {
    console.error("DIAGNOSTIC CRASH:", error.message);
    return res.status(500).json({
      error: "Internal Diagnostic Error",
      message: error.message,
      stack: error.stack
    });
  }
}
