require('dotenv').config();
const sequelize = require('./src/config/database');
const User = require('./src/models/User');

const seedDatabase = async () => {
  try {
    // Connect to DB
    await sequelize.authenticate();
    console.log('Database connected...');

    // Sync models (creates table if it doesn't exist)
    await sequelize.sync({ alter: true });
    console.log('Tables synced...');

    // 1. Insert Employee
    await User.findOrCreate({
      where: { email: 'john@meowmeow.com' },
      defaults: {
        name: 'John',
        email: 'john@meowmeow.com',
        password: 'password123', // The model hook will hash this automatically!
        role: 'employee'
      }
    });
    console.log('Employee inserted: john@meowmeow.com / password123');

    // 2. Insert Manager
    await User.findOrCreate({
      where: { email: 'meowboss@meowmeow.com' },
      defaults: {
        name: 'MeowBoss',
        email: 'meowboss@meowmeow.com',
        password: 'password123', // The model hook will hash this automatically!
        role: 'manager'
      }
    });
    console.log('Manager inserted: meowboss@meowmeow.com / password123');

    console.log('\n--- SEEDING COMPLETE ---');
    console.log('You can now login from your frontend using these credentials.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();