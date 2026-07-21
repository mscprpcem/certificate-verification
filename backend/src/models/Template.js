class Template {
  static create(data) {
    return {
      title: data.title,
      type: data.type,
      category: data.category,
      description: data.description || '',
      badge_icon: data.badge_icon || 'fa-award',
      skills_list: data.skills_list || ''
    };
  }
}

module.exports = Template;
