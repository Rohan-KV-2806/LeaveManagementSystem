const authController = require('../controllers/authController');
const dashboardController = require('../controllers/dashboardController');
const leaveController = require('../controllers/leaveController');
const userController = require('../controllers/userController');

module.exports = async function (fastify, options) {
  // Auth Routes
  fastify.post('/api/auth/login', authController.login);

  // Create an employee account (managers only)
  fastify.post('/api/users', {
    preHandler: [fastify.authenticate, fastify.requireRole('manager')]
  }, userController.createEmployee);

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

  // Current user's leave history
  fastify.get('/api/leaves/history', {
    preHandler: [fastify.authenticate]
  }, leaveController.getMyHistory);

  // Get all leave requests (managers only)
  fastify.get('/api/leaves', {
    preHandler: [fastify.authenticate, fastify.requireRole('manager')]
  }, leaveController.getLeaveRequests);

  // Approve / Reject leave requests (managers only)
  fastify.patch('/api/leaves/:id/approve', {
    preHandler: [fastify.authenticate, fastify.requireRole('manager')]
  }, leaveController.approveLeave);

  fastify.patch('/api/leaves/:id/reject', {
    preHandler: [fastify.authenticate, fastify.requireRole('manager')]
  }, leaveController.rejectLeave);
};
