FROM oven/bun:latest

WORKDIR /app

# Copy root package files first for workspace
COPY package.json bun.lock* ./
COPY turbo.json ./

# Copy workspace packages
COPY packages/ ./packages/

# Copy the http-backend app
COPY apps/http-backend/ ./apps/http-backend/

# Install all dependencies (handles workspace)
RUN bun install

# Change to http-backend directory and build
WORKDIR /app/apps/http-backend
RUN bun run build

EXPOSE 3001

CMD [ "bun", "run", "start" ]
