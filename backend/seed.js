require('dotenv').config();
const sequelize = require('./src/config/database');
const User = require('./src/models/User');
const LeaveType = require('./src/models/LeaveType');

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');

    await sequelize.sync({ alter: true });
    console.log('Tables synced...');

    // Insert Users
    await User.findOrCreate({
      where: { email: 'john@meowmeow.com' },
      defaults: { name: 'John', email: 'john@meowmeow.com', password: 'password123', role: 'employee' }
    });
    
    await User.findOrCreate({
      where: { email: 'meowboss@meowmeow.com' },
      defaults: { name: 'MeowBoss', email: 'meowboss@meowmeow.com', password: 'password123', role: 'manager' }
    });
    console.log('Users inserted.');

    // Insert Leave Types
    await LeaveType.findOrCreate({ where: { name: 'Annual Leave' }, defaults: { description: 'Paid yearly vacation' } });
    await LeaveType.findOrCreate({ where: { name: 'Sick Leave' }, defaults: { description: 'Medical leave' } });
    await LeaveType.findOrCreate({ where: { name: 'Casual Leave' }, defaults: { description: 'Short personal leave' } });
    console.log('Leave Types inserted.');

    console.log('\n--- SEEDING COMPLETE ---');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();