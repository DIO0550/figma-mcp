# Dockerfile for Figma MCP Server
# Multi-stage build for optimal image size

# Stage 1: Build stage
FROM figma-mcp-base:latest AS builder

# Switch back to root for dependency installation
USER root

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Copy source code
COPY tsconfig*.json ./
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

# Copy package files (optimized: single layer)
COPY package*.json ./

# Change ownership to nodejs user before npm ci
RUN chown -R nodejs:nodejs /app

# Switch to non-root user before installing dependencies
USER nodejs

# Install only production dependencies
RUN npm ci --omit=dev && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Expose MCP server port
EXPOSE 8765

# Set production environment
ENV NODE_ENV=production

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Run the MCP server
CMD ["node", "dist/index.js"]