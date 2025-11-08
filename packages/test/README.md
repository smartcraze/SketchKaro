# @repo/test

Centralized test suite for SketchKaro backend services.

## Overview

This package contains comprehensive test suites for:
- **WebSocket Backend** (`ws-backend.test.ts`) - Real-time communication tests
- **HTTP Backend** (`http-backend.test.ts`) - REST API endpoint tests

## Prerequisites

Before running tests, ensure both backend servers are running:

1. **Database setup**:
   ```bash
   # Ensure PostgreSQL is running
   # Run migrations from project root
   cd packages/db
   bunx prisma migrate dev
   ```

2. **Start the WebSocket server** (port 8080):
   ```bash
   # From project root or in a separate terminal
   cd apps/ws-backend
   bun run dev
   ```

3. **Start the HTTP server** (port 3001):
   ```bash
   # From project root or in a separate terminal
   cd apps/http-backend
   bun run dev
   ```

**Note**: The Prisma client may sometimes lock files during installation. If you encounter EPERM errors, simply restart the terminal or wait a moment and try again.

## Installation

```bash
bun install
```

## Running Tests

### Quick Start (Recommended)
The test runner script checks if servers are running before executing tests:

```powershell
# PowerShell (Windows)
bun run test:check
```

```bash
# Bash (Linux/Mac)
./run-tests.sh
```

### Run all tests
```bash
bun test
```

### Run specific test suite
```bash
# WebSocket tests only
bun test:ws

# HTTP tests only
bun test:http
```

### Watch mode
```bash
bun test:watch
```

### Run from project root
```bash
# From the root of the SketchKaro project
cd packages/test
bun test
```

## Test Coverage

### WebSocket Server Tests
- ✅ Health check endpoint
- ✅ JWT authentication
- ✅ Demo mode (no authentication)
- ✅ Ping/Pong messages
- ✅ Room join/leave functionality
- ✅ Drawing message broadcasting
- ✅ Chat message broadcasting
- ✅ Canvas clearing
- ✅ Error handling (invalid JSON, unknown message types)
- ✅ Connection cleanup

### HTTP Server Tests
- ✅ Root endpoint
- ✅ Health check
- ✅ User signup
- ✅ User login
- ✅ Get current user (`/me`)
- ✅ Room creation
- ✅ Room lookup by slug
- ✅ Drawing message retrieval
- ✅ Chat message retrieval with pagination
- ✅ Authentication middleware
- ✅ CORS headers
- ✅ Error handling

## Test Structure

Each test file follows this pattern:
```typescript
describe("Feature Group", () => {
  beforeAll(() => {
    // Setup before all tests
  });

  afterAll(() => {
    // Cleanup after all tests
  });

  describe("Specific Feature", () => {
    test("should do something", async () => {
      // Test implementation
    });
  });
});
```

## Environment Variables

Tests use the following environment variables:
- `JWT_SECRET` - JWT signing secret (from `@repo/backend-common`)
- `DATABASE_URL` - PostgreSQL connection string (from `@repo/db`)

## Notes

- Tests create and clean up their own test data
- WebSocket tests use unique room IDs to avoid conflicts
- HTTP tests use timestamps in email addresses for uniqueness
- All tests are async and use proper cleanup mechanisms
- Tests expect servers to be already running (not spawned by tests)

## Troubleshooting

### Tests failing to connect
- Verify both servers are running
- Check ports 8080 (WebSocket) and 3001 (HTTP) are available
- Ensure no firewall blocking local connections

### Database errors
- Run `bunx prisma migrate dev` in `packages/db`
- Check `DATABASE_URL` is set correctly
- Verify PostgreSQL is running

### Authentication errors
- Ensure `JWT_SECRET` environment variable is set
- Check token expiration settings

### Prisma installation errors (EPERM)
- Close any processes that might be using the Prisma files
- Wait a moment and try `bun install` again
- Restart your terminal/IDE if the issue persists

## Future Improvements

- [ ] Add integration tests
- [ ] Add load testing
- [ ] Add end-to-end tests
- [ ] Mock database for unit tests
- [ ] Add code coverage reporting
- [ ] Add CI/CD pipeline integration

---

This project uses [Bun](https://bun.com) as the JavaScript runtime and test runner.
