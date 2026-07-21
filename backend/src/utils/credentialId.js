module.exports = {
  generateId(type) {
    const rand = Math.floor(10000 + Math.random() * 90000);
    const prefix = type === "certificate" ? "CRT" : "BDG";
    return `MSC-${prefix}-${rand}`;
  }
};
