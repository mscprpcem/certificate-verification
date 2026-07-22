const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const EmailSent = sequelize.define("EmailSent", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  recipient_email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  sent_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "emails_sent",
  timestamps: false
});

module.exports = EmailSent;
