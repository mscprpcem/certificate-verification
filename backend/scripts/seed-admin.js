/**
 * Standalone script to create an initial admin account.
 * 
 * Usage:
 *   node scripts/seed-admin.js
 * 
 * Uses environment variables:
 *   INITIAL_ADMIN_EMAIL    (default: admin@mscprpcem.tech)
 *   INITIAL_ADMIN_PASSWORD (default: admin123)
 *   INITIAL_ADMIN_NAME     (default: MSC Club Admin)
 */

const path = require("path");
const dotenv = require("dotenv");

// Load env
dotenv.config({ path: path.join(__dirname, "../../.env") });
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config();

const bcrypt = require("bcryptjs");
const { PrismaClient } = require("../../generated/prisma");

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = (process.env.INITIAL_ADMIN_EMAIL || "admin@mscprpcem.tech").toLowerCase().trim();
  const password = process.env.INITIAL_ADMIN_PASSWORD || "admin123";
  const name = process.env.INITIAL_ADMIN_NAME || "MSC Club Admin";

  console.log(`\n🔐 Admin Seed Script`);
  console.log(`   Email:    ${email}`);
  console.log(`   Name:     ${name}`);
  console.log(`   Password: ${"*".repeat(password.length)}\n`);

  try {
    await prisma.$connect();

    // Check if admin already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      if (existing.role === "admin") {
        console.log(`✓ Admin account already exists for ${email}. No action needed.`);
      } else {
        // Upgrade to admin
        await prisma.user.update({
          where: { id: existing.id },
          data: { role: "admin" }
        });
        console.log(`✓ Upgraded existing user ${email} to admin role.`);
      }
    } else {
      const hash = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          name,
          username: email.split("@")[0].replace(/[^a-zA-Z0-9_-]/g, "").substring(0, 20),
          email,
          password_hash: hash,
          role: "admin",
          bio: "MSC PRPCEM Administrator",
          headline: "Admin"
        }
      });
      console.log(`✓ Admin account created successfully: ${email}`);
    }

    console.log(`\n  You can now log in at the admin panel with these credentials.\n`);
  } catch (err) {
    console.error("✗ Error creating admin:", err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
