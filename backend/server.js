const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const { initDatabase, dbGet, dbAll, dbRun, calculateLevel } = require("./database");

const app = express();
const PORT = process.env.PORT || 5000;

// Dynamic Metrics tracking
let verifiedTodayCount = 0;
let downloadsTodayCount = 0;
let linkedinSharesCount = 0;

// CORS setup
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Middlewares
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.session.userId || req.session.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  next();
};

// --- AUTHENTICATION API ---

// Register (Normal registration flow)
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required." });
  }

  try {
    const existingUser = await dbGet("SELECT id, password_hash FROM users WHERE LOWER(email) = ?", [email.toLowerCase().trim()]);
    
    const hashedPassword = await bcrypt.hash(password, 10);
    let userId;

    if (existingUser) {
      // If a placeholder (lazy) account already exists, set password
      if (!existingUser.password_hash) {
        await dbRun(
          "UPDATE users SET name = ?, password_hash = ? WHERE id = ?",
          [name, hashedPassword, existingUser.id]
        );
        userId = existingUser.id;
      } else {
        return res.status(400).json({ error: "Email is already registered." });
      }
    } else {
      // Create new account
      const result = await dbRun(
        "INSERT INTO users (name, email, password_hash, role, xp, level) VALUES (?, ?, ?, 'student', 0, 'Explorer')",
        [name, email.toLowerCase().trim(), hashedPassword]
      );
      userId = result.lastID;
    }

    // Auto-link all credentials issued to this email
    await dbRun("UPDATE credentials SET user_id = ? WHERE LOWER(recipient_email) = ?", [userId, email.toLowerCase().trim()]);

    // Log Activity
    await dbRun("INSERT INTO activity_logs (user_id, action) VALUES (?, ?)", [userId, "Account registered & wallet activated"]);

    const user = await dbGet("SELECT * FROM users WHERE id = ?", [userId]);

    req.session.userId = user.id;
    req.session.email = user.email;
    req.session.name = user.name;
    req.session.role = user.role;

    res.status(201).json({
      message: "Registration successful",
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Server database error." });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await dbGet("SELECT * FROM users WHERE LOWER(email) = ?", [email.toLowerCase().trim()]);
    if (!user || !user.password_hash) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Set Session
    req.session.userId = user.id;
    req.session.email = user.email;
    req.session.name = user.name;
    req.session.role = user.role;

    res.json({
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server database error." });
  }
});

// Lazy Login / OTP Simulation (No registration form required, links credentials instantly)
app.post("/api/auth/lazy-login", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email address is required." });
  }

  try {
    const normEmail = email.toLowerCase().trim();
    let user = await dbGet("SELECT * FROM users WHERE LOWER(email) = ?", [normEmail]);
    let userId;

    if (!user) {
      // Lazy creation of student user
      // Deduce name from email prefix as default
      const inferredName = normEmail.split("@")[0].split(".").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
      const result = await dbRun(
        `INSERT INTO users (name, email, password_hash, role, bio, headline, xp, level)
         VALUES (?, ?, NULL, 'student', 'Microsoft Student Club Member', 'Student Developer', 0, 'Explorer')`,
        [inferredName, normEmail]
      );
      userId = result.lastID;
    } else {
      userId = user.id;
    }

    // Link all credential records issued to this email (if not already linked)
    await dbRun("UPDATE credentials SET user_id = ? WHERE LOWER(recipient_email) = ?", [userId, normEmail]);

    // Query Amit's custom defaults if email is student@mscprpcem.tech
    if (normEmail === "student@mscprpcem.tech") {
      // Force match 1840 XP if needed
      await dbRun("UPDATE users SET xp = 1840, level = 'Innovator' WHERE id = ?", [userId]);
    }

    // Log Activity
    await dbRun("INSERT INTO activity_logs (user_id, action) VALUES (?, ?)", [userId, "First Login - Digital Wallet Linked"]);

    const finalUser = await dbGet("SELECT * FROM users WHERE id = ?", [userId]);

    req.session.userId = finalUser.id;
    req.session.email = finalUser.email;
    req.session.name = finalUser.name;
    req.session.role = finalUser.role;

    res.json({
      message: "Lazy login successful, wallet linked.",
      user: { id: finalUser.id, name: finalUser.name, email: finalUser.email, role: finalUser.role }
    });
  } catch (err) {
    console.error("Lazy login error:", err);
    res.status(500).json({ error: "Failed to process login." });
  }
});

