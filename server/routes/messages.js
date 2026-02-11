const express = require('express');
const { Message, User } = require('../models');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');
const router = express.Router();

// Get conversation between two users
router.get('/:otherUserId', auth, async (req, res) => {
    try {
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId: req.userId, receiverId: req.params.otherUserId },
                    { senderId: req.params.otherUserId, receiverId: req.userId }
                ]
            },
            include: [
                { model: User, as: 'sender', attributes: ['id', 'name', 'avatar'] },
                { model: User, as: 'receiver', attributes: ['id', 'name', 'avatar'] }
            ],
            order: [['createdAt', 'ASC']],
            limit: 100
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all conversations for current user
router.get('/', auth, async (req, res) => {
    try {
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId: req.userId },
                    { receiverId: req.userId }
                ]
            },
            include: [
                { model: User, as: 'sender', attributes: ['id', 'name', 'avatar', 'isOnline'] },
                { model: User, as: 'receiver', attributes: ['id', 'name', 'avatar', 'isOnline'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Group by conversation partner
        const conversations = {};
        messages.forEach(msg => {
            const partnerId = msg.senderId === req.userId ? msg.receiverId : msg.senderId;
            if (!conversations[partnerId]) {
                const partner = msg.senderId === req.userId ? msg.receiver : msg.sender;
                conversations[partnerId] = {
                    partnerId,
                    partnerName: partner.name,
                    partnerAvatar: partner.avatar,
                    isOnline: partner.isOnline,
                    lastMessage: msg.content,
                    lastMessageAt: msg.createdAt,
                    unreadCount: 0
                };
            }
            if (msg.receiverId === req.userId && !msg.isRead) {
                conversations[partnerId].unreadCount++;
            }
        });

        res.json(Object.values(conversations));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark messages as read
router.put('/read/:otherUserId', auth, async (req, res) => {
    try {
        await Message.update(
            { isRead: true, readAt: new Date() },
            { where: { senderId: req.params.otherUserId, receiverId: req.userId, isRead: false } }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
