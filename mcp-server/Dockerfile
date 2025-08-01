# Dockerfile for Figma MCP Server
# Build from common base image
FROM figma-mcp-base:latest AS builder

# Switch back to root for dependency installation
USER root

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy source code
COPY tsconfig*.json ./
COPY src ./src

# Build the application
RUN pnpm build

# Remove devDependencies and build files
RUN pnpm prune --prod && \
    rm -rf src tsconfig*.json

# Create production user without sudo
RUN useradd -r -s /bin/false -d /app mcpserver

# Change ownership
RUN chown -R mcpserver:mcpserver /app

# Switch to production user
USER mcpserver

# Expose MCP server port
EXPOSE 8765

# Set production environment
ENV NODE_ENV=production

# Run the MCP server
CMD ["node", "dist/index.js"]