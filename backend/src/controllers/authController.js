const User = require('../models/User');

class AuthController {
  async login(request, reply) {
    const { email, password } = request.body;
    const fastify = request.server; // Access fastify instance from request

    try {
      const user = await User.findOne({ where: { email } });
      if (!user) return reply.code(401).send({ error: 'Invalid credentials' });

      const isMatch = await user.validPassword(password);
      if (!isMatch) return reply.code(401).send({ error: 'Invalid credentials' });

      const payload = {
        id: user.id,
        name: user.name,
        role: user.role
      };

      const token = fastify.jwt.sign(payload);

      return reply.send({ token, user: payload });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  }
}

module.exports = new AuthController();