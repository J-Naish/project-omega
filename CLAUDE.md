# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a monorepo with three main components:

1. **MCP Servers** (`/mcp-servers/`) - Model Context Protocol server implementations
2. **Web Application** (`/web/`) - Next.js chat interface
3. **Documentation** - Architecture and technology stack documentation

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

### Web Application (`/web/`)
- `npm run dev` - Start Next.js development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Architecture Overview

### MCP Server Architecture

Two distinct architectural patterns are used:

**OpenAPI-based Servers** (Notion):
- Generic framework that auto-generates MCP tools from OpenAPI specifications
- Core components:
  - `MCPProxy` - Converts OpenAPI operations to MCP tools
  - `OpenAPIToMCPConverter` - Transforms schemas
  - `HttpClient` - Handles API requests with authentication
- Configuration via environment variables and headers

**Direct Implementation Servers** (Slack, Google Drive):
- Hand-coded MCP tool implementations
- Single-file architecture with custom tool definitions
- Direct MCP protocol handling
- Google Drive: OAuth2 authentication with Google APIs

### Web Application Architecture

**Next.js 15 with App Router**:
- React 19 with TypeScript
- Tailwind CSS 4 for styling
- AI SDK for multi-provider AI integration (Anthropic, OpenAI)
- OpenTelemetry for observability
- API routes for chat functionality (`/api/chat/`)

**Key Components**:
- `chat-interface.tsx` - Main chat UI component
- `chat-input.tsx` - User input handling
- `message-area.tsx` - Message display
- Custom UI components using Radix UI and Tailwind

### MCP Server Development Patterns

When working with MCP servers:

1. **For APIs with OpenAPI specs**: Use the openapi-mcp-server framework pattern (like Notion)
2. **For custom implementations**: Use direct MCP tool definition pattern (like Slack, Google Drive)
3. **Authentication**: Configure via environment variables and headers, or OAuth2 flow for Google Drive
4. **Transport**: All servers use stdio transport for communication
5. **Google Drive specific**: Requires initial OAuth2 authentication flow before server usage

### Web Development Patterns

- Use existing UI components in `/src/components/ui/`
- Follow Next.js App Router conventions
- AI integration through AI SDK with React hooks
- Styling with Tailwind CSS and class-variance-authority for variants
- Type safety with Zod for schema validation

## Environment Configuration

### MCP Servers
- **Notion**: `OPENAPI_MCP_HEADERS` for API authentication (JSON format)
- **Slack**: `SLACK_BOT_TOKEN`, `SLACK_TEAM_ID`, `SLACK_CHANNEL_IDS`
- **Google Drive**: OAuth2 credentials stored in `.gdrive-server-credentials.json` (auto-generated after auth)

### Web Application
- Next.js environment variables for API keys and configuration
- OpenTelemetry configuration for observability

## MCP Server Capabilities

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
- Integrated into web chat interface via `/api/chat/route.ts`
- Available alongside Notion, Slack, and web search tools
- Enables AI to search and access Google Drive content in responses

## Testing

No specific test commands are configured at the root level. Individual components may have their own test configurations.