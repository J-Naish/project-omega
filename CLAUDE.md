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

**Direct Implementation Servers** (Slack):
- Hand-coded MCP tool implementations
- Single-file architecture with custom tool definitions
- Direct MCP protocol handling

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
2. **For custom implementations**: Use direct MCP tool definition pattern (like Slack)
3. **Authentication**: Configure via environment variables and headers
4. **Transport**: All servers use stdio transport for communication

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

### Web Application
- Next.js environment variables for API keys and configuration
- OpenTelemetry configuration for observability

## Testing

No specific test commands are configured at the root level. Individual components may have their own test configurations.