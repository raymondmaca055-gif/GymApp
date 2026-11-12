require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Import your Member model from models.js
const { Member } = require('./models');

const app = express();

// Middleware: Allows HTML pages to send JSON data to this server
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas!'))
  .catch(err => console.error('❌ Database connection error:', err));

// ==========================================
// ROUTE 1: REGISTER A NEW MEMBER OR ADMIN
// ==========================================
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. Check if email already exists
        const existingUser = await Member.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered.' });
        }

        // 2. Scramble the password before saving
        const passwordHash = await bcrypt.hash(password, 10);

        // 3. Create and save the new user
        const newMember = await Member.create({
            name,
            email,
            passwordHash,
            role: role || 'member' // Defaults to 'member' unless 'admin' is sent
        });

        res.status(201).json({ message: 'Registration successful!', memberId: newMember._id });
    } catch (error) {
        res.status(500).json({ message: 'Server error during registration.', error: error.message });
    }
});

// ==========================================
// ROUTE 2: LOGIN EXISTING USER
// ==========================================
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find the user by email
        const user = await Member.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        // 2. Compare typed password with the scrambled password in MongoDB
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        // 3. Create a secure login token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 4. Send token and user role back to the frontend
        res.json({
            message: 'Login successful!',
            token,
            role: user.role,
            name: user.name
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
});

// Start the server on Port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
