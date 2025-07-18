# Build stage for github-mcp-server
FROM node:20-alpine AS github-mcp-builder
RUN apk add --no-cache git python3 make g++
RUN git clone https://github.com/modelcontextprotocol/servers.git /tmp/mcp-servers
WORKDIR /tmp/mcp-servers/src/github
RUN npm install && npm run build

# Build stage for similarity-ts
FROM rust:latest AS similarity-builder
RUN cargo install similarity-ts

# Main stage
FROM ubuntu:24.04

# Set environment to avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Set locale for Japanese support
ENV LANG=ja_JP.UTF-8
ENV LANGUAGE=ja_JP:ja
ENV LC_ALL=ja_JP.UTF-8

# Install essential packages and Japanese language support
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    jq \
    build-essential \
    ca-certificates \
    gnupg \
    sudo \
    locales \
    language-pack-ja \
    fonts-noto-cjk \
    fcitx-mozc \
    && locale-gen ja_JP.UTF-8 \
    && update-locale LANG=ja_JP.UTF-8 \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20.x
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm

# Install Claude Code CLI
RUN npm install -g @anthropic-ai/claude-code

# Copy built binaries from build stages
COPY --from=github-mcp-builder /tmp/mcp-servers/src/github /opt/mcp-servers/github
COPY --from=similarity-builder /usr/local/cargo/bin/similarity-ts /usr/local/bin/

# Make binaries executable
RUN chmod +x /usr/local/bin/similarity-ts

# Create node user with sudo privileges
RUN useradd -ms /bin/bash node \
    && usermod -aG sudo node \
    && echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

# Switch to node user
USER node
WORKDIR /home/node

# Set up workspace
WORKDIR /workspace

# Configure git to use rebase by default and set up useful aliases
RUN git config --global pull.rebase true \
    && git config --global alias.co checkout \
    && git config --global alias.br branch \
    && git config --global alias.ci commit \
    && git config --global alias.st status \
    && git config --global alias.lg "log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit" \
    && git config --global init.defaultBranch main 

# Expose port for MCP server (using 8765 instead of 3001)
EXPOSE 8765

# Default command
CMD ["/bin/bash"]