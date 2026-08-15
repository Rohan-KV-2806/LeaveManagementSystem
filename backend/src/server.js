const fastify = require('fastify')({ logger: true });
require('dotenv').config();
const sequelize = require('./config/database');

// Import Models
const User = require('./models/User');
const LeaveType = require('./models/LeaveType');
const LeaveRequest = require('./models/LeaveRequest');
const Approval = require('./models/Approval');

// Register CORS Plugin
fastify.register(require('@fastify/cors'), {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});

// Register Auth Plugin
const authPlugin = require('./plugins/auth');
fastify.register(authPlugin);

// Register Routes
const registerRoutes = require('./routes/routes');
fastify.register(registerRoutes);

// Start Server & Sync DB
const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Setup Associations
    User.hasMany(LeaveRequest, { foreignKey: 'userId' });
    LeaveRequest.belongsTo(User, { foreignKey: 'userId' });

    LeaveType.hasMany(LeaveRequest, { foreignKey: 'leaveTypeId' });
    LeaveRequest.belongsTo(LeaveType, { foreignKey: 'leaveTypeId' });

    LeaveRequest.hasOne(Approval, { foreignKey: 'leaveRequestId' });
    Approval.belongsTo(LeaveRequest, { foreignKey: 'leaveRequestId' });
    Approval.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });

    // Sync models
    await sequelize.sync({ alter: true });
    console.log('Database synced.');

    await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
    console.log(`Server running on http://localhost:${process.env.PORT || 3000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();