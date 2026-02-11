const express = require('express');
const { Skill } = require('../models');
const auth = require('../middleware/auth');
const { deleteCache } = require('../config/redis');
const router = express.Router();

// Get user's skills
router.get('/', auth, async (req, res) => {
    try {
        const skills = await Skill.findAll({ where: { userId: req.userId } });
        res.json(skills);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a skill
router.post('/', auth, async (req, res) => {
    try {
        const { name, category, level, type, description } = req.body;
        const skill = await Skill.create({
            userId: req.userId, name, category, level, type, description
        });
        await deleteCache('users:all');
        await deleteCache(`user:${req.userId}`);
        res.status(201).json(skill);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a skill
router.put('/:id', auth, async (req, res) => {
    try {
        const skill = await Skill.findOne({ where: { id: req.params.id, userId: req.userId } });
        if (!skill) return res.status(404).json({ error: 'Skill not found' });
        await skill.update(req.body);
        await deleteCache('users:all');
        res.json(skill);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a skill
router.delete('/:id', auth, async (req, res) => {
    try {
        const skill = await Skill.findOne({ where: { id: req.params.id, userId: req.userId } });
        if (!skill) return res.status(404).json({ error: 'Skill not found' });
        await skill.destroy();
        await deleteCache('users:all');
        res.json({ message: 'Skill deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
