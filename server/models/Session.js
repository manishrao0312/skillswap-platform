const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Session = sequelize.define('Session', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    hostId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    participantId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    matchId: {
        type: DataTypes.UUID,
        defaultValue: null
    },
    skill: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'active', 'completed', 'cancelled'),
        defaultValue: 'scheduled'
    },
    scheduledAt: {
        type: DataTypes.DATE,
        defaultValue: null
    },
    startedAt: {
        type: DataTypes.DATE,
        defaultValue: null
    },
    endedAt: {
        type: DataTypes.DATE,
        defaultValue: null
    },
    duration: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    rating: {
        type: DataTypes.FLOAT,
        defaultValue: null
    },
    feedback: {
        type: DataTypes.TEXT,
        defaultValue: ''
    },
    roomId: {
        type: DataTypes.STRING(100),
        unique: true
    }
}, {
    timestamps: true
});

module.exports = Session;
