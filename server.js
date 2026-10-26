const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("FRANKIE AI backend is running!");
});

app.post("/chat", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const message = req.body.message;

    if (!apiKey) {
      return res.status(500).json({
        error: "Gemini API key is not configured."
      });
    }

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Please send a message."
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: "You are FRANKIE AI, a friendly, helpful voice assistant. Answer clearly and naturally."
            }]
          },
          contents: [{
            parts: [{
              text: message.slice(0, 4000)
            }]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);
      return res.status(500).json({
        error: "Gemini could not answer. Please check the API key and model access."
      });
    }

    const answer =
      data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("") || "I couldn't generate a reply.";

    res.json({ reply: answer });

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
