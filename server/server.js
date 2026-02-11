const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, sequelize } = require('./config/db');
const { connectRedis } = require('./config/redis');
const chatHandler = require('./socket/chatHandler');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: function (origin, callback) {
            // Allow any localhost origin (any port)
            if (!origin || origin.match(/^http:\/\/localhost:\d+$/)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || origin.match(/^http:\/\/localhost:\d+$/)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'SkillSwap API',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/sessions', require('./routes/sessions'));

// Socket.io
chatHandler(io);

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    // Connect Redis (optional - works without it)
    await connectRedis();

    // Connect PostgreSQL and sync models
    await connectDB();
    try {
        await sequelize.sync({ alter: false });
        console.log('✅ Database models synced');
    } catch (err) {
        console.log('⚠️  Database sync skipped (DB may not be available)');
    }

    // Seed demo data if DB is available
    try {
        await seedDemoData();
    } catch (err) {
        console.log('⚠️  Demo data seeding skipped');
    }

    server.listen(PORT, () => {
        console.log(`\n🚀 SkillSwap API running on http://localhost:${PORT}`);
        console.log(`📡 WebSocket server ready`);
        console.log(`💾 PostgreSQL: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`);
        console.log(`📦 Redis: ${process.env.REDIS_URL || 'redis://localhost:6379'}\n`);
    });
};

// Demo data seeder
async function seedDemoData() {
    const { User, Skill } = require('./models');
    const userCount = await User.count();
    if (userCount > 0) return; // Already seeded

    console.log('🌱 Seeding demo data...');

    const demoUsers = [
        { name: 'Alex Chen', email: 'alex@demo.com', password: 'demo123', bio: 'Full-stack developer passionate about teaching React and learning ML', location: 'San Francisco, CA', rating: 4.8, totalSessions: 45 },
        { name: 'Sarah Johnson', email: 'sarah@demo.com', password: 'demo123', bio: 'Data scientist who loves Python and wants to learn mobile development', location: 'New York, NY', rating: 4.9, totalSessions: 62 },
        { name: 'Mike Rodriguez', email: 'mike@demo.com', password: 'demo123', bio: 'UI/UX designer exploring backend development', location: 'Austin, TX', rating: 4.7, totalSessions: 38 },
        { name: 'Priya Patel', email: 'priya@demo.com', password: 'demo123', bio: 'DevOps engineer sharing cloud expertise, learning frontend frameworks', location: 'Seattle, WA', rating: 4.6, totalSessions: 29 },
        { name: 'James Wilson', email: 'james@demo.com', password: 'demo123', bio: 'Mobile developer teaching Swift and Flutter', location: 'Chicago, IL', rating: 4.8, totalSessions: 51 },
        { name: 'Luna Martinez', email: 'luna@demo.com', password: 'demo123', bio: 'Cybersecurity expert eager to learn AI/ML concepts', location: 'Miami, FL', rating: 4.5, totalSessions: 22 },
        { name: 'David Kim', email: 'david@demo.com', password: 'demo123', bio: 'Blockchain developer exploring web3 and smart contracts', location: 'Los Angeles, CA', rating: 4.7, totalSessions: 34 },
        { name: 'Emma Taylor', email: 'emma@demo.com', password: 'demo123', bio: 'Game developer passionate about Unity and C#', location: 'Portland, OR', rating: 4.9, totalSessions: 47 }
    ];

    for (const userData of demoUsers) {
        const user = await User.create(userData);

        const skillSets = {
            'Alex Chen': [
                { name: 'React', category: 'Frontend', level: 'expert', type: 'teaching' },
                { name: 'Node.js', category: 'Backend', level: 'advanced', type: 'teaching' },
                { name: 'Machine Learning', category: 'AI/ML', level: 'beginner', type: 'learning' },
                { name: 'Python', category: 'Programming', level: 'intermediate', type: 'learning' }
            ],
            'Sarah Johnson': [
                { name: 'Python', category: 'Programming', level: 'expert', type: 'teaching' },
                { name: 'Machine Learning', category: 'AI/ML', level: 'advanced', type: 'teaching' },
                { name: 'React Native', category: 'Mobile', level: 'beginner', type: 'learning' },
                { name: 'Swift', category: 'Mobile', level: 'beginner', type: 'learning' }
            ],
            'Mike Rodriguez': [
                { name: 'UI/UX Design', category: 'Design', level: 'expert', type: 'teaching' },
                { name: 'Figma', category: 'Design', level: 'expert', type: 'teaching' },
                { name: 'Node.js', category: 'Backend', level: 'beginner', type: 'learning' },
                { name: 'PostgreSQL', category: 'Database', level: 'beginner', type: 'learning' }
            ],
            'Priya Patel': [
                { name: 'Docker', category: 'DevOps', level: 'expert', type: 'teaching' },
                { name: 'AWS', category: 'Cloud', level: 'advanced', type: 'teaching' },
                { name: 'React', category: 'Frontend', level: 'beginner', type: 'learning' },
                { name: 'Vue.js', category: 'Frontend', level: 'beginner', type: 'learning' }
            ],
            'James Wilson': [
                { name: 'Swift', category: 'Mobile', level: 'expert', type: 'teaching' },
                { name: 'Flutter', category: 'Mobile', level: 'advanced', type: 'teaching' },
                { name: 'Machine Learning', category: 'AI/ML', level: 'intermediate', type: 'learning' },
                { name: 'Docker', category: 'DevOps', level: 'beginner', type: 'learning' }
            ],
            'Luna Martinez': [
                { name: 'Cybersecurity', category: 'Security', level: 'expert', type: 'teaching' },
                { name: 'Network Security', category: 'Security', level: 'advanced', type: 'teaching' },
                { name: 'Python', category: 'Programming', level: 'intermediate', type: 'learning' },
                { name: 'TensorFlow', category: 'AI/ML', level: 'beginner', type: 'learning' }
            ],
            'David Kim': [
                { name: 'Blockchain', category: 'Web3', level: 'expert', type: 'teaching' },
                { name: 'Solidity', category: 'Web3', level: 'advanced', type: 'teaching' },
                { name: 'React', category: 'Frontend', level: 'intermediate', type: 'learning' },
                { name: 'UI/UX Design', category: 'Design', level: 'beginner', type: 'learning' }
            ],
            'Emma Taylor': [
                { name: 'Unity', category: 'Game Dev', level: 'expert', type: 'teaching' },
                { name: 'C#', category: 'Programming', level: 'advanced', type: 'teaching' },
                { name: 'Blender', category: 'Design', level: 'intermediate', type: 'learning' },
                { name: 'AWS', category: 'Cloud', level: 'beginner', type: 'learning' }
            ]
        };

        const skills = skillSets[userData.name] || [];
        for (const skill of skills) {
            await Skill.create({ ...skill, userId: user.id });
        }
    }
    console.log('✅ Demo data seeded (8 users with skills)');
}

startServer();
