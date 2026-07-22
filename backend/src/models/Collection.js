const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Collection = sequelize.define("Collection", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  badge_ids: {
    type: DataTypes.STRING
  }
}, {
  tableName: "collections",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

module.exports = Collection;
