FROM oven/bun:latest

WORKDIR /app

# Copy root package files first for workspace
COPY package.json bun.lock* ./
COPY turbo.json ./

# Copy workspace packages
COPY packages/ ./packages/

# Copy the web app
COPY apps/web/ ./apps/web/

# Install all dependencies (handles workspace)
RUN bun install

# Change to web app directory and build
WORKDIR /app/apps/web
RUN bun run build

EXPOSE 3000

CMD [ "bun", "run", "start" ]