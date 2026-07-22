const authService = require("../services/auth.service");
const userRepository = require("../repositories/user.repository");

class AuthController {
  async checkUsername(req, res, next) {
    try {
      const { username } = req.query;
      if (!username || !username.trim()) {
        return res.status(400).json({ available: false, error: "Username is required." });
      }
      const cleanUsername = username.toLowerCase().trim();

      if (!/^[a-zA-Z0-9_-]{3,20}$/.test(cleanUsername)) {
        return res.status(400).json({
          available: false,
          error: "Username must be 3-20 characters long (letters, numbers, _ or -)."
        });
      }

      const existingUser = await userRepository.findByUsername(cleanUsername);
      if (existingUser) {
        return res.json({ available: false, error: "Username is already taken. Please choose another username." });
      }

      return res.json({ available: true, message: "Username is available!" });
    } catch (err) {
      next(err);
    }
  }

  async register(req, res, next) {
    const { name, email, password, username } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required." });
    }

    try {
      const user = await authService.register(name, email, password, username);
      
      req.session.userId = user.id;
      req.session.email = user.email;
      req.session.name = user.name;
      req.session.role = user.role;

      res.status(201).json({
        message: "Registration successful",
        user: { id: user.id, name: user.name, username: user.username, email: user.email, role: user.role }
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async login(req, res, next) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    try {
      const user = await authService.login(email, password);

      req.session.userId = user.id;
      req.session.email = user.email;
      req.session.name = user.name;
      req.session.role = user.role;

      res.json({
        message: "Login successful",
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async lazyLogin(req, res, next) {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email address is required." });
    }

    try {
      const user = await authService.lazyLogin(email);

      req.session.userId = user.id;
      req.session.email = user.email;
      req.session.name = user.name;
      req.session.role = user.role;

      res.json({
        message: "Lazy login successful, wallet linked.",
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getMe(req, res, next) {
    if (!req.session || !req.session.userId) {
      return res.json({ user: null });
    }
    try {
      const user = await authService.verifySession(req.session.userId);
      res.json({ user });
    } catch (err) {
      res.status(500).json({ error: "Session load error." });
    }
  }

  logout(req, res, next) {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ error: "Logout failed." });
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out" });
    });
  }
}

module.exports = new AuthController();
