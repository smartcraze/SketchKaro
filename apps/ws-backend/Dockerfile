FROM oven/bun:latest

WORKDIR /app

# Copy root package files first for workspace
COPY package.json bun.lock* ./
COPY turbo.json ./

# Copy workspace packages
COPY packages/ ./packages/

# Copy the ws-backend app
COPY apps/ws-backend/ ./apps/ws-backend/

# Install all dependencies (handles workspace)
RUN bun install

# Change to ws-backend directory and build
WORKDIR /app/apps/ws-backend
RUN bun run build

EXPOSE 8080

CMD [ "bun", "run", "start" ]
