const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: "student"
  },
  bio: {
    type: DataTypes.TEXT,
    defaultValue: "Microsoft Student Club Member"
  },
  headline: {
    type: DataTypes.STRING,
    defaultValue: "Student Developer"
  },
  profile_photo: {
    type: DataTypes.TEXT,
    defaultValue: ""
  },
  linkedin_url: {
    type: DataTypes.STRING,
    defaultValue: ""
  },
  github_url: {
    type: DataTypes.STRING,
    defaultValue: ""
  },
  skills: {
    type: DataTypes.TEXT,
    defaultValue: "{}"
  },
  xp: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  level: {
    type: DataTypes.STRING,
    defaultValue: "Explorer"
  }
}, {
  tableName: "users",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

module.exports = User;
