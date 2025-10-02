# Backend Setup Guide

## Quick Start

To fix the "Error creating room" issue, you need to start the backend services:

### 1. Start All Services (Recommended)
```bash
cd d:\projects\SketchKaro
bun run dev
```

This will start:
- Web frontend (Next.js) - http://localhost:3000
- HTTP Backend (Express) - http://localhost:3001  
- WebSocket Backend (Bun) - http://localhost:8080

### 2. Start Individual Services (Alternative)

If you prefer to start services individually:

**HTTP Backend:**
```bash
cd d:\projects\SketchKaro\apps\http-backend
bun run dev
```

**WebSocket Backend:**
```bash
cd d:\projects\SketchKaro\apps\ws-backend
bun run dev
```

**Frontend:**
```bash
cd d:\projects\SketchKaro\apps\web
bun run dev
```

## Database Setup

If you encounter database connection issues:

1. Make sure PostgreSQL is running
2. Create a `.env.local` file in the root directory with:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/sketchkaro"
   JWT_SECRET="your-secret-key"
   ```

3. Run database migrations:
   ```bash
   cd packages/db
   npx prisma migrate dev
   ```

## Troubleshooting

- **Error creating room**: Backend services are not running
- **Authentication failed**: JWT_SECRET not configured
- **Database errors**: PostgreSQL not running or DATABASE_URL incorrect
- **Connection refused**: Check if services are running on correct ports

## Service Status

The frontend now shows backend status indicators:
- 🟢 Green dot: Services online
- 🔴 Red warning: Services offline with setup instructions