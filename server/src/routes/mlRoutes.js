
const express = require("express");

const router = express.Router();

const ML_API_URL =
  process.env.ML_API_URL || "http://127.0.0.1:8000";

// Assistance prediction
router.post("/assistance", async (req, res) => {
  try {
    const response = await fetch(`${ML_API_URL}/predict/assistance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: "ML API is unavailable",
    });
  }
});

// Urgency prediction
router.post("/urgency", async (req, res) => {
  try {
    const response = await fetch(`${ML_API_URL}/predict/urgency`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: "ML API is unavailable",
    });
  }
});

// ETA prediction
router.post("/eta", async (req, res) => {
  try {
    const response = await fetch(`${ML_API_URL}/predict/eta`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: "ML API is unavailable",
    });
  }
});

module.exports = router;
