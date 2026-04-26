const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing MongoDB Atlas connection...');

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('Successfully connected to MongoDB Atlas!');
    process.exit(0);
})
.catch(err => {
    console.error(' Connection failed:', err.message);
    process.exit(1);
});