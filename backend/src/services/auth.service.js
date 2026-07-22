const bcrypt = require("bcryptjs");
const userRepository = require("../repositories/user.repository");
const credentialRepository = require("../repositories/credential.repository");
const profileRepository = require("../repositories/profile.repository");
const authConfig = require("../config/auth");

class AuthService {
  async register(name, email, password) {
    const existingUser = await userRepository.findByEmail(email);
    const hashedPassword = await bcrypt.hash(password, authConfig.bcryptSaltRounds);
    let userId;

    if (existingUser) {
      if (!existingUser.password_hash) {
        await userRepository.updateLazyProfile(existingUser.id, name, hashedPassword);
        userId = existingUser.id;
      } else {
        throw new Error("Email is already registered.");
      }
    } else {
      userId = await userRepository.create({
        name,
        email,
        password_hash: hashedPassword,
        role: "student",
        bio: "Microsoft Student Club Member",
        headline: "Student Developer",
        profile_photo: "",
        linkedin_url: "",
        github_url: "",
        skills: "{}"
      });
    }

    // Auto-link credentials
    await credentialRepository.updateUserIdByEmail(userId, email);

    // Log Activity
    await profileRepository.createActivityLog(userId, "Account registered & wallet activated");

    return await userRepository.findById(userId);
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.password_hash) {
      throw new Error("Invalid email or password.");
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error("Invalid email or password.");
    }

    return user;
  }

  async lazyLogin(email) {
    const normEmail = email.toLowerCase().trim();
    let user = await userRepository.findByEmail(normEmail);
    let userId;

    if (!user) {
      const inferredName = normEmail.split("@")[0].split(".").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
      userId = await userRepository.create({
        name: inferredName,
        email: normEmail,
        password_hash: null,
        role: "student",
        bio: "Microsoft Student Club Member",
        headline: "Student Developer",
        profile_photo: "",
        linkedin_url: "",
        github_url: "",
        skills: "{}"
      });
    } else {
      userId = user.id;
    }

    await credentialRepository.updateUserIdByEmail(userId, normEmail);

    await profileRepository.createActivityLog(userId, "First Login - Digital Wallet Linked");

    return await userRepository.findById(userId);
  }

  async verifySession(userId) {
    return await userRepository.findById(userId);
  }
}

module.exports = new AuthService();
