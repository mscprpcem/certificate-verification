const env = require("./env");

module.exports = {
  sessionSecret: env.SESSION_SECRET,
  bcryptSaltRounds: 10,
  sessionMaxAge: 24 * 60 * 60 * 1000 // 24 hours
};
