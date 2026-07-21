class User {
  static create(data) {
    return {
      name: data.name || '',
      email: data.email || '',
      password_hash: data.password_hash || null,
      role: data.role || 'student',
      bio: data.bio || 'Microsoft Student Club Member',
      headline: data.headline || 'Student Developer',
      profile_photo: data.profile_photo || '',
      linkedin_url: data.linkedin_url || '',
      github_url: data.github_url || '',
      skills: data.skills || '{}',
      xp: data.xp || 0,
      level: data.level || 'Explorer'
    };
  }
}

module.exports = User;