// Check Session
app.get("/api/auth/me", async (req, res) => {
  if (!req.session.userId) {
    return res.json({ user: null });
  }
  try {
    const user = await dbGet("SELECT * FROM users WHERE id = ?", [req.session.userId]);
    if (!user) {
      return res.json({ user: null });
    }
    
    // Recalculate level based on XP
    const recalculatedLevel = calculateLevel(user.xp);
    if (recalculatedLevel !== user.level) {
      await dbRun("UPDATE users SET level = ? WHERE id = ?", [recalculatedLevel, user.id]);
      user.level = recalculatedLevel;
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Session load error." });
  }
});

// Logout
app.get("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Logout failed." });
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
});

// --- PROFILE SERVICES ---

// Update Profile
app.post("/api/profile/update", requireAuth, async (req, res) => {
  const { bio, headline, linkedin_url, github_url, skills } = req.body;

  try {
    const skillsJson = typeof skills === "object" ? JSON.stringify(skills) : skills;
    await dbRun(
      `UPDATE users 
       SET bio = ?, headline = ?, linkedin_url = ?, github_url = ?, skills = ?
       WHERE id = ?`,
      [bio, headline, linkedin_url, github_url, skillsJson || "{}", req.session.userId]
    );

    await dbRun("INSERT INTO activity_logs (user_id, action) VALUES (?, ?)", [req.session.userId, "Updated profile bio & links"]);
    
    res.json({ message: "Profile details updated successfully." });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Failed to update profile." });
  }
});

// Get User Activity Timeline Feed
app.get("/api/profile/activity", requireAuth, async (req, res) => {
  try {
    const feed = await dbAll(
      "SELECT * FROM activity_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT 15",
      [req.session.userId]
    );
    res.json(feed);
  } catch (err) {
    res.status(500).json({ error: "Failed to query activity log feed." });
  }
});

// --- INTEGRATION: CREDENTIAL ENGINE & QUIZ PLATFORM ---

