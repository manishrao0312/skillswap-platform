const User = require('./User');
const Skill = require('./Skill');
const Match = require('./Match');
const Message = require('./Message');
const Session = require('./Session');

// Associations
User.hasMany(Skill, { foreignKey: 'userId', as: 'skills', onDelete: 'CASCADE' });
Skill.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Match, { foreignKey: 'userId', as: 'matches', onDelete: 'CASCADE' });
Match.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Match.belongsTo(User, { foreignKey: 'matchedUserId', as: 'matchedUser' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages', onDelete: 'CASCADE' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages', onDelete: 'CASCADE' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

User.hasMany(Session, { foreignKey: 'hostId', as: 'hostedSessions', onDelete: 'CASCADE' });
User.hasMany(Session, { foreignKey: 'participantId', as: 'participatedSessions', onDelete: 'CASCADE' });
Session.belongsTo(User, { foreignKey: 'hostId', as: 'host' });
Session.belongsTo(User, { foreignKey: 'participantId', as: 'participant' });

module.exports = { User, Skill, Match, Message, Session };
