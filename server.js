import express from "express";
import { performAutomation } from "./performAutomation.js";

const app = express();

// Optional: basic health endpoint
app.get("/", (req, res) => {
  res.send("Automation service is running.");
});

// Trigger automation
app.get("/run", async (req, res) => {
   try {
    const result = await performAutomation();
    console.log("🎉 Automation result:", result);
    res.json({ success: true, result });
  } catch (err) {
    console.error("❌ Automation failed:", err);
    res.json({ success: false, error: err.stack || err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
