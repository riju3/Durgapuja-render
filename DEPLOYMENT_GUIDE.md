# 🚀 Render Deployment Guide — Chowdhury Bati Durga Puja

## Prerequisites
- GitHub account
- Render account (render.com)
- MongoDB Atlas account (mongodb.com/atlas)
- Cloudinary account (cloudinary.com)

---

## Step 1: MongoDB Atlas Setup

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → Create free cluster
2. **Database Access** → Add user → username + strong password → note them down
3. **Network Access** → Add IP Address → `0.0.0.0/0` (allow all — required for Render)
4. **Connect** → "Connect your application" → copy the connection string
5. Replace `<username>` and `<password>` in the string:
   ```
   mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/durgapuja?retryWrites=true&w=majority
   ```

---

## Step 2: Push to GitHub

```bash
cd Durgapuja-main
git init
git add .
git commit -m "Initial commit - Render ready"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/durgapuja.git
git push -u origin main
```

---

## Step 3: Deploy Backend on Render

1. Go to [render.com](https://render.com) → New → **Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Name:** `durgapuja-backend`
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Under **Environment Variables**, add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGO_URI` | your Atlas connection string |
| `JWT_SECRET` | any long random string |
| `CLOUDINARY_CLOUD_NAME` | from Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | from Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | from Cloudinary dashboard |
| `ADMIN_EMAIL` | chowdhurybatidurgapuja@gmail.com |
| `ADMIN_PASSWORD` | Chowdhury@12345 |
| `CLIENT_URL` | *(leave blank for now, fill after frontend deploys)* |

5. Click **Create Web Service**
6. Wait for deploy → Copy your backend URL, e.g.:
   `https://durgapuja-backend.onrender.com`

---

## Step 4: Deploy Frontend on Render

1. Go to Render → New → **Static Site**
2. Connect your GitHub repo
3. Settings:
   - **Name:** `durgapuja-frontend`
   - **Root Directory:** `client`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`
4. Under **Environment Variables**, add:

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://durgapuja-backend.onrender.com/api` |

5. Under **Redirects/Rewrites**, add rule:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: **Rewrite** *(required for React Router)*
6. Click **Create Static Site**
7. Copy your frontend URL, e.g.:
   `https://durgapuja-frontend.onrender.com`

---

## Step 5: Update Backend CLIENT_URL

1. Go back to your **backend** service on Render
2. Environment → Edit `CLIENT_URL`
3. Set it to: `https://durgapuja-frontend.onrender.com`
4. Save → Render will redeploy automatically

---

## ✅ You're Live!

- **Frontend:** `https://durgapuja-frontend.onrender.com`
- **Backend API:** `https://durgapuja-backend.onrender.com/api`
- **Health Check:** `https://durgapuja-backend.onrender.com/health`

---

## ⚠️ Important Notes

- **Free tier cold starts:** Render free tier spins down after 15 min inactivity. First load may take ~30s.
- **Never commit `.env`** — it's in `.gitignore`. Always set secrets in Render dashboard.
- **After deploying**, run your admin seed script to create the admin user in Atlas.

