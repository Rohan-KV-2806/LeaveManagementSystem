const fp = require('fastify-plugin');
const jwt = require('@fastify/jwt');

async function authPlugin(fastify, options) {
  fastify.register(jwt, {
    secret: process.env.JWT_SECRETE_KEY
  });

  // Decorate fastify instance with an authenticate method
  fastify.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized: Invalid or missing token' });
    }
  });
}

module.exports = fp(authPlugin);