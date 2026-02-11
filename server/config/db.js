const { Sequelize } = require('sequelize');
const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const DB_NAME = process.env.DB_NAME || 'skillswap';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;

// Enable SSL for any remote database (not localhost)
const needsSSL = DB_HOST !== 'localhost' && DB_HOST !== '127.0.0.1';
const sslConfig = needsSSL ? { rejectUnauthorized: false } : false;

// Auto-create database if it doesn't exist
const ensureDatabase = async () => {
    // Skip auto-create for remote DBs (Neon already creates it)
    if (needsSSL) return;

    const client = new Client({
        user: DB_USER,
        password: DB_PASSWORD,
        host: DB_HOST,
        port: DB_PORT,
        database: 'postgres',
        ssl: sslConfig
    });

    try {
        await client.connect();
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [DB_NAME]);
        if (res.rowCount === 0) {
            await client.query(`CREATE DATABASE "${DB_NAME}"`);
            console.log(`✅ Database "${DB_NAME}" created automatically`);
        }
    } catch (err) {
        console.log('⚠️  Could not auto-create database:', err.message);
    } finally {
        await client.end().catch(() => { });
    }
};

// PostgreSQL connection via Sequelize
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'postgres',
    logging: false,
    pool: {
        max: 20,
        min: 5,
        acquire: 30000,
        idle: 10000
    },
    dialectOptions: {
        ssl: needsSSL ? { require: true, rejectUnauthorized: false } : false
    }
});

// Test database connection
const connectDB = async () => {
    await ensureDatabase();
    try {
        await sequelize.authenticate();
        console.log('✅ PostgreSQL connected successfully');
    } catch (error) {
        console.error('❌ PostgreSQL connection failed:', error.message);
    }
};

module.exports = { sequelize, connectDB };
