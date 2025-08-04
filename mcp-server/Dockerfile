# Dockerfile for Figma MCP Server
# Multi-stage build for optimal image size

# Stage 1: Build stage
FROM node:20-bullseye AS builder

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies with clean install for reproducibility
RUN npm ci

# Copy only necessary TypeScript config files
COPY tsconfig.json tsconfig.build.json ./

# Copy source code (excluding test files via .dockerignore)
COPY src ./src

# Build the application
RUN npm run build

# Stage 2: Production stage
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user with UID/GID 10001 to avoid system user conflicts
RUN addgroup -g 10001 -S nodejs && \
    adduser -S nodejs -u 10001

# Set working directory
WORKDIR /app

# Copy package files (optimized for production)
COPY --chown=nodejs:nodejs package*.json ./

# Switch to non-root user before installing dependencies
USER nodejs

# Install only production dependencies
RUN npm ci --omit=dev && \
    npm cache clean --force && \
    # Remove package files after installation (no longer needed)
    rm -f package*.json

# Copy only the built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Create necessary directories
RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app/logs

# Expose MCP server port
EXPOSE 8765

# Set production environment
ENV NODE_ENV=production

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Run the MCP server
CMD ["node", "dist/index.js"]