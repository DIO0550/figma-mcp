# CLAUDE.md

受け答えは日本語でお願いします。

必ず最初に、`prompt-mcp-server`を利用して、実装のルールを確認して下さい

ESLintの無効化コメントの使用は禁止です。

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev     # Start development server with hot-reload (tsx watch)
npm run build   # Compile TypeScript to dist/
npm run lint    # Run ESLint on src/**/*.ts
npm run check   # TypeScript type checking without emit
npm run format  # Format code with Prettier
npm test        # Run tests with Vitest
npm start       # Run compiled JavaScript from dist/
```

## Architecture Overview

This is a Model Context Protocol (MCP) server that provides comprehensive access to Figma's REST API. The architecture follows MCP's tool-based pattern where each Figma operation is exposed as a separate tool with proper type validation using Zod schemas.

### Current Implementation Status

The server is fully implemented with the following tools:

- **`get_file`** - Retrieve complete file information and structure
- **`get_file_nodes`** - Get specific node details from a file
- **`get_components`** - List and analyze components and component sets
- **`get_styles`** - Fetch and categorize styles (color, text, effects, grids)
- **`export_images`** - Export designs as images with various formats and scales
- **`get_comments`** - Access and organize file comments into threads
- **`get_versions`** - Get and analyze version history
- **`parse_figma_url`** - Parse and extract information from Figma URLs

Each tool is fully implemented with:

- Authentication via Personal Access Token (stored in `.env` as `FIGMA_ACCESS_TOKEN`)
- Rate limiting with exponential backoff and retry logic
- Comprehensive error handling with MCP error responses
- Response caching for improved performance
- Extensive unit and integration tests using Vitest
- Full TypeScript type safety with strict mode

## Project Structure

```
src/
├── api/              # Figma API client and endpoint implementations
│   ├── client.ts     # Main API client factory
│   ├── config.ts     # API configuration
│   ├── context.ts    # Request context management
│   ├── data/         # Data fetching and transformation modules
│   ├── endpoints/    # Figma API endpoint implementations
│   └── figma-api-client.ts  # Main client class
├── config/           # Configuration utilities
│   ├── figma-info/   # Figma URL and file key parsing
│   └── runtime-config/  # Runtime configuration management
├── constants/        # Application constants
├── models/           # Business logic and data models
│   ├── comment/      # Comment threading and organization
│   ├── component/    # Component analysis and variants
│   ├── style/        # Style categorization and hierarchy
│   └── version/      # Version history analysis
├── tools/            # MCP tool implementations
│   ├── comment/      # get_comments tool
│   ├── component/    # get_components tool
│   ├── file/         # get_file and get_file_nodes tools
│   ├── image/        # export_images tool
│   ├── parse-figma-url/  # parse_figma_url tool
│   ├── style/        # get_styles tool
│   └── version/      # get_versions tool
├── types/            # TypeScript type definitions
│   └── api/          # Figma API response types
├── utils/            # Utility functions
│   ├── cache.ts      # Response caching
│   ├── logger/       # Logging with MCP integration
│   └── rate-limit.ts # Rate limiting and retry logic
└── index.ts          # MCP server entry point
```

### Key Technical Decisions

- **ES Modules**: Using `"type": "module"` in package.json
- **TypeScript**: Strict mode enabled with comprehensive type checking
- **Testing**: Comprehensive test coverage with Vitest and MSW for API mocking
- **Environment**: Node.js 20.x with modern JavaScript features
- **Dependencies**: MCP SDK, dotenv, and zod for schema validation
- **Architecture**: Clean separation between API, business logic, and MCP tools

## Implementation Guidelines

When working with this codebase:

1. **Environment Setup**: Store the Figma Personal Access Token in `.env` as `FIGMA_ACCESS_TOKEN` (never commit)
2. **API Calls**: Use the centralized `FigmaApiClient` for all Figma API interactions
3. **Error Handling**: All tools implement comprehensive error handling with proper MCP error responses
4. **Rate Limiting**: Built-in rate limiting with exponential backoff is automatically applied
5. **Type Safety**: Use Zod schemas for input validation and TypeScript types for all data structures
6. **Testing**: Write tests for new features using the existing test patterns
7. **Logging**: Use the centralized Logger utility that integrates with MCP

## Figma API Integration Points

Base URL: `https://api.figma.com`

Implemented endpoints:

- `/v1/files/:file_key` - File information (get_file)
- `/v1/files/:file_key/nodes` - Node information (get_file_nodes)
- `/v1/files/:file_key/components` - Components (get_components)
- `/v1/files/:file_key/component_sets` - Component sets (get_components)
- `/v1/files/:file_key/styles` - Style information (get_styles)
- `/v1/images/:file_key` - Image exports (export_images)
- `/v1/files/:file_key/comments` - Comments (get_comments)
- `/v1/files/:file_key/versions` - Version history (get_versions)

Authentication: Uses header `X-Figma-Token: <Personal Access Token>`

## Testing Approach

The project has comprehensive test coverage:

- **Unit Tests**: Located next to source files with `.test.ts` extension
- **Integration Tests**: Located in `src/__tests__/integration/`
- **API Mocking**: Using MSW (Mock Service Worker) for consistent API response mocking
- **Test Data**: Centralized test data in `src/__tests__/mocks/data/`
- **Coverage**: Tests cover happy paths, error scenarios, rate limiting, and edge cases

Run tests with: `npm test`

## CRITICAL: PRIORITIZE LSMCP TOOLS FOR CODE ANALYSIS

