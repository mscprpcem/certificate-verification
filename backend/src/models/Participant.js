const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Participant = sequelize.define("Participant", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  event_id: {
    type: DataTypes.INTEGER
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: "Attendee"
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "Completed"
  }
}, {
  tableName: "participants",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

module.exports = Participant;
