import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/iq-score", async (req, res) => {
  const { score } = req.body;
  const rawIQ = 80 + score * 2;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an IQ test evaluator. Provide a short, friendly analysis."
        },
        {
          role: "user",
          content: `The user scored ${score} out of 20. This gives an approximate IQ of ${rawIQ}. Provide a 2-sentence assessment.`
        }
      ],
      max_tokens: 100
    });

    const aiMessage = completion.choices[0].message.content.trim();

    res.json({
      estimatedIQ: rawIQ,
      feedback: aiMessage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI scoring failed." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Server running on port ${port}`));
