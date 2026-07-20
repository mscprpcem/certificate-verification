const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const path = require("path");

const dbPath = path.join(__dirname, "credentials.db");
const db = new sqlite3.Database(dbPath);

const eventAPI = "https://opensheet.elk.sh/1G0kQL9J3e8Wn3CxjJEQr91dOfWscOoGFAGF1GvYgbxE/Sheet1";
const teamAPI = "https://opensheet.elk.sh/1G0kQL9J3e8Wn3CxjJEQr91dOfWscOoGFAGF1GvYgbxE/Team";

const dbRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbGet = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Seeding helpers
function getNameValue(item) {
  const knownValue =
    item.Name ||
    item["Name "] ||
    item.name ||
    item.NAME ||
    item["Full Name"] ||
    item["Member Name"];

  if (String(knownValue || "").trim()) {
    return String(knownValue).trim();
  }

  const nameLikeKey = Object.keys(item).find((key) => {
    const normalizedKey = String(key || "").toLowerCase().trim().replace(/\s+/g, " ");
    return normalizedKey === "name" || normalizedKey.includes("name");
  });

  return nameLikeKey ? String(item[nameLikeKey] || "").trim() : "";
}

function getYearValue(item) {
  const knownValue =
    item.Year ||
    item.year ||
    item.YEAR ||
    item["Academic Year"] ||
    item.Batch ||
    item.Class ||
    item["Study Year"];

  if (String(knownValue || "").trim()) {
    return String(knownValue).trim();
  }

  const yearLikeKey = Object.keys(item).find((key) => {
    const normalizedKey = String(key || "").toLowerCase().trim().replace(/\s+/g, " ");
    return normalizedKey === "year" || normalizedKey.includes("year");
  });

  return yearLikeKey ? String(item[yearLikeKey] || "").trim() : "";
}

// Convert XP to Level title
function calculateLevel(xp) {
  if (xp >= 5000) return "Ambassador";
  if (xp >= 2500) return "Expert";
  if (xp >= 1200) return "Innovator";
  if (xp >= 500) return "Contributor";
  return "Explorer";
}

