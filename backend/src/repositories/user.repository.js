const { User, Credential } = require("../models");
const { Op } = require("sequelize");

class UserRepository {
  async findById(id) {
    const user = await User.findByPk(id);
    return user ? user.toJSON() : null;
  }

  async findByEmail(email) {
    if (!email) return null;
    const user = await User.findOne({
      where: { email: email.toLowerCase().trim() }
    });
    return user ? user.toJSON() : null;
  }

  async findByUsername(username) {
    if (!username) return null;
    const user = await User.findOne({
      where: { username: username.toLowerCase().trim() }
    });
    return user ? user.toJSON() : null;
  }

  async create(userData) {
    const username = userData.username 
      ? userData.username.toLowerCase().trim() 
      : userData.email.split('@')[0].toLowerCase().trim();

    const user = await User.create({
      name: userData.name,
      username: username,
      email: userData.email.toLowerCase().trim(),
      password_hash: userData.password_hash,
      role: userData.role || 'student',
      bio: userData.bio || 'Microsoft Student Club Member',
      headline: userData.headline || 'Student Developer',
      profile_photo: userData.profile_photo || '',
      linkedin_url: userData.linkedin_url || '',
      github_url: userData.github_url || '',
      skills: userData.skills || '{}'
    });

    return user.id;
  }

  async updatePassword(id, passwordHash) {
    return await User.update({ password_hash: passwordHash }, { where: { id } });
  }

  async updateLazyProfile(id, name, passwordHash) {
    return await User.update({ name, password_hash: passwordHash }, { where: { id } });
  }

  async updateRole(id, role) {
    return await User.update({ role }, { where: { id } });
  }

  async getAdminUsersDirectory() {
    const users = await User.findAll({
      order: [['id', 'DESC']]
    });

    const userList = [];
    for (const u of users) {
      const uJson = u.toJSON();
      const credentials = await Credential.findAll({
        where: {
          [Op.or]: [
            { user_id: u.id },
            { recipient_email: u.email.toLowerCase() }
          ]
        }
      });
      uJson.credentials_count = credentials.length;
      uJson.certificates_count = credentials.filter(c => c.type === 'certificate').length;
      uJson.badges_count = credentials.filter(c => c.type === 'badge').length;
      userList.push(uJson);
    }
    return userList;
  }
}

module.exports = new UserRepository();
