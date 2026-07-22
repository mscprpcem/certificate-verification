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

// Convert XP function removed as requested

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
      username TEXT UNIQUE,
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

  // Migrate existing table if username column is missing
  try {
    await dbRun("ALTER TABLE users ADD COLUMN username TEXT");
  } catch (err) {
    // Column already exists
  }

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

  // 4a2. Create Badge Catalog Directory Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS badge_catalog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      badge_code TEXT,
      title TEXT NOT NULL,
      organization TEXT DEFAULT 'Microsoft Student Club PRPCEM',
      release_date TEXT DEFAULT 'Jul 2026',
      category TEXT NOT NULL,
      level TEXT DEFAULT 'Intermediate',
      icon TEXT DEFAULT 'fa-trophy',
      gradient TEXT DEFAULT 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      bg_light TEXT DEFAULT '#ecfdf5',
      accent_color TEXT DEFAULT '#059669',
      description TEXT,
      criteria TEXT,
      skills_list TEXT DEFAULT '',
      earners_count INTEGER DEFAULT 0,
      issuance_frequency TEXT DEFAULT 'Weekly',
      is_hidden INTEGER DEFAULT 0,
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
      `INSERT INTO users (name, username, email, password_hash, role, bio, headline, xp, level) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ["MSC Club Admin", "admin", "admin@mscprpcem.tech", adminHash, "admin", "MSC PRPCEM Administrator", "Chapter Advisor", 5000, "Ambassador"]
    );

    // Student account (Amit Kumar Yadav)
    const amitSkills = JSON.stringify({
      "Cloud": 5,
      "Java": 4,
      "AI": 3,
      "Leadership": 5
    });
    
    await dbRun(
      `INSERT INTO users (name, username, email, password_hash, role, bio, headline, profile_photo, linkedin_url, github_url, skills, xp, level) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "Amit Kumar Yadav", 
        "amityadav",
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

  // Populate username for any existing users without a username
  try {
    await dbRun("UPDATE users SET username = LOWER(REPLACE(name, ' ', '')) WHERE username IS NULL OR username = ''");
    await dbRun("UPDATE users SET username = 'amityadav' WHERE LOWER(email) = 'student@mscprpcem.tech'");
    await dbRun("UPDATE users SET username = 'admin' WHERE LOWER(email) = 'admin@mscprpcem.tech'");
  } catch (err) {
    // Ignore migration updates
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
      console.error("Sheets seeding failed:", err.message);
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
    // Seed Badge Catalog Directory
    const catalogCount = await dbGet("SELECT COUNT(*) as count FROM badge_catalog");
    if (catalogCount.count === 0) {
      const defaultBadges = [
        {
          badge_code: "MSC-BDG-QM",
          title: "Quiz Master Badge",
          organization: "Microsoft Student Club PRPCEM",
          release_date: "Jul 2026",
          category: "Programming & Logic",
          level: "Intermediate",
          icon: "fa-trophy",
          gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          bg_light: "#ecfdf5",
          accent_color: "#059669",
          description: "Mastery of data structures, core algorithms, and rapid technical problem-solving challenges.",
          criteria: "Score 90% or higher in any weekly programming quiz hosted by MSC PRPCEM.",
          skills_list: "Data Structures, Algorithms, Python/C++, Competitive Coding",
          earners_count: 48,
          issuance_frequency: "Weekly",
          is_hidden: 0
        },
        {
          badge_code: "MSC-BDG-AZ",
          title: "Microsoft Azure Specialist",
          organization: "Microsoft Student Club PRPCEM",
          release_date: "Jul 2026",
          category: "Cloud Infrastructure",
          level: "Advanced",
          icon: "fa-cloud",
          gradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          bg_light: "#eff6ff",
          accent_color: "#2563eb",
          description: "Hands-on expertise in Microsoft Azure cloud resource deployment, virtual networks, and cloud architecture.",
          criteria: "Complete all hands-on deployment labs in the Azure Cloud Workshop and pass the practical exam.",
          skills_list: "Azure Portal, Virtual Machines, Cloud Security, App Services",
          earners_count: 34,
          issuance_frequency: "Per Event",
          is_hidden: 0
        },
        {
          badge_code: "MSC-BDG-AI",
          title: "AI Workshop Specialist",
          organization: "Microsoft Student Club PRPCEM",
          release_date: "Jul 2026",
          category: "Artificial Intelligence",
          level: "Advanced",
          icon: "fa-brain",
          gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
          bg_light: "#f5f3ff",
          accent_color: "#7c3aed",
          description: "Practical implementation of machine learning models, OpenAI APIs, and generative AI workflow integration.",
          criteria: "Attend the hands-on AI Workshop, build an interactive prototype, and submit a verified working project.",
          skills_list: "Generative AI, LLM APIs, Python AI, Prompt Engineering",
          earners_count: 29,
          issuance_frequency: "Per Event",
          is_hidden: 0
        },
        {
          badge_code: "MSC-BDG-CE",
          title: "Cloud Explorer Badge",
          organization: "Microsoft Student Club PRPCEM",
          release_date: "Jun 2026",
          category: "Cloud Infrastructure",
          level: "Foundational",
          icon: "fa-cloud-meatball",
          gradient: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
          bg_light: "#f0f9ff",
          accent_color: "#0284c7",
          description: "Fundamental concepts of cloud computing, storage accounts, serverless functions, and basic Azure operations.",
          criteria: "Complete the introductory cloud orientation and lab submission module.",
          skills_list: "Cloud Basics, Blob Storage, Azure CLI, Git Basics",
          earners_count: 62,
          issuance_frequency: "Monthly",
          is_hidden: 0
        },
        {
          badge_code: "MSC-BDG-CTL",
          title: "MSC Core Team Lead",
          organization: "Microsoft Student Club PRPCEM",
          release_date: "May 2026",
          category: "Leadership & Management",
          level: "Officer",
          icon: "fa-shield-halved",
          gradient: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
          bg_light: "#fffbeb",
          accent_color: "#d97706",
          description: "Leadership, event management, and chapter operational governance of Microsoft Student Club PRPCEM.",
          criteria: "Appointed as an official executive officer or core lead for a full academic tenure.",
          skills_list: "Leadership, Project Planning, Team Governance, Public Relations",
          earners_count: 12,
          issuance_frequency: "Annual",
          is_hidden: 0
        },
        {
          badge_code: "MSC-BDG-VA",
          title: "Volunteer Advocate",
          organization: "Microsoft Student Club PRPCEM",
          release_date: "Apr 2026",
          category: "Community & Mentorship",
          level: "Foundational",
          icon: "fa-handshake-angle",
          gradient: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
          bg_light: "#fdf2f8",
          accent_color: "#db2777",
          description: "Operational support, logistics coordination, and student onboarding during official MSC workshops and hackathons.",
          criteria: "Serve actively as a volunteer organizer in at least 3 official chapter events.",
          skills_list: "Event Operations, Peer Support, Logistics, Community Building",
          earners_count: 45,
          issuance_frequency: "Semester",
          is_hidden: 0
        },
        {
          badge_code: "MSC-BDG-CS",
          title: "Community Speaker",
          organization: "Microsoft Student Club PRPCEM",
          release_date: "Mar 2026",
          category: "Community & Mentorship",
          level: "Intermediate",
          icon: "fa-microphone",
          gradient: "linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)",
          bg_light: "#ecfeff",
          accent_color: "#0891b2",
          description: "Delivery of technical presentations, tech talks, or peer tutoring sessions at student chapter meetups.",
          criteria: "Lead a tech talk, workshop session, or seminar at an official MSC PRPCEM event.",
          skills_list: "Public Speaking, Technical Teaching, Presentation, Mentorship",
          earners_count: 19,
          issuance_frequency: "Per Event",
          is_hidden: 0
        },
        {
          badge_code: "MSC-BDG-DV",
          title: "DevOps & Version Control Champion",
          organization: "Microsoft Student Club PRPCEM",
          release_date: "Feb 2026",
          category: "Programming & Logic",
          level: "Intermediate",
          icon: "fa-code-branch",
          gradient: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
          bg_light: "#eef2ff",
          accent_color: "#4f46e5",
          description: "Mastery of Git workflows, GitHub Actions CI/CD automation, pull requests, and collaborative repository management.",
          criteria: "Complete the GitHub DevOps bootcamp and configure a working CI/CD workflow pipeline.",
          skills_list: "Git & GitHub, CI/CD Pipelines, Code Review, DevOps",
          earners_count: 31,
          issuance_frequency: "Per Event",
          is_hidden: 0
        }
      ];

      for (const b of defaultBadges) {
        await dbRun(
          `INSERT INTO badge_catalog (badge_code, title, organization, release_date, category, level, icon, gradient, bg_light, accent_color, description, criteria, skills_list, earners_count, issuance_frequency, is_hidden)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            b.badge_code,
            b.title,
            b.organization,
            b.release_date,
            b.category,
            b.level,
            b.icon,
            b.gradient,
            b.bg_light,
            b.accent_color,
            b.description,
            b.criteria,
            b.skills_list,
            b.earners_count,
            b.issuance_frequency,
            b.is_hidden
          ]
        );
      }
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
  initDatabase
};