async function initDatabase() {
  console.log("Initializing SQLite Database...");

  // 1. Create Users Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      role TEXT DEFAULT 'student',
      bio TEXT DEFAULT 'Microsoft Student Club Member',
      headline TEXT DEFAULT 'Student Developer',
      profile_photo TEXT DEFAULT '',
      linkedin_url TEXT DEFAULT '',
      github_url TEXT DEFAULT '',
      skills TEXT DEFAULT '{}',
      xp INTEGER DEFAULT 0,
      level TEXT DEFAULT 'Explorer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Create Credentials Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS credentials (
      id TEXT PRIMARY KEY,
      recipient_name TEXT NOT NULL,
      recipient_email TEXT NOT NULL,
      user_id INTEGER,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      domain TEXT,
      issue_date TEXT NOT NULL,
      description TEXT,
      badge_icon TEXT,
      skills_list TEXT DEFAULT '',
      score INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // 3. Create Activity Logs Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // 4. Create Emails Sent Table (Mock Mailbox)
  await dbRun(`
    CREATE TABLE IF NOT EXISTS emails_sent (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipient_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 5. Seed Users
  const usersCount = await dbGet("SELECT COUNT(*) as count FROM users");
  if (usersCount.count === 0) {
    console.log("Seeding default accounts...");
    const adminHash = await bcrypt.hash("admin123", 10);
    const studentHash = await bcrypt.hash("password123", 10);

    // Admin account
    await dbRun(
      `INSERT INTO users (name, email, password_hash, role, bio, headline, xp, level) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ["MSC Club Admin", "admin@mscprpcem.tech", adminHash, "admin", "MSC PRPCEM Administrator", "Chapter Advisor", 5000, "Ambassador"]
    );

    // Student account (Amit Kumar Yadav - pre-seeded with statistics exactly like user prompt)
    const amitSkills = JSON.stringify({
      "Cloud": 5,
      "Java": 4,
      "AI": 3,
      "Leadership": 5
    });
    
    await dbRun(
      `INSERT INTO users (name, email, password_hash, role, bio, headline, profile_photo, linkedin_url, github_url, skills, xp, level) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "Amit Kumar Yadav", 
        "student@mscprpcem.tech", 
        studentHash, 
        "student", 
        "Passionate student developer studying computer science. Cloud Enthusiast and Microsoft technologies builder.", 
        "Cloud Enthusiast", 
        "/assets/MSC_logo.png", // Demo photo
        "https://linkedin.com/in/amityadav", 
        "https://github.com/amityadav", 
        amitSkills,
        1840, // 1840 XP
        "Innovator"
      ]
    );

    console.log("Seeding users completed successfully.");
  }

  // 6. Seed Credentials from Sheet APIs
  const credsCount = await dbGet("SELECT COUNT(*) as count FROM credentials");
  if (credsCount.count === 0) {
    console.log("Seeding credentials from Sheets API...");

    try {
      const eventsRes = await fetch(eventAPI);
      const teamRes = await fetch(teamAPI);

      if (eventsRes.ok && teamRes.ok) {
        const eventsData = await eventsRes.json();
        const teamData = await teamRes.json();

        console.log(`Fetched ${eventsData.length} event records and ${teamData.length} team records from Sheets.`);

        // Insert Events (Certificates)
        for (let i = 0; i < eventsData.length; i++) {
          const item = eventsData[i];
          const name = getNameValue(item);
          const eventTitle = item.Event || "Workshop Participation";
          const year = getYearValue(item) || "2026";
          if (!name) continue;

          // Check if already exists
          const existing = await dbGet("SELECT id FROM credentials WHERE recipient_name = ? AND title = ?", [name, eventTitle]);
          if (existing) continue;

          let email = `${name.toLowerCase().replace(/\s+/g, ".")}@mscprpcem.tech`;
          if (name.toLowerCase() === "amit kumar yadav") {
            email = "student@mscprpcem.tech";
          }

          const user = await dbGet("SELECT id FROM users WHERE LOWER(email) = ?", [email.toLowerCase()]);
          const userId = user ? user.id : null;

          const id = `MSC-EVT-${year}-${String(i + 100).padStart(5, "0")}`;
          
          await dbRun(
            `INSERT OR IGNORE INTO credentials (id, recipient_name, recipient_email, user_id, type, title, category, issue_date, description, badge_icon, skills_list)
             VALUES (?, ?, ?, ?, 'certificate', ?, 'Event', ?, ?, 'fa-award', 'Technology, Collaboration')`,
            [
              id,
              name,
              email,
              userId,
              eventTitle,
              `10 July ${year}`,
              `Verified participant in the ${eventTitle} during the academic year ${year}.`
            ]
          );
        }

        // Insert Teams (Badges)
        for (let i = 0; i < teamData.length; i++) {
          const item = teamData[i];
          const name = getNameValue(item);
          const domain = item.Domain || "Core Team Member";
          const year = getYearValue(item) || "2025-2026";
          if (!name) continue;

          // Check if already exists
          const existing = await dbGet("SELECT id FROM credentials WHERE recipient_name = ? AND domain = ?", [name, domain]);
          if (existing) continue;

          let email = `${name.toLowerCase().replace(/\s+/g, ".")}@mscprpcem.tech`;
          if (name.toLowerCase() === "amit kumar yadav") {
            email = "student@mscprpcem.tech";
          }

          const user = await dbGet("SELECT id FROM users WHERE LOWER(email) = ?", [email.toLowerCase()]);
          const userId = user ? user.id : null;

          const id = `MSC-TEAM-${year.replace("-", "")}-${String(i + 100).padStart(5, "0")}`;

          await dbRun(
            `INSERT OR IGNORE INTO credentials (id, recipient_name, recipient_email, user_id, type, title, category, domain, issue_date, description, badge_icon, skills_list)
             VALUES (?, ?, ?, ?, 'badge', ?, 'Badge', ?, ?, ?, ?, 'Leadership, Teamwork, Management')`,
            [
              id,
              name,
              email,
              userId,
              `${domain} Badge`,
              domain,
              `01 August ${year.split("-")[0]}`,
              `Issued to verified member of the MSC PRPCEM core team holding the role: ${domain} for tenure ${year}.`,
              "fa-shield-halved"
            ]
          );
        }
        console.log("Seeding credentials from Sheets completed successfully.");
      } else {
        console.error("Failed to fetch sheet APIs: status not OK.");
      }
    } catch (err) {
      console.error("Sheets seeding failed:", err.message);
    }

    // 7. Seed Amit's Activity Logs
    const amit = await dbGet("SELECT id FROM users WHERE email = 'student@mscprpcem.tech'");
    const amitId = amit ? amit.id : null;
    if (amitId) {
      const activities = [
        { action: "Earned Microsoft Core Team Badge", timestamp: "2026-07-19 14:32:00" },
        { action: "Completed Workshop Training", timestamp: "2026-07-17 11:20:00" },
        { action: "Profile verified on platform", timestamp: "2026-07-06 09:12:00" }
      ];

      for (const act of activities) {
        await dbRun(
          "INSERT INTO activity_logs (user_id, action, timestamp) VALUES (?, ?, ?)",
          [amitId, act.action, act.timestamp]
        );
      }
    }
  }

  console.log("Database initialized successfully!");
}

module.exports = {
  db,
  dbRun,
  dbAll,
  dbGet,
  initDatabase,
  calculateLevel
};
