module.exports = {
  formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }
};
