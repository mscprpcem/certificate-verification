const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Event = sequelize.define("Event", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: "Event"
  },
  date: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: "events",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

module.exports = Event;
