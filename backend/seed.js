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

    // Insert Leave Types (upsert so re-running updates existing rows too)
    await LeaveType.upsert({ name: 'Annual Leave', description: 'Paid yearly vacation', daysPerYear: 20 });
    await LeaveType.upsert({ name: 'Sick Leave', description: 'Medical leave', daysPerYear: 10 });
    await LeaveType.upsert({ name: 'Casual Leave', description: 'Short personal leave', daysPerYear: 12 });
    console.log('Leave Types inserted.');

    console.log('\n--- SEEDING COMPLETE ---');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();