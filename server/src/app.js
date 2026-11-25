
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");
const smsRoutes = require("./routes/smsRoutes");
const shelterRoutes = require("./routes/shelterRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const chatRoutes = require("./routes/chatRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const ngoRoutes = require("./routes/ngoRoutes");
const adminRoutes = require("./routes/adminRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const mlRoutes = require("./routes/mlRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.set("trust proxy", 1);

// --- Core middleware ---
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// --- Authentication rate limiting ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});

app.use("/api/auth", authLimiter);

// --- Public SOS rate limiting ---
const sosLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many SOS attempts. Please try again later.",
  },
});

// Apply this only to the public SOS endpoint.
app.use("/api/request/sos", sosLimiter);

// --- Health check ---
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Jeevan Link API is running",
    time: new Date().toISOString(),
  });
});

// --- API routes ---
app.use("/api/auth", authRoutes);
app.use("/api/request", requestRoutes);
app.use("/api/sms", smsRoutes);
app.use("/api/shelter", shelterRoutes);
app.use("/api/resource", resourceRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/ngo", ngoRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/ml", mlRoutes);

// --- Error handling ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
