const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/echo-db';

const connectMongoDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};

module.exports = { connectMongoDB };
