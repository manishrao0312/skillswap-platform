const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Skill = sequelize.define('Skill', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    level: {
        type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
        defaultValue: 'intermediate'
    },
    type: {
        type: DataTypes.ENUM('teaching', 'learning'),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        defaultValue: ''
    }
}, {
    timestamps: true
});

module.exports = Skill;
