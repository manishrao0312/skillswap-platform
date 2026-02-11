const express = require('express');
const axios = require('axios');
const { Match, User, Skill } = require('../models');
const auth = require('../middleware/auth');
const { getCache, setCache } = require('../config/redis');
const router = express.Router();

// Get AI-powered matches for current user
router.post('/find', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            include: [{ model: Skill, as: 'skills' }]
        });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Try Python matching service
        let matchResults;
        try {
            const response = await axios.post(
                `${process.env.PYTHON_SERVICE_URL || 'http://localhost:5001'}/match`,
                {
                    userId: user.id,
                    userName: user.name,
                    teachingSkills: user.skills.filter(s => s.type === 'teaching').map(s => ({
                        name: s.name, category: s.category, level: s.level
                    })),
                    learningSkills: user.skills.filter(s => s.type === 'learning').map(s => ({
                        name: s.name, category: s.category, level: s.level
                    })),
                    availability: user.availability
                },
                { timeout: 15000 }
            );
            matchResults = response.data.matches;
        } catch (pyError) {
            // Fallback: basic matching algorithm
            matchResults = await fallbackMatch(user);
        }

        // Store matches in DB
        for (const match of matchResults) {
            await Match.upsert({
                userId: user.id,
                matchedUserId: match.userId,
                compatibilityScore: match.score,
                matchedSkills: match.matchedSkills,
                status: 'pending',
                aiReasoning: match.reasoning || ''
            });
        }

        res.json({ matches: matchResults });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user's matches
router.get('/', auth, async (req, res) => {
    try {
        const cached = await getCache(`matches:${req.userId}`);
        if (cached) return res.json(cached);

        const matches = await Match.findAll({
            where: { userId: req.userId },
            include: [
                {
                    model: User, as: 'matchedUser', attributes: { exclude: ['password'] },
                    include: [{ model: Skill, as: 'skills' }]
                }
            ],
            order: [['compatibilityScore', 'DESC']]
        });
        await setCache(`matches:${req.userId}`, matches, 180);
        res.json(matches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Accept/decline match
router.put('/:id', auth, async (req, res) => {
    try {
        const match = await Match.findByPk(req.params.id);
        if (!match) return res.status(404).json({ error: 'Match not found' });
        await match.update({ status: req.body.status });
        res.json(match);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fallback matching when Python service is unavailable
async function fallbackMatch(user) {
    const teachingSkills = user.skills.filter(s => s.type === 'teaching').map(s => s.name.toLowerCase());
    const learningSkills = user.skills.filter(s => s.type === 'learning').map(s => s.name.toLowerCase());

    const allUsers = await User.findAll({
        where: {},
        include: [{ model: Skill, as: 'skills' }],
        attributes: { exclude: ['password'] }
    });

    const matches = [];
    for (const otherUser of allUsers) {
        if (otherUser.id === user.id) continue;
        const otherTeaching = otherUser.skills.filter(s => s.type === 'teaching').map(s => s.name.toLowerCase());
        const otherLearning = otherUser.skills.filter(s => s.type === 'learning').map(s => s.name.toLowerCase());

        const canTeachMe = otherTeaching.filter(s => learningSkills.includes(s));
        const iCanTeach = teachingSkills.filter(s => otherLearning.includes(s));

        if (canTeachMe.length > 0 || iCanTeach.length > 0) {
            const score = ((canTeachMe.length + iCanTeach.length) / Math.max(teachingSkills.length + learningSkills.length, 1)) * 100;
            matches.push({
                userId: otherUser.id,
                name: otherUser.name,
                avatar: otherUser.avatar,
                rating: otherUser.rating,
                score: Math.min(score, 99),
                matchedSkills: { canTeachMe, iCanTeach },
                reasoning: `Matched on ${canTeachMe.length + iCanTeach.length} complementary skills`
            });
        }
    }
    return matches.sort((a, b) => b.score - a.score).slice(0, 10);
}

module.exports = router;
