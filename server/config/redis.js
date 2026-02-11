const redis = require('redis');
const dotenv = require('dotenv');
dotenv.config();

let redisClient = null;
let isRedisConnected = false;
let redisErrorLogged = false;

const connectRedis = async () => {
    try {
        redisClient = redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
            socket: {
                reconnectStrategy: false
            }
        });

        redisClient.on('error', (err) => {
            if (!redisErrorLogged) {
                console.log('⚠️  Redis not available — running without cache');
                redisErrorLogged = true;
            }
            isRedisConnected = false;
        });

        redisClient.on('connect', () => {
            console.log('✅ Redis connected successfully');
            isRedisConnected = true;
        });

        await redisClient.connect();
    } catch (error) {
        if (!redisErrorLogged) {
            console.log('⚠️  Redis not available, running without cache');
            redisErrorLogged = true;
        }
        isRedisConnected = false;
    }
};

// Cache helper functions
const getCache = async (key) => {
    if (!isRedisConnected || !redisClient) return null;
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
};

const setCache = async (key, value, ttl = 300) => {
    if (!isRedisConnected || !redisClient) return;
    try {
        await redisClient.setEx(key, ttl, JSON.stringify(value));
    } catch {
        // Silently fail
    }
};

const deleteCache = async (key) => {
    if (!isRedisConnected || !redisClient) return;
    try {
        await redisClient.del(key);
    } catch {
        // Silently fail
    }
};

module.exports = { connectRedis, redisClient, getCache, setCache, deleteCache };
