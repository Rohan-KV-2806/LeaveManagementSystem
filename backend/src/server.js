const fastify = require('fastify')({ logger: true });
require('dotenv').config();
const sequelize = require('./config/database');
const User = require('./models/User'); // Import to sync

// 1. Register CORS Plugin FIRST
fastify.register(require('@fastify/cors'), {
  origin: '*', // Allow all origins (for development). You can restrict this to 'http://localhost:5173' later.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});

// 2. Register Auth Plugin
const authPlugin = require('./plugins/auth');
fastify.register(authPlugin);

// 3. Register Routes
// Using fastify.register for routes ensures prefixing and scope work correctly
const registerRoutes = require('./routes/routes');
fastify.register(registerRoutes);

// Start Server & Sync DB
const start = async () => {
  try {
    // Connect to PostgreSQL and sync models
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    await sequelize.sync({ alter: true }); 
    console.log('Database synced.');

    // Start Fastify
    await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
    console.log(`Server running on http://localhost:${process.env.PORT || 3000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();