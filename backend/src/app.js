const express = require("express");
const session = require("express-session");
const cors = require("cors");

const env = require("./config/env");
const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const credentialRoutes = require("./routes/credential.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const adminRoutes = require("./routes/admin.routes");
const templateRoutes = require("./routes/template.routes");

const credentialController = require("./controllers/credential.controller");
const profileController = require("./controllers/profile.controller");
const requireAuth = require("./middleware/auth.middleware");
const errorMiddleware = require("./middleware/error.middleware");

const app = express();
app.set("trust proxy", 1);

const isProd = process.env.NODE_ENV === "production" || process.env.AZURE_HTTP_USER_AGENT !== undefined;

// Allowed Origins for CORS
const allowedOrigins = [
  "https://verify.mscprpcem.tech",
  "http://localhost:5173",
  "http://localhost:3000"
];

if (env.FRONTEND_URL) {
  const cleanFrontendUrl = env.FRONTEND_URL.replace(/\/$/, "");
  if (!allowedOrigins.includes(cleanFrontendUrl)) {
    allowedOrigins.push(cleanFrontendUrl);
  }
}

// CORS setup
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".azurestaticapps.net")) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(
  session({
    secret: env.SESSION_SECRET || "msc-club-credentials-secret-key-2026",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 Hours
    }
  })
);

// Mount Modular Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/credentials", credentialRoutes);
app.use("/api/credentials", analyticsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/templates", templateRoutes);

// Miscellaneous / Integration / Public Endpoints
app.get("/api/u/:username", credentialController.getPublicProfile);
app.get("/api/emails/recent", profileController.getRecentSentEmails);
app.post("/api/verification-requests", requireAuth, credentialController.submitClaim);
app.post("/api/integration/publish-results", credentialController.publishResults);
app.post("/api/webhooks/quiz-certificates", credentialController.publishResults);

// Health endpoint
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    service: "MSC Certificate Verification API",
    version: "1.0.0"
  });
});

// 404 for unknown API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found"
  });
});

// Error handling middleware
app.use(errorMiddleware);

module.exports = app;
