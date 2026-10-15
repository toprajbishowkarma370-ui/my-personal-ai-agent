export default async function handler(req, res) {
if (req.method !== "POST") {
return res.status(405).json({
error: "Method not allowed"
});
}

try {
const message = req.body?.message;

if (typeof message !== "string" || !message.trim()) {
  return res.status(400).json({
    error: "A valid message is required"
  });
}

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  return res.status(500).json({
    error: "GEMINI_API_KEY is missing in Vercel Environment Variables"
  });
}

const response = await fetch(
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{
          text: "You are a helpful Personal AI Business Agent. Support English, Nepali, and Roman Nepali. Help with business planning, leads, tasks, and website projects. Never claim you performed real actions unless they were actually completed. Ask for owner approval before external actions."
        }]
      },
      contents: [{
        role: "user",
        parts: [{ text: message.trim() }]
      }]
    })
  }
);

const data = await response.json();

if (!response.ok) {
  console.error("Gemini API error:", data?.error?.message);

  return res.status(502).json({
    error: data?.error?.message || "Gemini request failed"
  });
}

const reply = (data?.candidates?.[0]?.content?.parts || [])
  .map(part => part.text || "")
  .join("")
  .trim();

if (!reply) {
  return res.status(502).json({
    error: "Gemini returned an empty response"
  });
}

return res.status(200).json({ reply });

} catch (error) {
console.error("Chat API error:", error);

return res.status(500).json({
  error: "Server error while processing your message"
});

}
}
