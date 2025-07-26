import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeEmotion } from "./emotions_optimized.js";
import bodyParser from "body-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(bodyParser.json());

// Static YAML for GPT Actions
app.use("/openapi.yaml", express.static(path.join(__dirname, "openapi.yaml")));

// POST /emotion
app.post("/emotion", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Missing 'text' in request body." });
  }
  const result = await analyzeEmotion(text);
  res.json(result);
});

// GET /status
app.get("/status", (req, res) => {
  res.json({ status: "alive", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ server_with_emotion.js läuft auf http://localhost:${PORT}`);
});
