const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Use mongoose to connect to MongoDB
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });

        // Log when connected to MongoDB
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

module.exports = connectDB;
