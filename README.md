# 🚀 AI-Powered Skill Bartering Platform

A full-stack peer-to-peer learning marketplace that connects users based on complementary skills. The platform combines AI-powered matching, real-time communication, WebRTC video sessions, Redis caching, and PostgreSQL persistence to create a scalable learning ecosystem.

---

# 📌 Problem Statement

Traditional learning platforms are transactional and often require monetary payment. Many users possess valuable skills but lack opportunities to exchange knowledge directly with others.

This project solves that problem through a skill bartering system where:

* Users list skills they can teach
* Users list skills they want to learn
* AI identifies optimal learning partners
* Users communicate through real-time chat
* Users conduct peer-to-peer video sessions
* Platform performance is optimized through Redis caching

---

# 🎯 Key Features

### AI Skill Matching

* Intelligent learner-teacher recommendations
* Gemini-powered profile analysis
* Skill compatibility scoring

### Real-Time Communication

* Socket.io powered messaging
* Typing indicators
* Read receipts
* Online presence tracking

### WebRTC Video Sessions

* Peer-to-peer video calls
* Screen sharing support
* Low-latency communication
* Browser-native media streaming

### Authentication & Security

* JWT Authentication
* Password hashing with bcrypt
* Protected API routes
* Session validation

### Performance Optimization

* Redis caching layer
* Reduced database load
* Faster match retrieval
* Improved API response times

---

# 🏗️ Microservices Architecture

```text
                    ┌──────────────────┐
                    │   React Client   │
                    └─────────┬────────┘
                              │
                    REST API / Socket.io
                              │
                              ▼

               ┌─────────────────────────┐
               │ Express Backend Service │
               └──────┬─────────┬────────┘
                      │         │
                      │         │
                      ▼         ▼

           ┌──────────────┐   ┌──────────────┐
           │ PostgreSQL   │   │    Redis     │
           │ Database     │   │    Cache     │
           └──────────────┘   └──────────────┘

                      │
                      ▼

           ┌────────────────────┐
           │ Python AI Service  │
           │ Gemini Integration │
           └────────────────────┘
```

---

# 🧠 AI Matching Engine

The platform uses a dedicated Python microservice for intelligent matching.

### Matching Workflow

1. User profile data collected
2. Skills offered extracted
3. Skills requested extracted
4. Gemini analyzes compatibility
5. Matching score generated
6. Recommendations returned to client

Example Factors:

* Skill overlap
* Learning goals
* Teaching expertise
* Experience levels
* User preferences

---

# 📹 WebRTC Signaling Flow

The platform uses Socket.io as the signaling server while media streams remain peer-to-peer.

```text
User A
  │
  │ Create Offer
  ▼

Socket.io Signaling Server

  │
  │ Forward Offer
  ▼

User B

  │
  │ Create Answer
  ▼

Socket.io Signaling Server

  │
  │ Forward Answer
  ▼

User A

WebRTC Connection Established

User A ◄────────────► User B

(Video + Audio Streams)
```

### Why WebRTC?

* Direct browser-to-browser communication
* Reduced server bandwidth usage
* Lower latency
* Scalable video sessions

---

# ⚡ Redis Caching Strategy

Redis is used to reduce database load and improve response times.

### Cached Data

* User profiles
* Popular skill searches
* Match recommendations
* Active sessions

### Cache Workflow

```text
Client Request
       │
       ▼

    Redis

 Hit? ─────► Return Cached Data

 Miss?
       │
       ▼

 PostgreSQL
       │
       ▼

 Store in Redis
       │
       ▼

 Return Response
```

### Benefits

* Lower database queries
* Faster API responses
* Improved scalability
* Better user experience

---

# 🗄️ Database Design

PostgreSQL stores persistent application data.

Core entities:

* Users
* Skills
* Matches
* Messages
* Learning Sessions

Relationships are managed through Sequelize ORM.

---

# 🛠️ Tech Stack

| Layer          | Technology       |
| -------------- | ---------------- |
| Frontend       | React 18, Vite   |
| Backend        | Node.js, Express |
| Real-Time      | Socket.io        |
| Video          | WebRTC           |
| Database       | PostgreSQL       |
| Cache          | Redis            |
| AI Service     | Python Flask     |
| AI Model       | Gemini API       |
| Authentication | JWT, bcrypt      |
| ORM            | Sequelize        |
| Deployment     | Vercel, Render   |

---

# 📂 Project Structure

```text
skillswap-platform/

├── client/
│   ├── src/pages
│   ├── src/context
│   └── src/services
│
├── server/
│   ├── models
│   ├── routes
│   ├── socket
│   └── config
│
├── matching-service/
│   ├── app.py
│   ├── services
│   └── prompts
│
└── README.md
```

---

# ⚙️ Installation

## Frontend

```bash
cd client

npm install

npm run dev
```

## Backend

```bash
cd server

npm install

node server.js
```

## AI Matching Service

```bash
cd matching-service

pip install -r requirements.txt

python app.py
```

---

# 🔮 Future Enhancements

* Skill recommendation ranking model
* User reputation system
* Video session recording
* AI-generated learning roadmaps
* Real-time translation during video calls
* Kubernetes deployment

---

# 📄 License

MIT License
