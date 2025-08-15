// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Ensure API key is set
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ Missing OPENAI_API_KEY environment variable");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Set in Render's dashboard
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// API route for IQ score evaluation
app.post("/api/iq-score", async (req, res) => {
  const { score } = req.body;

  if (typeof score !== "number") {
    return res.status(400).json({ error: "Invalid score" });
  }

  // Simple baseline IQ calculation
  const rawIQ = 80 + score * 2;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an IQ test evaluator. Provide a short, friendly analysis based on the score and calculated IQ."
        },
        {
          role: "user",
          content: `The user scored ${score} out of 20. This gives an approximate IQ of ${rawIQ}. Provide a 2-sentence assessment.`
        }
      ],
      max_tokens: 100
    });

    const aiMessage =
      completion.choices[0]?.message?.content?.trim() ||
      "No analysis available.";

    res.json({
      iq: rawIQ,
      analysis: aiMessage
    });
  } catch (error) {
    console.error("❌ AI Scoring Failed:", error.message);
    res.status(500).json({ error: "AI scoring failed." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Server running on port ${port}`));
