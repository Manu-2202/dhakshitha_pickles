const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const MONGO_URI = "mongodb://manukamepalli8399_db_user:manu%4012345@ac-9m58rqe-shard-00-00.jutmhqc.mongodb.net:27017,ac-9m58rqe-shard-00-01.jutmhqc.mongodb.net:27017,ac-9m58rqe-shard-00-02.jutmhqc.mongodb.net:27017/?ssl=true&replicaSet=atlas-o0bv7h-shard-0&authSource=admin&appName=DakshithaPickles";

async function createAdmin() {
  try {
    console.log('⏳ Connecting to Cloud DB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected.');

    console.log('⏳ Creating Admin user...');
    await Admin.deleteMany({}); // Delete old ones
    await Admin.create({ secretKey: 'DAKSHITHA_ADMIN' });
    
    console.log('============================================');
    console.log('✅ SUCCESS: Admin User Created!');
    console.log('🔑 KEY: DAKSHITHA_ADMIN');
    console.log('============================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ ERROR:', err.message);
    process.exit(1);
  }
}

createAdmin();
