const User = require('../models/User');

class UserController {
  // POST /api/users (managers only) — create an employee account
  async createEmployee(request, reply) {
    const { name, email, password } = request.body || {};

    if (!name || !email || !password) {
      return reply.code(400).send({ error: 'Name, email and password are required' });
    }

    try {
      const user = await User.create({ name, email, password, role: 'employee' });
      return reply.code(201).send({
        message: 'Employee created successfully',
        data: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.code(400).send({ error: 'An account with this email already exists' });
      }
      if (error.name === 'SequelizeValidationError') {
        return reply.code(400).send({ error: error.errors[0].message });
      }
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  }
}

module.exports = new UserController();
