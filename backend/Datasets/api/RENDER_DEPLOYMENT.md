# Render.com Deployment Guide

## 📋 Prerequisites
- GitHub account with your backend code
- Render.com account (free)
- Railway PostgreSQL database (already set up)
- Google OAuth Client ID (already configured)

## 🚀 Deployment Steps

### 1. Push Code to GitHub
```bash
# From backend/api directory
git add .
git commit -m "Prepare for Render deployment"
git push
```

### 2. Deploy on Render.com
1. Go to [render.com](https://render.com) and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository containing your backend code
5. Configure the service:
   - **Name**: `recycle-backend-api`
   - **Environment**: `Node`
   - **Build Command**: `npm ci`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend/api` (if code is in subdirectory)

### 3. Set Environment Variables
In Render dashboard, add these environment variables:

```
NODE_ENV=production
DATABASE_URL=postgresql://postgres:wlWaQvRsWvpgGLSuPCUvBHwDoRcJZjjj@postgres.railway.internal:5432/railway
GOOGLE_CLIENT_ID=133381945167-qt7dskcg057peidkj9gum8s2ii1bn4kt.apps.googleusercontent.com
PORT=10000
```

### 4. Get Your Render API URL
After deployment, your API will be available at:
`https://your-service-name.onrender.com`

### 5. Update Mobile App Configuration
Update these files with your new Render URL:

**eas.json:**
```json
{
  "build": {
    "development": {
      "env": {
        "EXPO_PUBLIC_API_BASE": "https://your-service-name.onrender.com"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_API_BASE": "https://your-service-name.onrender.com"
      }
    }
  }
}
```

## ✅ Verification
Test your deployment:
```bash
curl https://your-service-name.onrender.com/health
```

## 🔧 Troubleshooting
- **Build fails**: Check Render logs for missing dependencies
- **Database connection fails**: Verify DATABASE_URL is correct
- **CORS errors**: Our CORS is already configured for all origins
