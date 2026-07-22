const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const VerificationRequest = sequelize.define("VerificationRequest", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  student_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  student_email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  credential_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  evidence_url: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "pending"
  },
  submitted_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  reviewed_at: {
    type: DataTypes.DATE
  },
  reviewer_notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: "verification_requests",
  timestamps: false
});

module.exports = VerificationRequest;
