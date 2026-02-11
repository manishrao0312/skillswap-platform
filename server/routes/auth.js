const express = require('express');
const jwt = require('jsonwebtoken');
const { User, Skill } = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, bio, location } = req.body;
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        const user = await User.create({ name, email, password, bio, location });
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'skillswap_jwt_secret_key_2024',
            { expiresIn: '7d' }
        );
        res.status(201).json({ token, user: user.toSafeJSON() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email }, include: [{ model: Skill, as: 'skills' }] });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'skillswap_jwt_secret_key_2024',
            { expiresIn: '7d' }
        );
        res.json({ token, user: user.toSafeJSON() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            include: [{ model: Skill, as: 'skills' }]
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user: user.toSafeJSON() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
