# 🚀 How to Deploy SkillSwap — Step by Step Guide

This guide will walk you through deploying your SkillSwap platform to the internet **for free**. After this, anyone with the link can use your app.

---

## What We'll Set Up

| What | Where | Cost |
|------|-------|------|
| Database (PostgreSQL) | Neon.tech | Free |
| Backend API (Node.js) | Render.com | Free |
| Python Matching Service | Render.com | Free |
| Frontend (React) | Vercel.com | Free |
| Redis Cache | Upstash.com | Free |

**Total cost: $0** 🎉

---

## Step 1: Push Code to GitHub

You need your code on GitHub so the deployment services can access it.

### 1.1 — Create a GitHub account (skip if you have one)
- Go to [github.com](https://github.com) and sign up

### 1.2 — Create a new repository
- Click the **+** button (top right) → **New repository**
- Name it: `skillswap-platform`
- Keep it **Public** (or Private, both work)
- Do **NOT** check "Add a README" (we already have one)
- Click **Create repository**

### 1.3 — Push your code
Open a terminal in `c:\Users\DELL\OneDrive\Documents\webbbbb` and run these one by one:

```bash
git init
git add .
git commit -m "Initial commit - SkillSwap Platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/skillswap-platform.git
git push -u origin main
```

> ⚠️ Replace `YOUR_USERNAME` with your actual GitHub username!

---

## Step 2: Set Up Free PostgreSQL Database (Neon.tech)

### 2.1 — Create an account
- Go to [neon.tech](https://neon.tech)
- Click **Sign Up** → Sign in with GitHub (easiest)

### 2.2 — Create a new project
- Click **New Project**
- Project name: `skillswap`
- Region: Pick the one closest to you (e.g., `Asia Southeast` for India)
- Click **Create Project**

### 2.3 — Copy your connection details
After creating, you'll see a **Connection Details** panel. You need these values:
- **Host** → something like `ep-cool-name-123456.us-east-2.aws.neon.tech`
- **Database** → `neondb` (or whatever it shows)
- **User** → your username
- **Password** → click the eye icon to reveal

📝 **Write these down — you'll need them in Step 4!**

The full connection string looks like:
```
postgresql://username:password@ep-cool-name.us-east-2.aws.neon.tech/neondb?sslmode=require
```

---

## Step 3: Set Up Free Redis Cache (Upstash)

### 3.1 — Create an account
- Go to [upstash.com](https://upstash.com)
- Click **Sign Up** → Sign in with GitHub

### 3.2 — Create a Redis database
- Click **Create Database**
- Name: `skillswap-cache`
- Region: Pick closest to you
- Click **Create**

### 3.3 — Copy the Redis URL
- On the database page, find **Redis URL** (it starts with `redis://`)
- Copy the full URL — looks like: `redis://default:abc123@us1-xyz.upstash.io:6379`

📝 **Save this URL — you'll need it in Step 4!**

---

## Step 4: Deploy the Backend API (Render.com)

### 4.1 — Create an account
- Go to [render.com](https://render.com)
- Click **Get Started** → Sign in with GitHub

### 4.2 — Create a new Web Service (Backend)
- Click **New** → **Web Service**
- Connect your GitHub repo (`skillswap-platform`)
- Fill in:
  - **Name**: `skillswap-api`
  - **Region**: closest to you
  - **Root Directory**: `server`
  - **Runtime**: `Node`
  - **Build Command**: `npm install`
  - **Start Command**: `node server.js`
  - **Plan**: Select **Free**

### 4.3 — Add Environment Variables
Click **Environment** tab and add these one by one:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `DB_HOST` | Your Neon host (from Step 2.3) |
| `DB_PORT` | `5432` |
| `DB_NAME` | Your Neon database name (from Step 2.3) |
| `DB_USER` | Your Neon username (from Step 2.3) |
| `DB_PASSWORD` | Your Neon password (from Step 2.3) |
| `JWT_SECRET` | Type any long random string, e.g. `myapp_secret_key_2024_xyz` |
| `REDIS_URL` | Your Upstash Redis URL (from Step 3.3) |
| `PYTHON_SERVICE_URL` | Leave empty for now (we'll fill this in Step 5) |
| `GEMINI_API_KEY` | Your Google Gemini API key (get one free at [aistudio.google.com](https://aistudio.google.com)) |

### 4.4 — Deploy!
- Click **Create Web Service**
- Wait 2-3 minutes for it to build and deploy
- Once done, you'll get a URL like: `https://skillswap-api.onrender.com`

📝 **Copy this URL — you'll need it for the frontend!**

### 4.5 — Test your backend
Open your backend URL in browser with `/api/health`:
```
https://skillswap-api.onrender.com/api/health
```
You should see: `{"status":"OK","service":"SkillSwap API",...}`

---

## Step 5: Deploy the Python Matching Service (Render.com)

### 5.1 — Create another Web Service
- In Render, click **New** → **Web Service** again
- Connect the same GitHub repo
- Fill in:
  - **Name**: `skillswap-matcher`
  - **Root Directory**: `matching-service`
  - **Runtime**: `Python`
  - **Build Command**: `pip install -r requirements.txt`
  - **Start Command**: `python app.py`
  - **Plan**: **Free**

### 5.2 — Add Environment Variables

| Key | Value |
|-----|-------|
| `GEMINI_API_KEY` | Same Gemini API key from Step 4.3 |

### 5.3 — Deploy!
- Click **Create Web Service**
- Once deployed, you'll get a URL like: `https://skillswap-matcher.onrender.com`

### 5.4 — Update Backend with Matcher URL
- Go back to your **skillswap-api** service in Render
- Go to **Environment** tab
- Set `PYTHON_SERVICE_URL` = `https://skillswap-matcher.onrender.com`
- Click **Save Changes** (it will auto-redeploy)

---

## Step 6: Deploy the Frontend (Vercel)

### 6.1 — Create an account
- Go to [vercel.com](https://vercel.com)
- Click **Sign Up** → Sign in with GitHub

### 6.2 — Import your project
- Click **Add New** → **Project**
- Find and select your `skillswap-platform` repo
- Fill in:
  - **Framework Preset**: `Vite`
  - **Root Directory**: Click **Edit** → type `client`
  - **Build Command**: `npm run build`
  - **Output Directory**: `dist`

### 6.3 — Add Environment Variable
Click **Environment Variables** and add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | Your backend URL from Step 4.4, e.g. `https://skillswap-api.onrender.com` |

### 6.4 — Deploy!
- Click **Deploy**
- Wait 1-2 minutes
- Once done, you'll get a URL like: `https://skillswap-platform.vercel.app`

### 🎉 Your app is now LIVE!
Open your Vercel URL and share it with the world!

---

## Step 7: Update CORS for Production (Important!)

Your backend needs to know about your Vercel domain. Go to:
- Render → **skillswap-api** → **Environment** tab
- Add a new variable:

| Key | Value |
|-----|-------|
| `FRONTEND_URL` | Your Vercel URL, e.g. `https://skillswap-platform.vercel.app` |

> The server already accepts all localhost origins. For production, it works because the CORS is set to allow any origin pattern. If you face CORS issues, update the server's CORS config to include your Vercel domain.

---

## ✅ Final Checklist

After deploying everything, verify:

- [ ] Backend health check works: `https://your-api.onrender.com/api/health`
- [ ] Frontend loads: `https://your-app.vercel.app`
- [ ] Registration works (try creating an account)
- [ ] Login works
- [ ] Explore page shows users
- [ ] Chat interface loads

---

## 🔧 Troubleshooting

### "App takes 30 seconds to load"
- Free Render services **sleep after 15 minutes** of inactivity
- First request after sleeping takes ~30 seconds (cold start)
- This is normal for free tier — upgrade to paid to fix

### "Database connection error"
- Double-check your Neon.tech credentials in Render environment variables
- Make sure you copied the **host**, not the full connection string

### "Registration fails"
- Check Render logs (Dashboard → your service → **Logs** tab)
- Usually it's a wrong DB password or host

### "AI Matching doesn't work"
- Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com)
- Add it to both the backend AND matcher service env vars
- The app still works without it — it uses the fallback algorithm

---

## 🎯 Quick Summary

```
1. Push code to GitHub
2. Create free PostgreSQL on Neon.tech
3. Create free Redis on Upstash
4. Deploy backend on Render.com
5. Deploy Python service on Render.com
6. Deploy frontend on Vercel
7. Connect everything with environment variables
```

**That's it! Your full-stack app is live on the internet! 🚀**
