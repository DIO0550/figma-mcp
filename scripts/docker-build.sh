#!/bin/bash

# Figma MCP Docker Build Script
# 
# Usage:
#   ./scripts/docker-build.sh [OPTIONS]
#
# Options:
#   -h, --help      Show this help message
#   --no-cache      Build without using cache
#   --clean         Clean up old images after build
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
USE_CACHE=true
CLEAN_AFTER_BUILD=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            echo "Figma MCP Docker Build Script"
            echo ""
            echo "Usage:"
            echo "  ./scripts/docker-build.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -h, --help      Show this help message"
            echo "  --no-cache      Build without using cache"
            echo "  --clean         Clean up old images after build"
            echo ""
            echo "This script builds the Figma MCP Server Docker image."
            exit 0
            ;;
        --no-cache)
            USE_CACHE=false
            shift
            ;;
        --clean)
            CLEAN_AFTER_BUILD=true
            shift
            ;;
        *)
            echo -e "${RED}Error: Unknown option $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Build options
BUILD_OPTS=""
if [ "$USE_CACHE" = false ]; then
    BUILD_OPTS="$BUILD_OPTS --no-cache"
fi

echo -e "${GREEN}Starting Figma MCP Server Docker build...${NC}"
echo ""

# Get the project root directory (parent of scripts/)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Check if Dockerfile exists
if [ ! -f "mcp-server/Dockerfile" ]; then
    echo -e "${RED}Error: mcp-server/Dockerfile not found${NC}"
    exit 1
fi

# Build MCP Server image
echo -e "${YELLOW}Building figma-mcp-server:latest...${NC}"
docker build $BUILD_OPTS \
    -f mcp-server/Dockerfile \
    -t figma-mcp-server:latest \
    .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Successfully built figma-mcp-server:latest${NC}"
else
    echo -e "${RED}✗ Failed to build figma-mcp-server:latest${NC}"
    exit 1
fi

# Clean up old images if requested
if [ "$CLEAN_AFTER_BUILD" = true ]; then
    echo ""
    echo -e "${YELLOW}Cleaning up dangling images...${NC}"
    docker image prune -f
    echo -e "${GREEN}✓ Cleanup completed${NC}"
fi

echo ""
echo -e "${GREEN}Build completed successfully!${NC}"
echo ""
echo "To run the MCP server:"
echo "  docker run --rm -i -e FIGMA_ACCESS_TOKEN figma-mcp-server:latest"
echo ""
echo "To use with Claude Desktop, add this to your claude_desktop_config.json:"
echo '  "figma-mcp": {'
echo '    "command": "docker",'
echo '    "args": ["run", "--rm", "-i", "-e", "FIGMA_ACCESS_TOKEN", "figma-mcp-server:latest"],'
echo '    "env": {'
echo '      "FIGMA_ACCESS_TOKEN": "your_token_here"'
echo '    }'
echo '  }'