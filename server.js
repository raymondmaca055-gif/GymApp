require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // If bcrypt will not install on a teammate's PC, use 'bcryptjs' instead (same functions)
const jwt = require('jsonwebtoken');

// Import your Member model from models.js
const { Member } = require('./models');

// FIXED: stop right away if a needed secret is missing.
// Without JWT_SECRET, every login would fail with a confusing server error.
for (const name of ['MONGO_URI', 'JWT_SECRET']) {
    if (!process.env[name]) {
        console.error(`❌ Missing ${name} in your .env file.`);
        process.exit(1);
    }
}

const app = express();

// Middleware: lets the server read JSON sent by script.js
app.use(express.json());

// FIXED: the server now shares ONLY the public folder with visitors.
// (.env, models.js and server.js stay private.) Open http://localhost:3000
// REMOVED: cors(). The page and the server now share one address, so it is not needed.
app.use(express.static(path.join(__dirname, 'public')));

// FIXED: one helper, so emails are cleaned the same way everywhere
function cleanEmail(value) {
    return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

// ==========================================
// TEST ROUTE: proves the browser can reach the server
// ==========================================
app.get('/api/ping', (req, res) => {
    res.json({ message: 'Server is alive.' });
});

// ==========================================
// ROUTE 1: DEV-ONLY REGISTER (for making test accounts on your own computer)
// ==========================================
// FIXED: this route only exists when ALLOW_DEV_REGISTER=true is in your .env,
// and it NEVER accepts a role from the request. Everyone it creates is a "member".
// To make an admin: create the account here, then change its role to "admin"
// by hand in Atlas (Browse Collections > members > edit the document).
// Turn it off (remove the line from .env) before you deploy.
if (process.env.ALLOW_DEV_REGISTER === 'true') {
    app.post('/api/register', async (req, res) => {
        try {
            const body = req.body || {};
            const name = typeof body.name === 'string' ? body.name.trim() : '';
            const email = cleanEmail(body.email);
            const password = body.password;

            // FIXED: check the inputs exist before using them
            if (!name || !email || typeof password !== 'string' || password.length < 8) {
                return res.status(400).json({
                    message: 'Name, email and a password of at least 8 characters are required.'
                });
            }

            // 1. Check if email already exists
            const existingUser = await Member.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email is already registered.' });
            }

            // 2. Scramble the password before saving
            const passwordHash = await bcrypt.hash(password, 10);

            // 3. Create and save the new user (always a member)
            const newMember = await Member.create({
                name,
                email,
                passwordHash,
                role: 'member'
            });

            res.status(201).json({ message: 'Registration successful!', memberId: newMember._id });
        } catch (error) {
            // FIXED: details go to YOUR terminal, not to the browser
            console.error('Register error:', error);
            res.status(500).json({ message: 'Server error during registration.' });
        }
    });

    console.log('⚠️  Dev register route is ON (ALLOW_DEV_REGISTER=true). Turn it off before deploying.');
}

// ==========================================
// ROUTE 2: LOGIN EXISTING USER
// ==========================================
app.post('/api/login', async (req, res) => {
    try {
        const body = req.body || {};
        const email = cleanEmail(body.email);
        const password = body.password;

        // FIXED: check the inputs exist (bcrypt.compare crashes on a missing password)
        if (!email || typeof password !== 'string' || !password) {
            return res.status(400).json({ message: 'Please enter your email and password.' });
        }

        // Same message for every failure, so nobody can learn which emails exist
        const fail = () => res.status(401).json({ message: 'Invalid email or password.' });

        // 1. Find the user by email
        const user = await Member.findOne({ email });
        // FIXED: deactivated accounts cannot log in
        // (=== false, so old documents without the isActive field still work)
        if (!user || user.isActive === false) {
            return fail();
        }

        // 2. Compare typed password with the scrambled password in MongoDB
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return fail();
        }

        // 3. Create a secure login token (it carries the id and the role)
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
            name: user.name,
            mustChangePassword: user.mustChangePassword === true
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// FIXED: connect to the database first, and only then start listening
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB Atlas!');
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Database connection error:', err.message);
        process.exit(1);
    });