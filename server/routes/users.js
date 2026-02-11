const express = require('express');
const { User, Skill } = require('../models');
const auth = require('../middleware/auth');
const { getCache, setCache } = require('../config/redis');
const router = express.Router();

// Get all users (with caching)
router.get('/', auth, async (req, res) => {
    try {
        const cached = await getCache('users:all');
        if (cached) return res.json(cached);

        const users = await User.findAll({
            include: [{ model: Skill, as: 'skills' }],
            attributes: { exclude: ['password'] },
            order: [['rating', 'DESC']]
        });
        await setCache('users:all', users, 120);
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const cached = await getCache(`user:${req.params.id}`);
        if (cached) return res.json(cached);

        const user = await User.findByPk(req.params.id, {
            include: [{ model: Skill, as: 'skills' }],
            attributes: { exclude: ['password'] }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        await setCache(`user:${req.params.id}`, user, 300);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, bio, location, availability, avatar } = req.body;
        const user = await User.findByPk(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        await user.update({ name, bio, location, availability, avatar });
        res.json({ user: user.toSafeJSON() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
