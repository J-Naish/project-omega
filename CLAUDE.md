# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a monorepo with four main components:

1. **MCP Servers** (`/mcp-servers/`) - Model Context Protocol server implementations
2. **Client Application** (`/client/`) - Next.js chat interface
3. **Express Server** (`/server/`) - TypeScript Express server
4. **Documentation** - Architecture and technology stack documentation

## Development Commands

### MCP Servers

**Notion Server** (`/mcp-servers/notion/`):

- `npm run build` - Build TypeScript and create CLI executable
- `npm run dev` - Start development server with watch mode
- Built CLI: `bin/cli.mjs`

**Slack Server** (`/mcp-servers/slack/`):

- `npm run build` - Compile TypeScript to dist/
- `npm run watch` - Watch mode compilation
- `npm run prepare` - Build and make executable

**Google Drive Server** (`/mcp-servers/gdrive/`):

- `npm run build` - Build TypeScript and create executable
- `npm run watch` - Watch mode compilation
- Built executable: `dist/index.js`
- Authentication: Run with `auth` argument first to authenticate with Google

### Client Application (`/client/`)

- `npm run dev` - Start Next.js development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Express Server (`/server/`)

- `npm run dev` - Start development server with nodemon and ts-node
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server from built files
- Hosts the chat API at `/api/chat` endpoint

## Architecture Overview

### MCP Server Architecture

Three distinct architectural patterns are used:

**Standalone MCP Servers** (Google Drive):

- Traditional MCP server implementation with stdio transport
- Hand-coded MCP tool implementations
- Single-file architecture with custom tool definitions
- Direct MCP protocol handling
- Google Drive: OAuth2 authentication with Google APIs

**AI SDK Integrated Tools** (Slack, Notion):

- Direct integration into Express server as AI SDK tools
- No separate MCP server process required
- Extracted from original MCP server implementation
- Better performance and simpler deployment
- Type-safe implementation with comprehensive TypeScript interfaces
- Unified tool interface with action-based parameters

**Legacy OpenAPI-based Servers** (Original Notion):

- Generic framework that auto-generates MCP tools from OpenAPI specifications
- Core components:
  - `MCPProxy` - Converts OpenAPI operations to MCP tools
  - `OpenAPIToMCPConverter` - Transforms schemas
  - `HttpClient` - Handles API requests with authentication
- Configuration via environment variables and headers
- **Note**: Notion has been migrated to AI SDK integration for better performance

### Client Application Architecture

**Next.js 15 with App Router**:

- React 19 with TypeScript
- Tailwind CSS 4 for styling
- AI SDK for multi-provider AI integration (Anthropic, OpenAI)
- OpenTelemetry for observability
- Connects to Express server for chat functionality

**Key Components**:

- `chat-interface.tsx` - Main chat UI component
- `chat-input.tsx` - User input handling
- `message-area.tsx` - Message display
- Custom UI components using Radix UI and Tailwind

### Express Server Architecture

**TypeScript Express Server**:

- Express.js with TypeScript support
- Development setup with nodemon and ts-node for hot reload
- Production build compilation with TypeScript compiler
- Chat API endpoint at `/api/chat` with MCP integration
- Basic REST API endpoints (`/` and `/health`)
- CORS enabled for client communication
- JSON and URL-encoded request parsing middleware
- Runs on port 8080 (configurable via PORT environment variable)

### MCP Server Development Patterns

When working with MCP servers:

1. **For new integrations**: Prefer AI SDK tool integration for better performance (like Slack, Notion)
2. **For standalone external integrations**: Use traditional MCP server pattern with stdio transport (like Google Drive)
3. **For legacy OpenAPI specs**: Original openapi-mcp-server framework (deprecated, migrate to AI SDK)
4. **Authentication**: Configure via environment variables and headers, or OAuth2 flow for Google Drive
5. **Transport**: Standalone servers use stdio transport; integrated tools run directly in Express process
6. **Google Drive specific**: Requires initial OAuth2 authentication flow before server usage

### Converting MCP Servers to AI SDK Tools

To integrate an MCP server directly into the Express server:

