const prisma = require("../config/database");

class UserRepository {
  async findById(id) {
    if (!id) return null;
    return await prisma.user.findUnique({
      where: { id: Number(id) }
    });
  }

  async findByEmail(email) {
    if (!email) return null;
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
  }

  async findByUsername(username) {
    if (!username) return null;
    return await prisma.user.findUnique({
      where: { username: username.toLowerCase().trim() }
    });
  }

  async create(userData) {
    const username = userData.username 
      ? userData.username.toLowerCase().trim() 
      : userData.email.split('@')[0].toLowerCase().trim();

    const user = await prisma.user.create({
      data: {
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
      }
    });

    return user.id;
  }

  async updatePassword(id, passwordHash) {
    return await prisma.user.update({
      where: { id: Number(id) },
      data: { password_hash: passwordHash }
    });
  }

  async updateLazyProfile(id, name, passwordHash) {
    return await prisma.user.update({
      where: { id: Number(id) },
      data: { name, password_hash: passwordHash }
    });
  }

  async updateRole(id, role) {
    return await prisma.user.update({
      where: { id: Number(id) },
      data: { role }
    });
  }

  async updateXpAndLevel(id, xp, level) {
    return await prisma.user.update({
      where: { id: Number(id) },
      data: {
        xp: Number(xp),
        level: level
      }
    });
  }

  async getAdminUsersDirectory() {
    const users = await prisma.user.findMany({
      orderBy: { id: 'desc' },
      include: { credentials: true }
    });

    return users.map(u => {
      const credentials = u.credentials || [];
      return {
        ...u,
        credentials_count: credentials.length,
        certificates_count: credentials.filter(c => c.type === 'certificate').length,
        badges_count: credentials.filter(c => c.type === 'badge').length
      };
    });
  }
}

module.exports = new UserRepository();
