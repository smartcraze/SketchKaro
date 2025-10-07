# SketchKaro Deployment Guide

## 🚀 Deployment Overview

This guide helps you deploy SketchKaro with:
- **Frontend**: Vercel (Next.js)
- **Backends**: Render (Docker containers)
- **Database**: PostgreSQL (managed)

## 📋 Required Environment Variables

### For Both Backends (HTTP & WebSocket)

```bash
# Database Connection
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Port (usually set by hosting provider)
PORT=3001  # for http-backend
PORT=8080  # for ws-backend

# Node Environment
NODE_ENV=production
```

### For Frontend (Next.js on Vercel)

```bash
# Backend URLs (replace with your deployed URLs)
NEXT_PUBLIC_HTTP_BACKEND=https://your-http-backend.onrender.com
NEXT_PUBLIC_WS_URL=wss://your-ws-backend.onrender.com
```

## 🐳 Docker Images Built

✅ **HTTP Backend**: `sketchkaro-http-backend:prod`
✅ **WebSocket Backend**: `sketchkaro-ws-backend:prod`

Both images include:
- OpenSSL for Prisma compatibility
- Health check endpoints (`/health`)
- Optimized for production deployment

## 🔧 Render Deployment Steps

### 1. Database Setup
1. Create a PostgreSQL database on Render or any provider
2. Get the connection string: `postgresql://user:pass@host:port/db`

### 2. Deploy HTTP Backend
1. **Create New Web Service** on Render
2. **Connect Repository**: Link your GitHub repo
3. **Configuration**:
   ```
   Build Command: docker build -t sketchkaro-http-backend:prod -f apps/http-backend/Dockerfile.prod .
   Start Command: docker run -p $PORT:3001 sketchkaro-http-backend:prod
   ```
4. **Environment Variables**:
   ```
   DATABASE_URL=your_postgresql_url
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=production
   PORT=3001
   ```
5. **Health Check**: `/health`

### 3. Deploy WebSocket Backend
1. **Create New Web Service** on Render
2. **Connect Repository**: Link your GitHub repo
3. **Configuration**:
   ```
   Build Command: docker build -t sketchkaro-ws-backend:prod -f apps/ws-backend/Dockerfile.prod .
   Start Command: docker run -p $PORT:8080 sketchkaro-ws-backend:prod
   ```
4. **Environment Variables**:
   ```
   DATABASE_URL=your_postgresql_url
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=production
   PORT=8080
   ```
5. **Health Check**: `/health`

### 4. Database Migration
After both services are deployed, run migrations:
```bash
# Connect to your database and run:
cd packages/db
bunx prisma migrate deploy
bunx prisma generate
```

## 🌐 Vercel Deployment Steps

### 1. Setup Project
1. **Connect Repository** to Vercel
2. **Framework**: Next.js
3. **Root Directory**: `apps/web`

### 2. Build Configuration
```json
{
  "framework": "nextjs",
  "buildCommand": "cd ../.. && bun install && cd apps/web && bun run build",
  "installCommand": "cd ../.. && bun install",
  "outputDirectory": "apps/web/.next"
}
```

### 3. Environment Variables
Add in Vercel dashboard:
```bash
NEXT_PUBLIC_HTTP_BACKEND=https://your-http-backend.onrender.com
NEXT_PUBLIC_WS_URL=wss://your-ws-backend.onrender.com
```

## 🔍 Health Checks & Testing

### Backend Health Checks
- **HTTP Backend**: `GET https://your-http-backend.onrender.com/health`
- **WebSocket Backend**: `GET https://your-ws-backend.onrender.com/health`

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-03T..."
}
```

### Frontend Testing
1. Visit your Vercel URL
2. Test user registration/login
3. Create/join rooms
4. Test drawing functionality
5. Test chat functionality

## 🔐 Security Considerations

1. **Change JWT_SECRET**: Use a strong, unique secret in production
2. **Database Security**: Ensure your database has proper access controls
3. **CORS**: Configure CORS for your frontend domain
4. **Environment Variables**: Never commit secrets to git

## 📝 Deployment Checklist

- [ ] PostgreSQL database created and accessible
- [ ] Database migrations run successfully
- [ ] HTTP backend deployed with health check passing
- [ ] WebSocket backend deployed with health check passing
- [ ] Frontend deployed on Vercel
- [ ] Environment variables configured correctly
- [ ] JWT_SECRET is secure and consistent across backends
- [ ] All services can communicate with each other
- [ ] Test user registration and room functionality

## 🚨 Common Issues

### 1. Database Connection Errors
- Verify DATABASE_URL format
- Check database firewall settings
- Ensure database is accessible from Render

### 2. JWT Token Issues
- Ensure JWT_SECRET is identical in both backends
- Check token expiration settings

### 3. WebSocket Connection Issues
- Use `wss://` (not `ws://`) for HTTPS sites
- Verify WebSocket backend URL in frontend env vars

### 4. Build Failures
- Check Docker image builds locally first
- Verify all dependencies are in package.json
- Check for missing environment variables during build

## 📞 Support

If you encounter issues:
1. Check service logs in Render dashboard
2. Verify environment variables
3. Test health endpoints
4. Check database connectivity

Your SketchKaro app should now be fully deployed! 🎉