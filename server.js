const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("FRANKIE AI backend is running!");
});

app.post("/chat", async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const message = req.body.message;

  if (!apiKey) {
    return res.status(500).json({
      reply: "Gemini API key is missing. Please check the backend settings."
    });
  }

  if (!message) {
    return res.status(400).json({
      reply: "Please enter a message."
    });
  }

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent";

  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(
        `${url}?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: message }]
              }
            ]
          })
        }
      );

      if (!response.ok) {
        const temporaryErrors = [429, 500, 502, 503, 504];

        if (
          temporaryErrors.includes(response.status) &&
          attempt < maxAttempts
        ) {
          await new Promise(resolve =>
            setTimeout(resolve, attempt * 1500)
          );
          continue;
        }

        console.error(
          "Gemini API error:",
          response.status,
          await response.text()
        );

        return res.status(502).json({
          reply: "Sorry, Frankie AI couldn't answer just now. Please try again."
        });
      }

      const data = await response.json();
      const answer = data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("");

      if (!answer) {
        return res.status(502).json({
          reply: "Gemini returned no answer. Please try again."
        });
      }

      return res.json({ reply: answer });

    } catch (error) {
      console.error("Frankie AI error:", error.message);

      if (attempt < maxAttempts) {
        await new Promise(resolve =>
          setTimeout(resolve, attempt * 1500)
        );
        continue;
      }

      return res.status(502).json({
        reply: "Sorry, Frankie AI couldn't answer just now. Please try again."
      });
    }
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Frankie AI backend running on port ${PORT}`);
});
