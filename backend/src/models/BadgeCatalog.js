const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const BadgeCatalog = sequelize.define("BadgeCatalog", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  badge_code: {
    type: DataTypes.STRING
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  organization: {
    type: DataTypes.STRING,
    defaultValue: "Microsoft Student Club PRPCEM"
  },
  release_date: {
    type: DataTypes.STRING,
    defaultValue: "Jul 2026"
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  level: {
    type: DataTypes.STRING,
    defaultValue: "Intermediate"
  },
  icon: {
    type: DataTypes.STRING,
    defaultValue: "fa-trophy"
  },
  gradient: {
    type: DataTypes.STRING,
    defaultValue: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
  },
  bg_light: {
    type: DataTypes.STRING,
    defaultValue: "#ecfdf5"
  },
  accent_color: {
    type: DataTypes.STRING,
    defaultValue: "#059669"
  },
  description: {
    type: DataTypes.TEXT
  },
  criteria: {
    type: DataTypes.TEXT
  },
  skills_list: {
    type: DataTypes.TEXT,
    defaultValue: ""
  },
  earners_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  issuance_frequency: {
    type: DataTypes.STRING,
    defaultValue: "Weekly"
  },
  is_hidden: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: "badge_catalog",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

module.exports = BadgeCatalog;
