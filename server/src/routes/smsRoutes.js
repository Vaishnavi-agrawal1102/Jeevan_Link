
const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  receiveSimulatedSMS,
} = require("../controllers/smsController");

const router = express.Router();

const smsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many SMS simulation attempts. Try again later.",
  },
});

router.post(
  "/simulate",
  smsLimiter,
  receiveSimulatedSMS
);

module.exports = router;
