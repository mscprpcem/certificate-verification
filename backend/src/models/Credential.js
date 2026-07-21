class Credential {
  static create(data) {
    return {
      id: data.id,
      recipient_name: data.recipient_name,
      recipient_email: data.recipient_email,
      user_id: data.user_id || null,
      type: data.type, // 'certificate' or 'badge'
      title: data.title,
      category: data.category,
      domain: data.domain || null,
      issue_date: data.issue_date,
      description: data.description || null,
      badge_icon: data.badge_icon || null,
      skills_list: data.skills_list || '',
      score: data.score || null
    };
  }
}

module.exports = Credential;
