const mongoose = require('mongoose');

// Define the blueprint for your Gym Members collection
const MemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    membershipType: { type: String, enum: ['Basic', 'Premium', 'VIP'], default: 'Basic' },
    joinDate: { type: Date, default: Date.now }
});

// Compile the blueprint into a database Model
const Member = mongoose.model('Member', MemberSchema);

// Export it so script.js can import and use it
module.exports = { Member };
