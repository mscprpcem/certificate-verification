const bcrypt = require("bcryptjs");
const {
  User,
  Credential,
  Event,
  Participant,
  BadgeCatalog,
  BadgeTemplate,
  Collection,
  ActivityLog,
  VerificationRequest,
  VerificationLog
} = require("../models");

async function seedInitialData() {
  try {
    // 1. Seed Users
    const userCount = await User.count();
    if (userCount === 0) {
      console.log("Seeding default PostgreSQL users...");
      const adminHash = await bcrypt.hash("admin123", 10);
      const studentHash = await bcrypt.hash("password123", 10);

      await User.create({
        name: "MSC Club Admin",
        username: "admin",
        email: "admin@mscprpcem.tech",
        password_hash: adminHash,
        role: "admin",
        bio: "MSC PRPCEM Administrator",
        headline: "Chapter Advisor",
        xp: 5000,
        level: "Ambassador"
      });

      const amitSkills = JSON.stringify({
        "Cloud": 5,
        "Java": 4,
        "AI": 3,
        "Leadership": 5
      });

      await User.create({
        name: "Amit Kumar Yadav",
        username: "amityadav",
        email: "student@mscprpcem.tech",
        password_hash: studentHash,
        role: "student",
        bio: "Passionate student developer studying computer science. Cloud Enthusiast and Microsoft technologies builder.",
        headline: "Cloud Enthusiast",
        profile_photo: "/assets/MSC_logo.png",
        linkedin_url: "https://linkedin.com/in/amityadav",
        github_url: "https://github.com/amityadav",
        skills: amitSkills,
        xp: 1840,
        level: "Innovator"
      });

      console.log("Users seeded successfully.");
    }

    // 2. Seed Events & Participants
    const eventCount = await Event.count();
    if (eventCount === 0) {
      console.log("Seeding default events...");
      const evt1 = await Event.create({
        title: "Copilot Dev Days",
        category: "Event",
        date: "10 July 2026",
        description: "Successfully completed the club program event Copilot Dev Days with excellence."
      });

      const evt2 = await Event.create({
        title: "GitLit — The Diwali Code Fest",
        category: "Event",
        date: "10 November 2025",
        description: "Verified participant in the GitLit — The Diwali Code Fest during the academic year 2025."
      });

      await Participant.create({
        event_id: evt1.id,
        name: "Amit Kumar Yadav",
        email: "student@mscprpcem.tech",
        role: "Attendee",
        status: "Completed"
      });

      await Participant.create({
        event_id: evt2.id,
        name: "Amit Kumar Yadav",
        email: "student@mscprpcem.tech",
        role: "Attendee",
        status: "Completed"
      });
    }

    // 3. Seed Credentials
    const credCount = await Credential.count();
    if (credCount === 0) {
      console.log("Seeding default credentials...");
      const student = await User.findOne({ where: { email: "student@mscprpcem.tech" } });
      const studentId = student ? student.id : null;

      const defaultCreds = [
        {
          id: "MSC-EVT-2026-00101",
          recipient_name: "Amit Kumar Yadav",
          recipient_email: "student@mscprpcem.tech",
          user_id: studentId,
          type: "certificate",
          title: "Copilot Dev Days",
          category: "Event",
          issue_date: "10 July 2026",
          description: "Successfully completed the club program event Copilot Dev Days with excellence.",
          badge_icon: "fa-award",
          skills_list: "Technology, Collaboration"
        },
        {
          id: "MSC-EVT-2025-00102",
          recipient_name: "Amit Kumar Yadav",
          recipient_email: "student@mscprpcem.tech",
          user_id: studentId,
          type: "certificate",
          title: "GitLit — The Diwali Code Fest",
          category: "Event",
          issue_date: "10 November 2025",
          description: "Verified participant in the GitLit — The Diwali Code Fest during the academic year 2025.",
          badge_icon: "fa-award",
          skills_list: "Git, Version Control, Open Source"
        },
        {
          id: "MSC-EVT-2025-00103",
          recipient_name: "Amit Kumar Yadav",
          recipient_email: "student@mscprpcem.tech",
          user_id: studentId,
          type: "certificate",
          title: ".NET Conf 2025 Amravati",
          category: "Event",
          issue_date: "09 January 2026",
          description: "Verified participant in .NET Conf Amravati 2025, developer-focused conference on .NET and AI.",
          badge_icon: "fa-award",
          skills_list: ".NET, C#, AI Integration"
        },
        {
          id: "MSC-TEAM-20252026-00101",
          recipient_name: "Amit Kumar Yadav",
          recipient_email: "student@mscprpcem.tech",
          user_id: studentId,
          type: "badge",
          title: "Core Team Badge",
          category: "Badge",
          domain: "Cloud Lead",
          issue_date: "01 August 2025",
          description: "Issued to verified member of the MSC PRPCEM core team holding the role: Cloud Lead.",
          badge_icon: "fa-shield-halved",
          skills_list: "Leadership, Teamwork, Cloud Architecture"
        }
      ];

      for (const c of defaultCreds) {
        await Credential.findOrCreate({
          where: { id: c.id },
          defaults: c
        });
      }
      console.log("Credentials seeded successfully.");
    }

    // 4. Seed Badge Catalog Directory
    const catalogCount = await BadgeCatalog.count();
    if (catalogCount === 0) {
      console.log("Seeding default badge catalog...");
      const defaultBadges = [
        {
          badge_code: "MSC-BDG-QM",
          title: "Quiz Master Badge",
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
        }
      ];

      for (const b of defaultBadges) {
        await BadgeCatalog.create(b);
      }
    }
  } catch (err) {
    console.error("Seeding warning:", err.message);
  }
}

module.exports = { seedInitialData };
