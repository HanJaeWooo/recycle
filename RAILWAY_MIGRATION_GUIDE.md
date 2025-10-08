# Railway Database Migration Guide

## Overview
This guide will help you migrate your application from your expired Railway trial account to a new Railway account with a fresh PostgreSQL database.

## Current Setup Issues
- Old Railway account trial has expired (0 days left)
- Current backend: `https://recycle-app-98di.onrender.com` (Render deployment)
- Current database: `roundhouse.proxy.rlwy.net:54321` (expired Railway account)
- Google OAuth error: Unauthorized redirect URI

---

## Migration Steps

### Step 1: Create New PostgreSQL Database on Railway

1. **Log in to your new Railway account** (`hanjaewooo`'s Projects)
   - Go to: https://railway.app

2. **Create a new project**
   - Click "New Project"
   - Select "Provision PostgreSQL"
   - Railway will automatically create a PostgreSQL database

3. **Get your database credentials**
   - Click on the PostgreSQL service
   - Go to the "Variables" tab
   - You'll see these environment variables:
     - `PGHOST`
     - `PGPORT`
     - `PGDATABASE`
     - `PGUSER`
     - `PGPASSWORD`
     - `DATABASE_URL` (full connection string)

   **Example values you'll receive:**
   ```
   PGHOST=containers-us-west-xxx.railway.app
   PGPORT=5432
   PGDATABASE=railway
   PGUSER=postgres
   PGPASSWORD=<your-new-password>
   DATABASE_URL=postgresql://postgres:<password>@<host>:5432/railway
   ```

4. **Copy these credentials** - you'll need them in the next steps

---

### Step 2: Update Backend Configuration

1. **Update the `.env` file in `backend/api/.env`**

   Replace the old credentials with your new Railway credentials:

   ```env
   PGHOST=<your-new-railway-host>
   PGPORT=<your-new-port>
   PGDATABASE=railway
   PGUSER=postgres
   PGPASSWORD=<your-new-password>
   PORT=4000
   DEBUG=1
   GOOGLE_CLIENT_ID=133381945167-qt7dskcg057peidkj9gum8s2ii1bn4kt.apps.googleusercontent.com
   DATABASE_URL=postgresql://postgres:<password>@<host>:<port>/railway
   ```

2. **Important**: Make sure to replace ALL the placeholders with your actual new Railway credentials

---

### Step 3: Set Up Database Schema

You need to run two SQL migration files to set up your database tables and functions.

#### Option A: Using Railway's Web Interface (Easiest)

1. In Railway, click on your PostgreSQL service
2. Click on the "Data" tab
3. Click "Query" to open the SQL editor
4. Copy and paste the contents of `backend/sql/001_auth_schema.sql`
5. Click "Run Query"
6. Then copy and paste the contents of `backend/sql/002_scan_history_schema.sql`
7. Click "Run Query"

#### Option B: Using Node.js Migration Script

1. Navigate to the backend API directory:
   ```powershell
   cd backend\api
   ```

2. Install dependencies (if not already installed):
   ```powershell
   npm install
   ```

3. Run the migration script:
   ```powershell
   node migrate.js
   ```

   **Note**: The migrate.js script currently only runs the scan history schema. You'll need to manually run the auth schema first.

#### Option C: Using psql Command Line (If you have PostgreSQL installed)

1. Open PowerShell and run:
   ```powershell
   # Set your new database URL
   $env:DATABASE_URL="<your-new-database-url>"
   
   # Run auth schema
   psql $env:DATABASE_URL -f backend\sql\001_auth_schema.sql
   
   # Run scan history schema
   psql $env:DATABASE_URL -f backend\sql\002_scan_history_schema.sql
   ```

---

### Step 4: Test Database Connection

1. Navigate to the backend API directory:
   ```powershell
   cd backend\api
   ```

2. Run the test connection script:
   ```powershell
   node test_connection.js
   ```

3. You should see:
   ```
   [pg] Database connection test successful at: <timestamp>
   ```

---

### Step 5: Deploy Backend to Render (If Needed)

If your backend is still on Render (`recycle-app-98di.onrender.com`), you need to update the environment variables there:

1. Go to https://render.com
2. Find your `recycle-app-98di` service
3. Go to "Environment" tab
4. Update these variables with your new Railway credentials:
   - `PGHOST`
   - `PGPORT`
   - `PGDATABASE`
   - `PGUSER`
   - `PGPASSWORD`
   - `DATABASE_URL`

5. Render will automatically redeploy with the new credentials

---

### Step 6: Update Google OAuth Configuration

Since you're getting an "Unauthorized redirect URI" error, you need to update your Google OAuth settings:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Credentials"
4. Find your OAuth 2.0 Client ID: `133381945167-qt7dskcg057peidkj9gum8s2ii1bn4kt`
5. Click "Edit"
6. Under "Authorized redirect URIs", make sure you have:
   - `https://recycle-app-98di.onrender.com/auth/login/google`
   - `http://localhost:4000/auth/login/google` (for local testing)
   - Any other URLs your app uses

7. Click "Save"

---

### Step 7: Verify Everything Works

1. **Test the backend health endpoint**:
   ```powershell
   # Test locally
   curl http://localhost:4000/health
   
   # Or test deployed version
   curl https://recycle-app-98di.onrender.com/health
   ```

   You should get a response like:
   ```json
   {
     "ok": true,
     "timestamp": "...",
     "database": {
       "connected": true,
       "timestamp": "..."
     }
   }
   ```

2. **Test the app**:
   - Start your React Native app
   - Try to sign in with Google
   - Verify that authentication works

---

## Quick Command Reference

```powershell
# Navigate to backend API
cd c:\Users\chans\OneDrive\Desktop\postgre-recycle\rn-recycle\backend\api

# Test database connection
node test_connection.js

# Run migration (after updating .env)
node migrate.js

# Start backend locally (if needed)
npm start

# Navigate to React Native app
cd c:\Users\chans\OneDrive\Desktop\postgre-recycle\rn-recycle

# Start the app
npm run start:dev
```

---

## Troubleshooting

### "Connection refused" or "Connection timeout"
- Check that your Railway database is online
- Verify your credentials are correct in `.env`
- Make sure Railway has allowed connections from your IP

### "Invalid redirect URI" for Google OAuth
- Update Google Cloud Console with correct redirect URIs
- Make sure you're using the exact URL (including protocol and path)

### "Missing schema" or "Relation does not exist"
- Run the SQL migration files again
- Check that both `auth` and `recycling` schemas were created

### "Authentication failed" errors
- Double-check your `PGPASSWORD` is correct
- Verify the `DATABASE_URL` is properly formatted

---

## Important Notes

⚠️ **Database Migration**: If you have existing user data in your old database, you'll need to export it first before running these migrations. Contact me if you need help with data migration.

⚠️ **Environment Variables**: Make sure to update `.env` files in both:
- `backend/api/.env` (for the backend server)
- Root `.env` (for React Native app, if it references the backend)

⚠️ **Security**: Never commit your `.env` files to Git. They contain sensitive credentials.

---

## Next Steps After Migration

1. Test all authentication features (register, login, Google OAuth)
2. Test scanning functionality
3. Verify scan history is being saved
4. Monitor Railway usage to stay within free tier limits

---

Need help? Check the error logs and let me know what you see!