app.post("/api/integration/publish-results", async (req, res) => {
  const { quizId, quizTitle, participants, publishDate, rules } = req.body;

  if (!quizTitle || !participants || !Array.isArray(participants)) {
    return res.status(400).json({ error: "Quiz Title and array of participants are required." });
  }

  const activeRules = rules || { passingScore: 50, goldScore: 90 };
  const dateStr = publishDate || "20 July 2026";
  const resultsLog = [];

  try {
    for (const p of participants) {
      if (!p.name || !p.email) continue;
      const score = p.score || 0;
      const normEmail = p.email.toLowerCase().trim();

      let credentialType = null;
      let title = "";
      let category = "";
      let badgeIcon = "";
      let skillsList = "";
      let description = "";
      let xpEarned = 50; // Base XP for completing quiz

      // Apply Rules to evaluate rewards
      if (score >= activeRules.goldScore) {
        // Gold Badge
        credentialType = "badge";
        title = quizTitle; // e.g. "Quiz Master"
        category = "Badge";
        badgeIcon = "fa-trophy";
        skillsList = "Problem Solving, Java, Logic";
        description = `Awarded for earning a top score of ${score}% in the MSC PRPCEM ${quizTitle}.`;
        xpEarned += 200 + 100; // Gold Badge (+200 XP) + Score > 90% (+100 XP)
      } else if (score >= activeRules.passingScore) {
        // Certificate
        credentialType = "certificate";
        title = `${quizTitle} Participation`;
        category = "Event";
        badgeIcon = "fa-award";
        skillsList = "Problem Solving, Logic";
        description = `Awarded for completing the MSC PRPCEM ${quizTitle} with a passing score of ${score}%.`;
        xpEarned += 100; // Participation Certificate (+100 XP)
      }

      // Check user profile
      let user = await dbGet("SELECT id, xp FROM users WHERE LOWER(email) = ?", [normEmail]);
      let userId;

      if (!user) {
        // Lazy create user account
        const result = await dbRun(
          `INSERT INTO users (name, email, password_hash, role, bio, headline, xp, level)
           VALUES (?, ?, NULL, 'student', 'Microsoft Student Club Member', 'Student Developer', ?, ?)`,
          [p.name, normEmail, xpEarned, calculateLevel(xpEarned)]
        );
        userId = result.lastID;
      } else {
        userId = user.id;
        const newXp = user.xp + xpEarned;
        await dbRun("UPDATE users SET xp = ?, level = ? WHERE id = ?", [newXp, calculateLevel(newXp), userId]);
      }

      // Issue credential if earned
      let credId = null;
      if (credentialType) {
        const randId = Math.floor(10000 + Math.random() * 90000);
        credId = `MSC-${credentialType === "badge" ? "BDG" : "CRT"}-${String(randId).padStart(5, "0")}`;

        await dbRun(
          `INSERT INTO credentials (id, recipient_name, recipient_email, user_id, type, title, category, domain, issue_date, description, badge_icon, skills_list, score)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            credId,
            p.name,
            normEmail,
            userId,
            credentialType,
            title,
            category,
            quizTitle,
            dateStr,
            description,
            badgeIcon,
            skillsList,
            score
          ]
        );

        // Log Activity
        await dbRun("INSERT INTO activity_logs (user_id, action) VALUES (?, ?)", [userId, `Earned ${title} ${category}`]);

        // Generate Branded Simulated Email (Exactly like Credly)
        const emailSubject = `🎉 You've earned a new Microsoft Student Club Badge`;
        const emailBody = `
Congratulations, ${p.name}!

You earned a new badge.

🏅 ${title}
Microsoft Student Club PRPCEM

Score: ${score}%
Issued: ${dateStr}

-------------------------------------------------
[ View Badge ] -> http://localhost:5173/credential/${credId}
[ Share ]
-------------------------------------------------
        `;

        await dbRun(
          "INSERT INTO emails_sent (recipient_email, subject, body) VALUES (?, ?, ?)",
          [normEmail, emailSubject, emailBody.trim()]
        );
      }

      resultsLog.push({
        name: p.name,
        email: normEmail,
        issued: credentialType ? true : false,
        id: credId,
        score,
        xpEarned
      });
    }

    res.json({
      success: true,
      message: `Processed ${participants.length} quiz results.`,
      records: resultsLog
    });
  } catch (err) {
    console.error("Quiz integration publish error:", err);
    res.status(500).json({ error: "Failed to finalize quiz credentials." });
  }
});

// --- CREDENTIAL SERVICES ---

// Verify search query
app.get("/api/credentials/verify", async (req, res) => {
  const { type, credentialId, email, name, badgeId, url, year, eventName, teamYear } = req.query;

  try {
    let matched = null;

    if (credentialId) {
      matched = await dbGet("SELECT * FROM credentials WHERE id = ?", [credentialId.trim()]);
    } else if (badgeId) {
      matched = await dbGet("SELECT * FROM credentials WHERE id = ? AND type = 'badge'", [badgeId.trim()]);
    } else if (email) {
      const results = await dbAll("SELECT * FROM credentials WHERE LOWER(recipient_email) = ? ORDER BY issue_date DESC", [email.toLowerCase().trim()]);
      if (results.length > 0) {
        verifiedTodayCount++;
        return res.json({ success: true, records: results });
      }
    } else if (name) {
      if (type === "event") {
        matched = await dbGet(
          `SELECT * FROM credentials 
           WHERE LOWER(recipient_name) = ? 
           AND type = 'certificate'
           AND (issue_date LIKE ? OR title = ? OR ? = '')`,
          [name.toLowerCase().trim(), `%${year}%`, eventName, eventName || ""]
        );
      } else if (type === "team") {
        matched = await dbGet(
          `SELECT * FROM credentials 
           WHERE LOWER(recipient_name) = ? 
           AND type = 'badge'
           AND (issue_date LIKE ? OR ? = '')`,
          [name.toLowerCase().trim(), `%${teamYear}%`, teamYear || ""]
        );
      } else {
        matched = await dbGet("SELECT * FROM credentials WHERE LOWER(recipient_name) = ? LIMIT 1", [name.toLowerCase().trim()]);
      }
    } else if (url) {
      const idMatch = url.match(/MSC-[A-Z]+-\d+/i);
      const extractedId = idMatch ? idMatch[0] : url.trim();
      matched = await dbGet("SELECT * FROM credentials WHERE id = ?", [extractedId]);
    }

    if (matched) {
      verifiedTodayCount++;
      res.json({ success: true, record: matched });
    } else {
      res.json({ success: false, message: "No matching credential record found." });
    }
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ error: "Failed to verify credential." });
  }
});

