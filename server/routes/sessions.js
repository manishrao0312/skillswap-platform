const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { Session, User } = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

// Create a new video session
router.post('/', auth, async (req, res) => {
    try {
        const { participantId, skill, scheduledAt } = req.body;
        const roomId = `room_${uuidv4().slice(0, 8)}`;
        const session = await Session.create({
            hostId: req.userId,
            participantId,
            skill,
            scheduledAt,
            roomId,
            status: scheduledAt ? 'scheduled' : 'active',
            startedAt: scheduledAt ? null : new Date()
        });
        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user's sessions
router.get('/', auth, async (req, res) => {
    try {
        const sessions = await Session.findAll({
            where: {
                [require('sequelize').Op.or]: [
                    { hostId: req.userId },
                    { participantId: req.userId }
                ]
            },
            include: [
                { model: User, as: 'host', attributes: ['id', 'name', 'avatar'] },
                { model: User, as: 'participant', attributes: ['id', 'name', 'avatar'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// End a session
router.put('/:id/end', auth, async (req, res) => {
    try {
        const session = await Session.findByPk(req.params.id);
        if (!session) return res.status(404).json({ error: 'Session not found' });

        const endedAt = new Date();
        const duration = session.startedAt
            ? Math.round((endedAt - new Date(session.startedAt)) / 60000)
            : 0;

        await session.update({
            status: 'completed',
            endedAt,
            duration,
            rating: req.body.rating,
            feedback: req.body.feedback
        });

        res.json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get session by room ID
router.get('/room/:roomId', auth, async (req, res) => {
    try {
        const session = await Session.findOne({
            where: { roomId: req.params.roomId },
            include: [
                { model: User, as: 'host', attributes: ['id', 'name', 'avatar'] },
                { model: User, as: 'participant', attributes: ['id', 'name', 'avatar'] }
            ]
        });
        if (!session) return res.status(404).json({ error: 'Session not found' });
        res.json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
