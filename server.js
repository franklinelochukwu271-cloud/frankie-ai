
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("FRANKIE AI backend is running!");
});

app.post("/chat", async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "AI connection is not configured yet."
      });
    }

    const client = new OpenAI({ apiKey });
    const message = req.body.message;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Please send a message."
      });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are FRANKIE AI, a friendly, helpful voice assistant. Answer clearly and naturally."
        },
        {
          role: "user",
          content: message.slice(0, 4000)
        }
      ]
    });

    res.json({
      reply: response.choices[0].message.content
    });
  } catch (error) {
    console.error("FRANKIE AI error:", error.message);
    res.status(500).json({
      error: "Sorry, I couldn't answer just now. Please try again."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`FRANKIE AI backend listening on port ${PORT}`);
});
