const mongoose = require('mongoose');

// 1. MEMBERS COLLECTION ('members')
const memberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['member', 'admin'], default: 'member' },
    photoUrl: { type: String, default: '' },
    birthdate: { type: Date },
    heightCm: { type: Number },
    weightKg: { type: Number },
    membershipStart: { type: Date, default: Date.now },
    membershipExpiry: { type: Date }
});

// 2. ATTENDANCE COLLECTION ('attendance')
const attendanceSchema = new mongoose.Schema({
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    date: { type: String, required: true }, // Format: "YYYY-MM-DD"
    timeIn: { type: Date, default: Date.now },
    timeOut: { type: Date }
});

// 3. FOOD LOGS COLLECTION ('foodlogs')
const foodLogSchema = new mongoose.Schema({
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    date: { type: String, required: true }, // Format: "YYYY-MM-DD"
    foodName: { type: String, required: true },
    calories: { type: Number, required: true }
});

// 4. PRESET FOODS COLLECTION ('foods')
const foodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    caloriesPerServing: { type: Number, required: true }
});

// 5. WORKOUT ROUTINES COLLECTION ('routines')
const routineSchema = new mongoose.Schema({
    title: { type: String, required: true },
    goal: { type: String, required: true }, // e.g., "Weight Loss", "Muscle Gain"
    dayOfWeek: { type: String, required: true }, // e.g., "Monday"
    exercises: [{ type: String }] // List of exercises
});

// 6. GYMS COLLECTION ('gyms')
const gymSchema = new mongoose.Schema({
    name: { type: String, required: true },
    qrToken: { type: String, required: true, unique: true }
});

// Compile into Models
const Member = mongoose.model('Member', memberSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);
const FoodLog = mongoose.model('FoodLog', foodLogSchema);
const Food = mongoose.model('Food', foodSchema);
const Routine = mongoose.model('Routine', routineSchema);
const Gym = mongoose.model('Gym', gymSchema);

// Export all 6 models so script.js can use them
module.exports = { Member, Attendance, FoodLog, Food, Routine, Gym };
