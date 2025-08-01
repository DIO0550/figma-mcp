# CLAUDE.md

受け答えは日本語でお願いします。

必ず最初に、`prompt-mcp-server`を利用して、実装のルールを確認して下さい

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev     # Start development server with hot-reload (tsx watch)
npm run build   # Compile TypeScript to dist/
npm run lint    # Run ESLint on src/**/*.ts
npm run format  # Format code with Prettier
npm test        # Run tests with Vitest (no tests implemented yet)
npm start       # Run compiled JavaScript from dist/
```

## Architecture Overview

This is a Model Context Protocol (MCP) server that provides access to Figma's REST API. The architecture follows MCP's tool-based pattern where each Figma operation is exposed as a separate tool.

### Current Implementation Status

The codebase currently contains a minimal skeleton (`src/index.ts`) with:

- Basic MCP server setup using StdioServerTransport
- One placeholder tool (`get_file`)
- Environment variable configuration

### Planned Architecture (from `doc/requirements.md`)

The server will implement these tools:

- `get_file` - Retrieve file information
- `get_nodes` - Get node details
- `get_components` - List components
- `get_styles` - Fetch styles (color, text, effects)
- `export_images` - Export designs as images
- `get_comments` - Access comments
- `get_versions` - Get version history

Each tool will interact with Figma's REST API v1 endpoints and handle:

- Authentication via Personal Access Token (stored in `.env`)
- Rate limiting and retry logic
- Error handling with appropriate MCP error responses
- Response caching for performance

### Key Technical Decisions

- **ES Modules**: Using `"type": "module"` in package.json
- **TypeScript**: Strict mode enabled with comprehensive type checking
- **Environment**: Node.js 20.x with modern JavaScript features
- **Dependencies**: Minimal - only MCP SDK and dotenv

## Implementation Guidelines

When implementing Figma API integration:

1. Store the Figma Personal Access Token in `.env` (never commit)
2. Use the standard Fetch API for HTTP requests to Figma API
3. Implement proper error handling for API failures and rate limits
4. Follow the existing TypeScript configuration (strict mode)
5. Each tool should validate inputs using the defined inputSchema
6. Return appropriate content types in tool responses

## Figma API Integration Points

Base URL: `https://api.figma.com`

Key endpoints to implement:

- `/v1/files/:file_key` - File information
- `/v1/files/:file_key/nodes` - Node information
- `/v1/files/:file_key/components` - Components
- `/v1/images/:file_key` - Image exports
- `/v1/files/:file_key/comments` - Comments
- `/v1/files/:file_key/versions` - Version history

Authentication: Add header `X-Figma-Token: <Personal Access Token>`

## Testing Approach

While no tests exist yet, the project is configured for Vitest. When adding tests:

- Place test files next to source files with `.test.ts` extension
- Mock Figma API responses for unit tests
- Test error handling scenarios (rate limits, network failures)
- Verify tool input validation