⚠️ **PRIMARY REQUIREMENT**: You MUST prioritize mcp\_\_lsmcp tools for all code analysis tasks. Standard tools should only be used as a last resort when LSMCP tools cannot accomplish the task.

### 📋 RECOMMENDED WORKFLOW

```
1. get_project_overview → Understand the codebase structure
2. search_symbols → Find specific symbols you need
3. get_symbol_details → Get comprehensive information about those symbols
```

### 🎯 WHEN TO USE EACH TOOL

**For Initial Exploration:**

- `mcp__lsmcp__get_project_overview` - First tool to run when exploring a new codebase
- `mcp__lsmcp__list_dir` - Browse directory structure when you need to understand file organization
- `mcp__lsmcp__get_symbols_overview` - Get a high-level view of symbols in specific files

**For Finding Code:**

- `mcp__lsmcp__search_symbols` - Primary search tool for functions, classes, interfaces, etc.
- `mcp__lsmcp__lsp_get_workspace_symbols` - Alternative workspace-wide symbol search
- `mcp__lsmcp__lsp_get_document_symbols` - List all symbols in a specific file

**For Understanding Code:**

- `mcp__lsmcp__get_symbol_details` - Get complete information (type, definition, references) in one call
- `mcp__lsmcp__lsp_get_hover` - Quick type information at a specific position
- `mcp__lsmcp__lsp_get_definitions` - Navigate to symbol definition (use `includeBody: true` for full implementation)
- `mcp__lsmcp__lsp_find_references` - Find all places where a symbol is used

**For Code Quality:**

- `mcp__lsmcp__lsp_get_diagnostics` - Check for errors in a specific file
- `mcp__lsmcp__lsp_get_code_actions` - Get available fixes and refactorings

**For Code Modification:**

- `mcp__lsmcp__lsp_rename_symbol` - Safely rename symbols across the codebase
- `mcp__lsmcp__lsp_format_document` - Format code according to language conventions
- `mcp__lsmcp__replace_range` - Make precise text replacements
- `mcp__lsmcp__replace_regex` - Pattern-based replacements
- `mcp__lsmcp__lsp_delete_symbol` - Remove symbols and their references

**For Developer Assistance:**

- `mcp__lsmcp__lsp_get_completion` - Get code completion suggestions
- `mcp__lsmcp__lsp_get_signature_help` - Get function parameter hints
- `mcp__lsmcp__lsp_check_capabilities` - Check what LSP features are available

### 📊 DETAILED WORKFLOW EXAMPLES

**1. EXPLORING A NEW CODEBASE**

```
1. mcp__lsmcp__get_project_overview
   → Understand structure, main components, statistics
2. mcp__lsmcp__search_symbols --kind "class"
   → Find all classes in the project
3. mcp__lsmcp__get_symbol_details --symbol "MainClass"
   → Deep dive into specific class implementation
```

**2. INVESTIGATING A BUG**

```
1. mcp__lsmcp__search_symbols --name "problematicFunction"
   → Locate the function
2. mcp__lsmcp__get_symbol_details --symbol "problematicFunction"
   → Understand its type, implementation, and usage
3. mcp__lsmcp__lsp_find_references --symbolName "problematicFunction"
   → See all places it's called
4. mcp__lsmcp__lsp_get_diagnostics --relativePath "path/to/file.ts"
   → Check for errors
```

**3. REFACTORING CODE**

```
1. mcp__lsmcp__search_symbols --name "oldMethodName"
   → Find the method to refactor
2. mcp__lsmcp__get_symbol_details --symbol "oldMethodName"
   → Understand current implementation and usage
3. mcp__lsmcp__lsp_rename_symbol --symbolName "oldMethodName" --newName "newMethodName"
   → Safely rename across codebase
4. mcp__lsmcp__lsp_format_document --relativePath "path/to/file.ts"
   → Clean up formatting
```

**4. ADDING NEW FEATURES**

```
1. mcp__lsmcp__get_project_overview
   → Understand existing architecture
2. mcp__lsmcp__search_symbols --kind "interface"
   → Find relevant interfaces to implement
3. mcp__lsmcp__get_symbol_details --symbol "IUserService"
   → Understand interface requirements
4. mcp__lsmcp__lsp_get_completion --line 50
   → Get suggestions while writing new code
```

**FALLBACK TOOLS (USE ONLY WHEN NECESSARY):**

- ⚠️ `Read` - Only when you need to see non-code files or LSMCP tools fail
- ⚠️ `Grep` - For text pattern searches in files (replaces removed search_for_pattern tool)
- ⚠️ `Glob` - Only when LSMCP file finding doesn't work
- ⚠️ `LS` - Only for basic directory listing when LSMCP fails
- ⚠️ `Bash` commands - Only for non-code operations or troubleshooting

### WHEN TO USE FALLBACK TOOLS

Use standard tools ONLY in these situations:

1. **Non-code files**: README, documentation, configuration files
2. **LSMCP tool failures**: When LSMCP tools return errors or no results
3. **Debugging**: When troubleshooting why LSMCP tools aren't working
4. **Special file formats**: Files that LSMCP doesn't support
5. **Quick verification**: Double-checking LSMCP results when needed

## Memory System

You have access to project memories stored in `.lsmcp/memories/`. Use these tools:

- `mcp__lsmcp__list_memories` - List available memory files
- `mcp__lsmcp__read_memory` - Read specific memory content
- `mcp__lsmcp__write_memory` - Create or update memories
- `mcp__lsmcp__delete_memory` - Delete a memory file

Memories contain important project context, conventions, and guidelines that help maintain consistency.

The context and modes of operation are described below. From them you can infer how to interact with your user
and which tasks and kinds of interactions are expected of you.
