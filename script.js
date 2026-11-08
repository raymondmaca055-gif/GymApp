const mongoose = require('mongoose');

// Connect to a local database named 'gymAppDB'
const mongoURI = 'mongodb://localhost:27017/gymAppDB'; 

mongoose.connect(mongoURI)
  .then(() => console.log('Successfully connected to MongoDB!'))
  .catch(err => console.error('Database connection error:', err));
