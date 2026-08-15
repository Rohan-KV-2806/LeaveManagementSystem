const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Approval = sequelize.define('Approval', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  status: {
    type: DataTypes.ENUM('approved', 'rejected'),
    allowNull: false
  },
  comments: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'approvals',
  timestamps: true
});

module.exports = Approval;