# Build stage for github-mcp-server
FROM golang:1.23-bullseye AS github-builder
RUN git clone https://github.com/github/github-mcp-server.git /tmp/github-mcp-server \
    && cd /tmp/github-mcp-server \
    && go build -o github-mcp-server ./cmd/github-mcp-server

# Build stage for similarity-ts
FROM rust:latest AS similarity-builder
RUN cargo install similarity-ts

# Main stage - Use the common base image
FROM figma-mcp-base:latest AS development

# Switch back to root for additional installations
USER root

# Install additional packages for development
RUN apt-get update && apt-get install -y \
    fcitx-mozc \
    && rm -rf /var/lib/apt/lists/*

# Install Claude Code CLI
RUN npm install -g @anthropic-ai/claude-code

# Copy built binaries from build stages
COPY --from=github-builder /tmp/github-mcp-server/github-mcp-server /usr/local/bin/
COPY --from=similarity-builder /usr/local/cargo/bin/similarity-ts /usr/local/bin/

# Make binaries executable
RUN chmod +x /usr/local/bin/github-mcp-server \
    && chmod +x /usr/local/bin/similarity-ts

# Switch back to node user
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