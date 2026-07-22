const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const credentialRoutes = require("./routes/credential.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const adminRoutes = require("./routes/admin.routes");

const credentialController = require("./controllers/credential.controller");
const profileController = require("./controllers/profile.controller");
const requireAuth = require("./middleware/auth.middleware");
const errorMiddleware = require("./middleware/error.middleware");

const app = express();

// CORS setup
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(
  session({
    secret: "msc-club-credentials-secret-key-2026",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if running over HTTPS
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

// Miscellaneous / Integration / Public Endpoints
app.get("/api/u/:username", credentialController.getPublicProfile);
app.get("/api/emails/recent", profileController.getRecentSentEmails);
app.post("/api/verification-requests", requireAuth, credentialController.submitClaim);
app.post("/api/integration/publish-results", credentialController.publishResults);
app.post("/api/webhooks/quiz-certificates", credentialController.publishResults);

// Serve frontend build if built (Production fallback)
const reactBuildPath = path.join(__dirname, "..", "..", "frontend", "dist");
app.use(express.static(reactBuildPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(reactBuildPath, "index.html"), (err) => {
    if (err) {
      res.status(404).send("API Endpoint or Frontend React bundle not found.");
    }
  });
});

// Error handling middleware
app.use(errorMiddleware);

module.exports = app;
