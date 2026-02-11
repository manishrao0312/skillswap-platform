const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    avatar: {
        type: DataTypes.STRING(500),
        defaultValue: null
    },
    bio: {
        type: DataTypes.TEXT,
        defaultValue: ''
    },
    location: {
        type: DataTypes.STRING(100),
        defaultValue: ''
    },
    availability: {
        type: DataTypes.JSONB,
        defaultValue: { timezone: 'UTC', hours: 'flexible' }
    },
    rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    totalSessions: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    isOnline: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    lastSeen: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(12);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

User.prototype.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toSafeJSON = function () {
    const obj = this.toJSON();
    delete obj.password;
    return obj;
};

module.exports = User;
