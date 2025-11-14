import express from "express";
import { runAutomation } from "./src/automation.js";

const app = express();
app.use(express.json());

app.get("/", (_, res) => res.send("Service is running ✅"));

app.post("/run", async (req, res) => {
  try {
    const result = await runAutomation(req.body || {});
    res.status(200).json({ success: true, result });
  } catch (err) {
    console.error("Automation failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`🚀 Server listening on port ${PORT}`)
);
