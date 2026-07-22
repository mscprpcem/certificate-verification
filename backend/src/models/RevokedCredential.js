const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RevokedCredential = sequelize.define("RevokedCredential", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  credential_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  recipient_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  recipient_email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
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
  revoked_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "revoked_credentials",
  timestamps: false
});

module.exports = RevokedCredential;
