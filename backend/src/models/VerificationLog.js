const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const VerificationLog = sequelize.define("VerificationLog", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  credential_id: {
    type: DataTypes.STRING
  },
  verifier_ip: {
    type: DataTypes.STRING
  },
  verifier_user_agent: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  verified_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "verification_logs",
  timestamps: false
});

module.exports = VerificationLog;
