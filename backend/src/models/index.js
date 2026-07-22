const sequelize = require("../config/database");
const User = require("./User");
const Credential = require("./Credential");
const Event = require("./Event");
const Participant = require("./Participant");
const CertificateTemplate = require("./CertificateTemplate");
const ActivityLog = require("./ActivityLog");
const VerificationRequest = require("./VerificationRequest");
const VerificationLog = require("./VerificationLog");
const EmailSent = require("./EmailSent");
const RevokedCredential = require("./RevokedCredential");
const BadgeTemplate = require("./BadgeTemplate");
const BadgeCatalog = require("./BadgeCatalog");
const Collection = require("./Collection");

// Associations
User.hasMany(Credential, { foreignKey: "user_id" });
Credential.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(ActivityLog, { foreignKey: "user_id" });
ActivityLog.belongsTo(User, { foreignKey: "user_id" });

Event.hasMany(Participant, { foreignKey: "event_id" });
Participant.belongsTo(Event, { foreignKey: "event_id" });

module.exports = {
  sequelize,
  User,
  Credential,
  Event,
  Participant,
  CertificateTemplate,
  ActivityLog,
  VerificationRequest,
  VerificationLog,
  EmailSent,
  RevokedCredential,
  BadgeTemplate,
  BadgeCatalog,
  Collection
};
