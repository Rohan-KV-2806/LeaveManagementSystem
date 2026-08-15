const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('employee', 'manager'),
    allowNull: false,
    defaultValue: 'employee'
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    // Hash password before creating user
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    // Hash password if it is updated
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance method to compare passwords
User.prototype.validPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// --- Associations ---
const LeaveRequest = require('./LeaveRequest');

// A User can make many leave requests
User.hasMany(LeaveRequest, { 
  foreignKey: 'userId', 
  as: 'leaveRequests' 
});

// A Manager can approve many leave requests
User.hasMany(LeaveRequest, { 
  foreignKey: 'managerId', 
  as: 'managedRequests' 
});

module.exports = User;