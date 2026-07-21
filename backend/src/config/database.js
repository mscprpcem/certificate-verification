const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const env = require("./env");

const db = new sqlite3.Database(env.DB_PATH);

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

// Convert XP to Level title
function calculateLevel(xp) {
  if (xp >= 5000) return "Ambassador";
  if (xp >= 2500) return "Expert";
  if (xp >= 1200) return "Innovator";
  if (xp >= 500) return "Contributor";
  return "Explorer";
}

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

  // 3a. Create Verification Requests Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS verification_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_name TEXT NOT NULL,
      student_email TEXT NOT NULL,
      credential_type TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      evidence_url TEXT,
      status TEXT DEFAULT 'pending',
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reviewed_at DATETIME,
      reviewer_notes TEXT
    )
  `);

  // 3b. Create Verification Logs Table (logs verifiers checking credentials)
  await dbRun(`
    CREATE TABLE IF NOT EXISTS verification_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      credential_id TEXT,
      verifier_ip TEXT,
      verifier_user_agent TEXT,
      status TEXT NOT NULL,
      verified_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

  // 4c. Create Revoked Credentials Log Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS revoked_credentials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      credential_id TEXT NOT NULL,
      recipient_name TEXT NOT NULL,
      recipient_email TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      revoked_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 4a. Create Badge & Cert Templates Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS badge_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      badge_icon TEXT DEFAULT 'fa-award',
      skills_list TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 4b. Create Collections/Pathways Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      badge_ids TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 5. Seed Users
  const usersCount = await dbGet("SELECT COUNT(*) as count FROM users");
  if (usersCount.count === 0) {
    console.log("Seeding default accounts...");
    const bcrypt = require("bcryptjs");
    const adminHash = await bcrypt.hash("admin123", 10);
    const studentHash = await bcrypt.hash("password123", 10);

    // Admin account
    await dbRun(
      `INSERT INTO users (name, email, password_hash, role, bio, headline, xp, level) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ["MSC Club Admin", "admin@mscprpcem.tech", adminHash, "admin", "MSC PRPCEM Administrator", "Chapter Advisor", 5000, "Ambassador"]
    );

    // Student account (Amit Kumar Yadav)
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
        "/assets/MSC_logo.png",
        "https://linkedin.com/in/amityadav", 
        "https://github.com/amityadav", 
        amitSkills,
        1840,
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
      const eventsRes = await fetch(env.EVENT_API);
      const teamRes = await fetch(env.TEAM_API);

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
      console.error("Sheets seeding failed, using fallback default credentials:", err.message);
    }

    // Default fallback certificates if count is still 0
    const credCheck = await dbGet("SELECT COUNT(*) as count FROM credentials");
    if (credCheck.count === 0) {
      const amit = await dbGet("SELECT id FROM users WHERE email = 'student@mscprpcem.tech'");
      const amitId = amit ? amit.id : null;

      const defaultCreds = [
        {
          id: "MSC-EVT-2026-00101",
          name: "Amit Kumar Yadav",
          email: "student@mscprpcem.tech",
          userId: amitId,
          type: "certificate",
          title: "Copilot Dev Days",
          category: "Event",
          date: "10 July 2026",
          desc: "Successfully completed the club program event Copilot Dev Days with excellence."
        },
        {
          id: "MSC-EVT-2025-00102",
          name: "Amit Kumar Yadav",
          email: "student@mscprpcem.tech",
          userId: amitId,
          type: "certificate",
          title: "GitLit — The Diwali Code Fest",
          category: "Event",
          date: "10 November 2025",
          desc: "Verified participant in the GitLit — The Diwali Code Fest during the academic year 2025."
        },
        {
          id: "MSC-EVT-2025-00103",
          name: "Amit Kumar Yadav",
          email: "student@mscprpcem.tech",
          userId: amitId,
          type: "certificate",
          title: ".NET Conf 2025 Amravati",
          category: "Event",
          date: "09 January 2026",
          desc: "Verified participant in .NET Conf Amravati 2025, developer-focused conference on .NET and AI."
        },
        {
          id: "MSC-TEAM-20252026-00101",
          name: "Amit Kumar Yadav",
          email: "student@mscprpcem.tech",
          userId: amitId,
          type: "badge",
          title: "Core Team Badge",
          category: "Badge",
          date: "01 August 2025",
          desc: "Issued to verified member of the MSC PRPCEM core team holding the role: Cloud Lead."
        }
      ];

      for (const c of defaultCreds) {
        await dbRun(
          `INSERT OR IGNORE INTO credentials (id, recipient_name, recipient_email, user_id, type, title, category, issue_date, description, badge_icon, skills_list)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'fa-award', 'Technology, Collaboration')`,
          [c.id, c.name, c.email, c.userId, c.type, c.title, c.category, c.date, c.desc]
        );
      }
      console.log("Fallback credentials seeded successfully.");
    }

    // Seed Amit's Activity Logs
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

    // Seed Verification Requests
    const reqsCount = await dbGet("SELECT COUNT(*) as count FROM verification_requests");
    if (reqsCount.count === 0) {
      const requests = [
        { name: "John Doe", email: "john.doe@mscprpcem.tech", type: "certificate", title: "Azure Cloud Fundamentals Workshop", category: "Event", evidence: "https://github.com/johndoe/msc-cloud-cert", status: "pending", submitted: "2026-07-20 10:15:00" },
        { name: "Jane Smith", email: "jane.smith@mscprpcem.tech", type: "badge", title: "Technical Writer Lead", category: "Badge", evidence: "https://medium.com/@janesmith/msc-contributions", status: "pending", submitted: "2026-07-20 14:45:00" },
        { name: "Amit Kumar Yadav", email: "student@mscprpcem.tech", type: "certificate", title: "Advanced Copilot Integration", category: "AI Workshop", evidence: "https://github.com/amityadav/copilot-demo", status: "approved", submitted: "2026-07-18 09:00:00", reviewed: "2026-07-18 16:30:00", notes: "Excellent Copilot implementation, badge & certificate issued." },
        { name: "Rohit Sharma", email: "rohit.sharma@mscprpcem.tech", type: "badge", title: "Web Dev Core Member", category: "Badge", evidence: "https://github.com/rohit/msc-website", status: "approved", submitted: "2026-07-15 11:00:00", reviewed: "2026-07-16 10:00:00", notes: "Contributor status verified." }
      ];
      for (const r of requests) {
        await dbRun(
          `INSERT INTO verification_requests (student_name, student_email, credential_type, title, category, evidence_url, status, submitted_at, reviewed_at, reviewer_notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [r.name, r.email, r.type, r.title, r.category, r.evidence, r.status, r.submitted, r.reviewed || null, r.notes || null]
        );
      }
    }

    // Seed Verification Logs
    const logsCount = await dbGet("SELECT COUNT(*) as count FROM verification_logs");
    if (logsCount.count === 0) {
      const vlogs = [
        { cred_id: "MSC-TEAM-20252026-00101", ip: "192.168.1.50", ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1", status: "success", verified: "2026-07-21 08:30:00" },
        { cred_id: "MSC-EVT-2026-00105", ip: "203.0.113.12", ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36", status: "success", verified: "2026-07-21 07:15:00" },
        { cred_id: "MSC-EVT-2026-00102", ip: "198.51.100.42", ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36", status: "success", verified: "2026-07-20 18:45:00" },
        { cred_id: "MSC-FAKE-99999", ip: "198.51.100.99", ua: "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36", status: "not_found", verified: "2026-07-20 12:20:00" }
      ];
      for (const vl of vlogs) {
        await dbRun(
          `INSERT INTO verification_logs (credential_id, verifier_ip, verifier_user_agent, status, verified_at)
           VALUES (?, ?, ?, ?, ?)`,
          [vl.cred_id, vl.ip, vl.ua, vl.status, vl.verified]
        );
      }
    }

    // Seed Badge & Cert Templates
    const templatesCount = await dbGet("SELECT COUNT(*) as count FROM badge_templates");
    if (templatesCount.count === 0) {
      const defaultTemplates = [
        { title: "Azure Cloud Specialist", type: "badge", category: "Cloud", description: "Awarded for completing advanced Azure Cloud architectures lab and deployment sandbox projects.", icon: "fa-cloud", skills: "Azure, Cloud Architecture, DevOps" },
        { title: "AI Builder Core", type: "badge", category: "AI Workshop", description: "Awarded for building and deploying real-world AI applications with Gemini & Copilot SDKs.", icon: "fa-brain", skills: "AI, Gemini API, Prompt Engineering" },
        { title: "Full-Stack Web Architect", type: "certificate", category: "Web Development", description: "Awarded for engineering fully functional, responsive modern web architectures.", icon: "fa-code", skills: "React, Node.js, Web Design" },
        { title: "MSC Leadership Council Member", type: "badge", category: "Leadership", description: "Awarded to student officers who run the daily chapter operations and organize community hackathons.", icon: "fa-shield-halved", skills: "Leadership, Community Organizing, Strategy" }
      ];
      for (const t of defaultTemplates) {
        await dbRun(
          `INSERT INTO badge_templates (title, type, category, description, badge_icon, skills_list)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [t.title, t.type, t.category, t.description, t.icon, t.skills]
        );
      }
    }

    // Seed Learning Pathways / Collections
    const collectionsCount = await dbGet("SELECT COUNT(*) as count FROM collections");
    if (collectionsCount.count === 0) {
      const defaultCollections = [
        { name: "Cloud & Intelligent Agents Pathway", description: "Complete the Azure Cloud Specialist and AI Builder Core modules to establish full competencies in modern cloud architectures.", badges: "1,2" },
        { name: "Core Software Engineer Track", description: "Includes the Full-Stack Web Architect certificate and the standard workshop training milestones.", badges: "3" }
      ];
      for (const col of defaultCollections) {
        await dbRun(
          `INSERT INTO collections (name, description, badge_ids)
           VALUES (?, ?, ?)`,
          [col.name, col.description, col.badges]
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
  calculateLevel,
  initDatabase
};
