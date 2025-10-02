# WebSocket Diagnostic Guide

## Quick Diagnosis

The `❌ WebSocket error: {}` error indicates that the WebSocket server is not running or not reachable.

### 1. Check if WebSocket Server is Running

Run this command to check if port 8080 is listening:

```bash
# On Windows (PowerShell)
netstat -an | findstr :8080

# On Linux/Mac
lsof -i :8080
```

### 2. Start the WebSocket Backend

```bash
# From project root
cd d:\projects\SketchKaro
bun run dev

# Or start just the WebSocket backend
cd apps/ws-backend
bun run dev
```

### 3. Test WebSocket Connection

Open browser console and run:

```javascript
// Test WebSocket connection
const testWS = new WebSocket('ws://localhost:8080');
testWS.onopen = () => console.log('✅ WebSocket connected');
testWS.onerror = (error) => console.error('❌ WebSocket failed:', error);
testWS.onclose = (event) => console.log('🔌 WebSocket closed:', event.code, event.reason);
```

### 4. Common Issues & Solutions

**Error: ECONNREFUSED**
- Solution: WebSocket server not running. Run `bun run dev`

**Error: Network Error** 
- Solution: Check if port 8080 is blocked by firewall
- Try: `telnet localhost 8080`

**Error: 403 Forbidden**
- Solution: CORS issue. Check WebSocket server configuration

**Error: 1006 Abnormal Closure**
- Solution: Server crashed or network issue. Check server logs

### 5. Enhanced Error Handling

The RoomCanvas component now provides:
- ✅ Detailed error logging with timestamps
- ✅ Automatic retry with exponential backoff
- ✅ User-friendly error messages
- ✅ Manual retry option
- ✅ Connection status indicators

### 6. Debug Mode

Enable debug logging by adding to your browser console:
```javascript
localStorage.setItem('debug', 'websocket');
```

## Service Status Check

| Service | Port | Status | Command |
|---------|------|--------|---------|
| Frontend | 3000 | Running | `cd apps/web && bun run dev` |
| HTTP Backend | 3001 | Running | `cd apps/http-backend && bun run dev` |
| WebSocket | 8080 | **NOT RUNNING** | `cd apps/ws-backend && bun run dev` |

**The WebSocket error occurs because the WebSocket backend on port 8080 is not running.**