1. **Extract the client class** from the MCP server implementation
2. **Create AI SDK tool using `tool()` function** from the `ai` package
3. **Define comprehensive TypeScript interfaces** to replace `any` types
4. **Implement unified tool with action-based parameters** for multiple operations
5. **Update Express server** to include the new tool in the tools object
6. **Configure environment variables** in the Express server environment

### Client Development Patterns

- Use existing UI components in `/src/components/ui/`
- Follow Next.js App Router conventions
- AI integration through AI SDK with React hooks
- Styling with Tailwind CSS and class-variance-authority for variants
- Type safety with Zod for schema validation

## Environment Configuration

### Express Server Tools

- **Notion**: `NOTION_TOKEN` for Notion API authentication
- **Slack**: `SLACK_BOT_TOKEN`, `SLACK_TEAM_ID`, `SLACK_CHANNEL_IDS`

### Standalone MCP Servers

- **Google Drive**: OAuth2 credentials stored in `.gdrive-server-credentials.json` (auto-generated after auth)

### Legacy (Deprecated)

- **Original Notion MCP**: `OPENAPI_MCP_HEADERS` for API authentication (JSON format) - use AI SDK integration instead

### Client Application

- Next.js environment variables for API keys and configuration
- OpenTelemetry configuration for observability

## Tool Capabilities

### Slack Integration (AI SDK Tool)

**Available Actions**:

- `list_channels` - List public or pre-defined channels in the workspace
- `post_message` - Post a new message to a Slack channel
- `reply_to_thread` - Reply to a specific message thread
- `add_reaction` - Add emoji reactions to messages
- `get_channel_history` - Get recent messages from a channel
- `get_thread_replies` - Get all replies in a message thread
- `get_users` - List workspace users with profile information
- `get_user_profile` - Get detailed profile for a specific user

**Implementation**:

- Direct integration into Express server as unified AI SDK tool
- Type-safe implementation with comprehensive TypeScript interfaces
- Action-based parameter system for multiple operations
- Environment variables: `SLACK_BOT_TOKEN`, `SLACK_TEAM_ID`, `SLACK_CHANNEL_IDS`

### Notion Integration (AI SDK Tool)

**Available Actions**:

- `get_user` - Retrieve a specific user by ID
- `get_users` - List all users in the workspace
- `get_current_user` - Get the authenticated user's information
- `search` - Search across pages and databases in the workspace
- `get_database` - Retrieve database structure and metadata
- `query_database` - Query database with filters and sorting
- `create_database` - Create a new database
- `update_database` - Update database properties
- `get_page` - Retrieve page content and properties
- `create_page` - Create new pages in databases or as child pages
- `update_page` - Update page properties and content
- `get_block` - Retrieve individual block content
- `get_block_children` - Get child blocks of a page or block
- `append_block_children` - Add new blocks to a page or block
- `update_block` - Update block content
- `delete_block` - Delete a block
- `get_comments` - Retrieve comments on pages or blocks
- `create_comment` - Add comments to pages or blocks

**Implementation**:

- Direct integration into Express server as unified AI SDK tool
- Type-safe implementation with comprehensive TypeScript interfaces
- Action-based parameter system for 18 different operations
- Full coverage of Notion API v1 capabilities
- Environment variables: `NOTION_TOKEN`

### Google Drive MCP Server

**Available Tools**:

- `search` - Search for files in Google Drive by content or metadata
  - Searches within file content and names
  - Returns file names, types, modification times, and sizes
  - Limited to 10 results per search

**Resource Access**:

- Read Google Drive files with automatic format conversion:
  - Google Docs → Markdown format
  - Google Sheets → CSV format
  - Google Slides → Plain text format
  - Other files → Native format or base64 encoding

**Authentication Flow**:

1. Run `node dist/index.js auth` to initiate OAuth2 flow
2. Credentials saved to `.gdrive-server-credentials.json`
3. Server can then be used in production mode

**Integration**:

- Traditional MCP server with stdio transport
- Available in Express server chat API at `/api/chat`
- Enables AI to search and access Google Drive content in responses

## Testing

No specific test commands are configured at the root level. Individual components may have their own test configurations.
