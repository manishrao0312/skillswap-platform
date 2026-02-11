const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Match = sequelize.define('Match', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    matchedUserId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    compatibilityScore: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    matchedSkills: {
        type: DataTypes.JSONB,
        defaultValue: []
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'declined', 'completed'),
        defaultValue: 'pending'
    },
    aiReasoning: {
        type: DataTypes.TEXT,
        defaultValue: ''
    }
}, {
    timestamps: true
});

module.exports = Match;
