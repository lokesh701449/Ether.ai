/**
 * Seed script — populates the database with realistic demo data
 * Run: node seed.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Task.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create Users
    const admin = await User.create({
      name: 'Lokesh Chalasani',
      email: 'lokesh@ethara.ai',
      password: 'admin123',
      role: 'admin'
    });

    const priya = await User.create({
      name: 'Priya Sharma',
      email: 'priya@ethara.ai',
      password: 'member123',
      role: 'member'
    });

    const rahul = await User.create({
      name: 'Rahul Verma',
      email: 'rahul@ethara.ai',
      password: 'member123',
      role: 'member'
    });

    const ananya = await User.create({
      name: 'Ananya Reddy',
      email: 'ananya@ethara.ai',
      password: 'member123',
      role: 'member'
    });

    console.log('👥 Created 4 users (1 admin, 3 members)');

    // Create Projects
    const ecommerce = await Project.create({
      name: 'E-Commerce Platform',
      description: 'Full-stack e-commerce app with payments, product catalog, and order management',
      owner: admin._id,
      members: [admin._id, priya._id, rahul._id]
    });

    const mobileApp = await Project.create({
      name: 'Mobile Banking App',
      description: 'React Native banking application with biometric authentication and UPI integration',
      owner: admin._id,
      members: [admin._id, ananya._id, rahul._id]
    });

    const analytics = await Project.create({
      name: 'Analytics Dashboard',
      description: 'Real-time data visualization dashboard with charts, filters, and export functionality',
      owner: admin._id,
      members: [admin._id, priya._id, ananya._id]
    });

    console.log('📁 Created 3 projects');

    // Helper for dates
    const daysFromNow = (d) => { const dt = new Date(); dt.setDate(dt.getDate() + d); return dt; };

    // Create Tasks — E-Commerce Platform
    const tasks = [
      { title: 'Design product catalog UI', description: 'Create wireframes and high-fidelity mockups for the product listing and detail pages', project: ecommerce._id, assignedTo: priya._id, createdBy: admin._id, status: 'done', priority: 'high', dueDate: daysFromNow(-3) },
      { title: 'Implement user authentication', description: 'Setup JWT-based login and registration with email verification', project: ecommerce._id, assignedTo: rahul._id, createdBy: admin._id, status: 'done', priority: 'high', dueDate: daysFromNow(-2) },
      { title: 'Build shopping cart API', description: 'RESTful endpoints for add/remove/update cart items with session persistence', project: ecommerce._id, assignedTo: rahul._id, createdBy: admin._id, status: 'in-progress', priority: 'high', dueDate: daysFromNow(2) },
      { title: 'Integrate Razorpay payments', description: 'Payment gateway integration with order confirmation and receipt generation', project: ecommerce._id, assignedTo: priya._id, createdBy: admin._id, status: 'todo', priority: 'high', dueDate: daysFromNow(5) },
      { title: 'Setup order tracking system', description: 'Real-time order status updates with email notifications', project: ecommerce._id, assignedTo: rahul._id, createdBy: admin._id, status: 'todo', priority: 'medium', dueDate: daysFromNow(7) },
      { title: 'Write API documentation', description: 'Swagger/OpenAPI docs for all backend endpoints', project: ecommerce._id, assignedTo: priya._id, createdBy: admin._id, status: 'todo', priority: 'low', dueDate: daysFromNow(10) },

      // Mobile Banking App
      { title: 'Setup React Native project', description: 'Initialize project with navigation, state management, and folder structure', project: mobileApp._id, assignedTo: ananya._id, createdBy: admin._id, status: 'done', priority: 'high', dueDate: daysFromNow(-5) },
      { title: 'Implement biometric login', description: 'Face ID and fingerprint authentication using expo-local-authentication', project: mobileApp._id, assignedTo: ananya._id, createdBy: admin._id, status: 'in-progress', priority: 'high', dueDate: daysFromNow(1) },
      { title: 'Build UPI payment module', description: 'UPI intent-based payments with QR code scanning', project: mobileApp._id, assignedTo: rahul._id, createdBy: admin._id, status: 'todo', priority: 'high', dueDate: daysFromNow(4) },
      { title: 'Design transaction history screen', description: 'Filterable list of transactions with search and date range picker', project: mobileApp._id, assignedTo: ananya._id, createdBy: admin._id, status: 'todo', priority: 'medium', dueDate: daysFromNow(6) },
      { title: 'Add push notifications', description: 'Firebase Cloud Messaging for transaction alerts and offers', project: mobileApp._id, assignedTo: rahul._id, createdBy: admin._id, status: 'todo', priority: 'medium', dueDate: daysFromNow(8) },

      // Analytics Dashboard
      { title: 'Setup Chart.js integration', description: 'Configure Chart.js with responsive containers and theme support', project: analytics._id, assignedTo: priya._id, createdBy: admin._id, status: 'done', priority: 'high', dueDate: daysFromNow(-4) },
      { title: 'Build data aggregation API', description: 'Backend endpoints for time-series data with caching layer', project: analytics._id, assignedTo: ananya._id, createdBy: admin._id, status: 'in-progress', priority: 'high', dueDate: daysFromNow(0) },
      { title: 'Create filter components', description: 'Date range, category, and user-based filter widgets', project: analytics._id, assignedTo: priya._id, createdBy: admin._id, status: 'in-progress', priority: 'medium', dueDate: daysFromNow(3) },
      { title: 'Implement CSV/PDF export', description: 'Download reports in CSV and PDF format with custom templates', project: analytics._id, assignedTo: ananya._id, createdBy: admin._id, status: 'todo', priority: 'medium', dueDate: daysFromNow(9) },
      { title: 'Add real-time WebSocket updates', description: 'Live dashboard updates using Socket.io for connected clients', project: analytics._id, assignedTo: priya._id, createdBy: admin._id, status: 'todo', priority: 'low', dueDate: daysFromNow(12) },

      // Overdue tasks (for demo)
      { title: 'Fix product image upload bug', description: 'Images over 5MB cause timeout errors on the upload endpoint', project: ecommerce._id, assignedTo: rahul._id, createdBy: admin._id, status: 'in-progress', priority: 'high', dueDate: daysFromNow(-1) },
      { title: 'Update security dependencies', description: 'npm audit fix for critical vulnerabilities in production', project: mobileApp._id, assignedTo: ananya._id, createdBy: admin._id, status: 'todo', priority: 'high', dueDate: daysFromNow(-2) },
    ];

    await Task.insertMany(tasks);
    console.log(`✅ Created ${tasks.length} tasks`);

    console.log('\n🎉 Seed complete! Here are the login credentials:\n');
    console.log('  Admin:');
    console.log('    Email: lokesh@ethara.ai');
    console.log('    Password: admin123\n');
    console.log('  Members:');
    console.log('    Email: priya@ethara.ai   | Password: member123');
    console.log('    Email: rahul@ethara.ai   | Password: member123');
    console.log('    Email: ananya@ethara.ai  | Password: member123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
