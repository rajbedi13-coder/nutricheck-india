export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "No prompt" });
  
  const keyExists = !!process.env.GEMINI_KEY;
  const keyPreview = process.env.GEMINI_KEY ? process.env.GEMINI_KEY.substring(0,8) : "NOT FOUND";
  
  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1000 }
        })
      }
    );
    const data = await geminiRes.json();
    if (data.error) return res.status(200).json({ error: data.error.message, keyExists, keyPreview });
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message, keyExists, keyPreview });
  }
}