// Suggestions autocomplete
app.get("/api/credentials/suggest", async (req, res) => {
  const { query, type } = req.query;
  if (!query) return res.json([]);

  try {
    const credType = type === "team" ? "badge" : "certificate";
    const rows = await dbAll(
      "SELECT DISTINCT recipient_name FROM credentials WHERE type = ? AND recipient_name LIKE ? LIMIT 6",
      [credType, `%${query}%`]
    );
    res.json(rows.map(r => r.recipient_name));
  } catch (err) {
    res.status(500).json({ error: "Suggestions search failed." });
  }
});

// Metrics counters
app.get("/api/credentials/metrics", async (req, res) => {
  try {
    const certsCount = await dbGet("SELECT COUNT(*) as count FROM credentials WHERE type = 'certificate'");
    const badgesCount = await dbGet("SELECT COUNT(*) as count FROM credentials WHERE type = 'badge'");
    const studentsCount = await dbGet("SELECT COUNT(DISTINCT recipient_email) as count FROM credentials");

    res.json({
      certificatesIssued: certsCount.count,
      badgesIssued: badgesCount.count,
      studentsCount: studentsCount.count,
      verifiedToday: verifiedTodayCount,
      downloadsToday: downloadsTodayCount,
      linkedinShares: linkedinSharesCount
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve counters." });
  }
});

app.post("/api/credentials/increment-download", (req, res) => {
  downloadsTodayCount++;
  res.json({ downloadsToday: downloadsTodayCount });
});

app.post("/api/credentials/increment-share", (req, res) => {
  linkedinSharesCount++;
  res.json({ linkedinShares: linkedinSharesCount });
});

// Recent records
app.get("/api/credentials/recent", async (req, res) => {
  try {
    const list = await dbAll("SELECT * FROM credentials ORDER BY created_at DESC LIMIT 5");
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch recent credentials." });
  }
});

// User's own credentials
app.get("/api/credentials/my", requireAuth, async (req, res) => {
  try {
    const list = await dbAll(
      "SELECT * FROM credentials WHERE LOWER(recipient_email) = ? OR user_id = ? ORDER BY created_at DESC",
      [req.session.email.toLowerCase(), req.session.userId]
    );
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch student wallet." });
  }
});

// Public profile resume endpoint (`/api/u/:username`)
app.get("/api/u/:username", async (req, res) => {
  const { username } = req.params;
  try {
    // Search user by email prefix (e.g. 'amityadav' maps to user where email/name matches)
    // To make it flexible: find user whose email prefix matches username, or username matches name lowercase
    const searchString = username.toLowerCase();
    
    // Look up student profile
    const user = await dbGet(
      `SELECT id, name, email, bio, headline, profile_photo, linkedin_url, github_url, skills, xp, level, created_at 
       FROM users 
       WHERE LOWER(email) LIKE ? OR LOWER(name) LIKE ? OR REPLACE(LOWER(name), ' ', '') = ?`,
      [`%${searchString}%`, `%${searchString}%`, searchString]
    );

    if (!user) {
      return res.status(404).json({ error: "Public profile not found." });
    }

    // Get all their verified credentials
    const credentialsList = await dbAll(
      "SELECT * FROM credentials WHERE user_id = ? OR LOWER(recipient_email) = ? ORDER BY issue_date DESC",
      [user.id, user.email.toLowerCase()]
    );

    res.json({
      user,
      credentials: credentialsList
    });
  } catch (err) {
    console.error("Public profile query error:", err);
    res.status(500).json({ error: "Server database query failure." });
  }
});

// --- SIMULATED MAILBOX SERVICE ---
app.get("/api/emails/recent", async (req, res) => {
  try {
    const list = await dbAll("SELECT * FROM emails_sent ORDER BY sent_at DESC LIMIT 8");
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to query simulated mailbox." });
  }
});

// --- ADMIN API ---

// Admin view all
app.get("/api/admin/credentials", requireAdmin, async (req, res) => {
  try {
    const list = await dbAll("SELECT * FROM credentials ORDER BY created_at DESC");
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to query records log." });
  }
});

// Admin issue
app.post("/api/admin/credentials", requireAdmin, async (req, res) => {
  const { recipient_name, recipient_email, type, title, category, domain, issue_date, description, badge_icon, skills_list } = req.body;

  if (!recipient_name || !recipient_email || !type || !title || !category || !issue_date) {
    return res.status(400).json({ error: "All core fields are required." });
  }

  try {
    const year = issue_date.match(/\d{4}/) ? issue_date.match(/\d{4}/)[0] : "2026";
    const rand = Math.floor(10000 + Math.random() * 90000);
    const prefix = type === "certificate" ? "CRT" : "BDG";
    const customId = `MSC-${prefix}-${rand}`;

    const user = await dbGet("SELECT id FROM users WHERE LOWER(email) = ?", [recipient_email.toLowerCase().trim()]);
    const userId = user ? user.id : null;

    await dbRun(
      `INSERT INTO credentials (id, recipient_name, recipient_email, user_id, type, title, category, domain, issue_date, description, badge_icon, skills_list)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customId,
        recipient_name,
        recipient_email.toLowerCase().trim(),
        userId,
        type,
        title,
        category,
        domain || null,
        issue_date,
        description || `Awarded for ${title} on ${issue_date}.`,
        badge_icon || (type === "certificate" ? "fa-award" : "fa-shield-halved"),
        skills_list || (type === "certificate" ? "Collaboration, Learning" : "Leadership, Teamwork")
      ]
    );

    // Award XP (+100 for cert, +200 for badge)
    if (userId) {
      const xpBonus = type === "certificate" ? 100 : 200;
      const currentUser = await dbGet("SELECT xp FROM users WHERE id = ?", [userId]);
      const currentXp = currentUser ? currentUser.xp : 0;
      const newXp = currentXp + xpBonus;
      const newLevel = calculateLevel(newXp);
      await dbRun("UPDATE users SET xp = ?, level = ? WHERE id = ?", [newXp, newLevel, userId]);
      await dbRun("INSERT INTO activity_logs (user_id, action) VALUES (?, ?)", [userId, `Earned ${title} ${category}`]);
    }

    res.status(201).json({
      message: "Credential issued successfully",
      credentialId: customId
    });
  } catch (err) {
    console.error("Issue credential error:", err);
    res.status(500).json({ error: "Failed to issue new credential." });
  }
});

// Admin revoke
app.delete("/api/admin/credentials/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const record = await dbGet("SELECT id, user_id, type FROM credentials WHERE id = ?", [id]);
    if (!record) {
      return res.status(404).json({ error: "Record not found." });
    }

    await dbRun("DELETE FROM credentials WHERE id = ?", [id]);
    
    if (record.user_id) {
      await dbRun("INSERT INTO activity_logs (user_id, action) VALUES (?, ?)", [record.user_id, `Revoked credential ${id}`]);
    }

    res.json({ message: `Credential ${id} revoked.` });
  } catch (err) {
    console.error("Revoke error:", err);
    res.status(500).json({ error: "Failed to revoke." });
  }
});

// Serve frontend build if built (Production fallback)
const reactBuildPath = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(reactBuildPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(reactBuildPath, "index.html"), (err) => {
    if (err) {
      res.status(404).send("API Endpoint or Frontend React bundle not found.");
    }
  });
});

// Initialize DB and Listen
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Database initialization failed:", err);
});
