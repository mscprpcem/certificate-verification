const userRepository = require("../repositories/user.repository");

class UserController {
  async getAdminUsers(req, res, next) {
    try {
      const list = await userRepository.getAdminUsersDirectory();
      res.json(list);
    } catch (err) {
      next(err);
    }
  }

  async updateRole(req, res, next) {
    const { id } = req.params;
    const { role } = req.body;
    if (!role || !["student", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role specified." });
    }

    try {
      await userRepository.updateRole(id, role);
      res.json({ success: true, message: "User role updated successfully." });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
