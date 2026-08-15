const authController = require('../controllers/authController');
const dashboardController = require('../controllers/dashboardController');

module.exports = async function (fastify, options) {
  // Public Route
  fastify.post('/api/auth/login', authController.login);

  // Protected Route
  fastify.get('/api/dashboard', {
    preHandler: [fastify.authenticate]
  }, dashboardController.getDashboard);
};