const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const BadgeTemplate = sequelize.define("BadgeTemplate", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  badge_icon: {
    type: DataTypes.STRING,
    defaultValue: "fa-award"
  },
  skills_list: {
    type: DataTypes.TEXT,
    defaultValue: ""
  }
}, {
  tableName: "badge_templates",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

module.exports = BadgeTemplate;
