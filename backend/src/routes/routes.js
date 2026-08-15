const authController = require('../controllers/authController');
const dashboardController = require('../controllers/dashboardController');
const leaveController = require('../controllers/leaveController');

module.exports = async function (fastify, options) {
  // Auth Routes
  fastify.post('/api/auth/login', authController.login);

  // Dashboard Route
  fastify.get('/api/dashboard', {
    preHandler: [fastify.authenticate]
  }, dashboardController.getDashboard);

  // Leave Routes
  fastify.get('/api/leave-types', {
    preHandler: [fastify.authenticate]
  }, leaveController.getLeaveTypes);

  fastify.post('/api/leaves', {
    preHandler: [fastify.authenticate]
  }, leaveController.submitLeave);

  // NEW: Get all leave requests (for managers)
  fastify.get('/api/leaves', {
    preHandler: [fastify.authenticate]
  }, leaveController.getLeaveRequests);
};