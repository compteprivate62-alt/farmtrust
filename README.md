# FarmTrust by RSHD 🌿
> Smart Farm Platform — Full Stack Web Application

---

## 📁 Project Structure

```
farmtrust/
├── client/          ← React Frontend  → InfinityFree
└── server/          ← Node.js Backend → Render.com
```

---

## 🚀 Setup Guide (Step by Step)

### STEP 1 — MongoDB Atlas (Database)
1. Go to https://mongodb.com/atlas → Create free account
2. Create **Free Cluster** (M0)
3. Database Access → Add user + password
4. Network Access → Add `0.0.0.0/0`
5. Connect → Copy connection string:
   ```
   mongodb+srv://USER:PASS@cluster.mongodb.net/farmtrust
   ```

---

### STEP 2 — Setup Server
```bash
cd server
cp .env.example .env
# Edit .env with your MONGO_URI
npm install
npm run dev   # test locally on http://localhost:5000
```

---

### STEP 3 — Deploy Backend on Render.com
1. Push project to GitHub
2. Go to https://render.com → New Web Service
3. Connect GitHub repo → Root directory: `server`
4. Environment Variables:
   ```
   MONGO_URI     = mongodb+srv://...
   JWT_SECRET    = farmtrust_secret_2024
   CLIENT_URL    = https://yoursite.infinityfreeapp.com
   PORT          = 5000
   ```
5. Deploy → Copy your Render URL:
   ```
   https://farmtrust-api.onrender.com
   ```

---

### STEP 4 — Build Frontend
```bash
cd client
# Create .env file:
echo "REACT_APP_API_URL=https://farmtrust-api.onrender.com/api" > .env
echo "REACT_APP_SOCKET_URL=https://farmtrust-api.onrender.com" >> .env

npm install
npm run build   # generates /build folder
```

---

### STEP 5 — Deploy Frontend on InfinityFree
1. Go to https://infinityfree.com → Create account
2. Create hosting account
3. Open File Manager → go to `htdocs`
4. Upload ALL contents of `/client/build/` into `htdocs`
   ⚠️ Upload the CONTENTS, not the folder itself
5. The `.htaccess` file is already inside /build — make sure it uploads too

---

## ✅ Done!

| Service        | What it does         | URL                                    |
|----------------|----------------------|----------------------------------------|
| InfinityFree   | React Frontend       | https://yoursite.infinityfreeapp.com   |
| Render.com     | Node.js Backend API  | https://farmtrust-api.onrender.com     |
| MongoDB Atlas  | Database             | cloud.mongodb.com                      |

---

## 👤 Create Admin Account
After deployment, register normally, then in MongoDB Atlas:
- Open Collection `users`
- Find your user → change `role` from `"client"` to `"admin"`

---

## 💡 Features
- ✅ Auth (Register / Login / JWT)
- ✅ Animals (CRUD + images + logs)
- ✅ Products linked to animals
- ✅ Buy full animals OR products
- ✅ Cart & Checkout
- ✅ Promotions with discounts
- ✅ Comments & Star ratings
- ✅ Real-time chat (Socket.io)
- ✅ Notifications
- ✅ Admin Dashboard
- ✅ Order management

---

## ⚡ Render Free Tier Note
Render free tier sleeps after 15 min of inactivity.
Use https://cron-job.org to ping your API every 10 minutes to keep it awake.
Ping URL: `https://farmtrust-api.onrender.com/api/animals`
