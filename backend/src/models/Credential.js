const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Credential = sequelize.define("Credential", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  recipient_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  recipient_email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true
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
  domain: {
    type: DataTypes.STRING
  },
  issue_date: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  badge_icon: {
    type: DataTypes.STRING
  },
  skills_list: {
    type: DataTypes.TEXT,
    defaultValue: ""
  },
  score: {
    type: DataTypes.INTEGER
  },
  template_url: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: "credentials",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

module.exports = Credential;
