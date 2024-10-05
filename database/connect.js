const mongoose = require('mongoose');


// Connect to MongoDB
const connectDB = (url) => {
    return mongoose.connect(url);
};

module.exports = connectDB;

