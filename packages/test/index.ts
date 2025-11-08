/**
 * @repo/test
 * 
 * Centralized test suite for SketchKaro backend services.
 * 
 * To run tests:
 * - bun test           - Run all tests
 * - bun test:ws        - Run WebSocket tests only
 * - bun test:http      - Run HTTP tests only
 * - bun test:watch     - Run tests in watch mode
 * 
 * Prerequisites:
 * - WebSocket server running on port 8080
 * - HTTP server running on port 3001
 * - Database migrations applied
 */

export * from "./ws-backend.test";
export * from "./http-backend.test";