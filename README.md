# AI-Powered Skill Bartering Platform

A full-stack peer-to-peer learning platform with AI-powered skill matching, real-time chat, and WebRTC video sessions.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express + Socket.io |
| AI Matching | Python Flask + Google Gemini API |
| Database | PostgreSQL (Sequelize ORM) |
| Cache | Redis |
| Video | WebRTC (peer-to-peer) |
| Auth | JWT + bcrypt |

## 📁 Project Structure

```
├── client/          # React frontend (Vite)
│   ├── src/pages/   # 8 pages (Landing, Auth, Dashboard, Profile, Matches, Chat, Video, Explore)
│   ├── src/context/ # Auth context
│   └── src/services/# API & Socket clients
├── server/          # Express backend
│   ├── models/      # Sequelize models (User, Skill, Match, Message, Session)
│   ├── routes/      # REST API routes
│   ├── socket/      # Socket.io handlers
│   └── config/      # DB & Redis config
└── matching-service/# Python Flask AI matching
```

## 🛠️ Local Development

### Frontend
```bash
cd client
npm install
npm run dev
```

### Backend
```bash
cd server
npm install
node server.js
```
> Requires PostgreSQL. The server auto-creates the `skillswap` database.

### Python Matching Service (optional)
```bash
cd matching-service
pip install -r requirements.txt
python app.py
```

## 🌐 Deployment

- **Frontend** → Deploy `client/` to [Vercel](https://vercel.com) (config included in `vercel.json`)
- **Backend** → Deploy `server/` to [Render](https://render.com) (config in `render.yaml` + `Dockerfile`)
- **Matching Service** → Deploy `matching-service/` to Render (Dockerfile included)
- **Database** → Use [Neon.tech](https://neon.tech) for free PostgreSQL
- **Redis** → Use [Upstash](https://upstash.com) for free Redis

Set `VITE_API_URL` env var in Vercel to your deployed backend URL.

## 🔑 Environment Variables

Copy `server/.env.example` to `server/.env` and fill in your values.

## ✨ Features

- 🧠 AI-powered skill matching via Gemini API
- 💬 Real-time chat with typing indicators & read receipts
- 📹 WebRTC peer-to-peer video calls with screen sharing
- 🔒 JWT authentication with bcrypt password hashing
- ⚡ Redis caching for low-latency responses
- 🎨 Premium dark theme UI with glassmorphism

## 📄 License

MIT
