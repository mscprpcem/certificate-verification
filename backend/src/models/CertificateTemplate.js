const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CertificateTemplate = sequelize.define("CertificateTemplate", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  template_url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: "Event"
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: "certificate_templates",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

module.exports = CertificateTemplate;
