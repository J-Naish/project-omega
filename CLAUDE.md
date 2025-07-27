# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a monorepo with three main components:

1. **Client Application** (`/client/`) - Next.js chat interface
2. **Express Server** (`/server/`) - TypeScript Express server with integrated AI SDK tools
3. **Documentation** - Architecture and technology stack documentation

## Development Commands

### Client Application (`/client/`)

- `npm run dev` - Start Next.js development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Express Server (`/server/`)

- `npm run dev` - Start development server with nodemon and ts-node
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server from built files
- `npm run lint` - Run ESLint for code quality
- Hosts the chat API at `/api/chat` endpoint with integrated AI SDK tools

## Architecture Overview

### AI SDK Tool Integration

**Integrated Tools** (Slack, Notion, Google Drive, Google Sheets):

- Direct integration into Express server as AI SDK tools
- No separate server processes required
- Better performance and simpler deployment than traditional MCP servers
- Type-safe implementation with comprehensive TypeScript interfaces
- Unified tool interface with action-based parameters
- Automatic Google OAuth2 authentication flow for Google tools

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
- Chat API endpoint at `/api/chat` with integrated AI SDK tools (Slack, Notion, Google Drive, Google Sheets)
- Basic REST API endpoints (`/` and `/health`)
- CORS enabled for client communication
- JSON and URL-encoded request parsing middleware
- Runs on port 8080 (configurable via PORT environment variable)

### AI SDK Tool Development Patterns

When working with service integrations:

1. **Tool Integration**: Use AI SDK tool integration for optimal performance
2. **Authentication**: Configure via environment variables, or automatic OAuth2 flow for Google services
3. **Architecture**: All tools run directly in Express process
4. **Google services**: Automatic OAuth2 authentication flow triggers when users first access Google tools
5. **Type safety**: Use comprehensive TypeScript interfaces
6. **Unified interface**: Implement action-based parameter system for multiple operations per tool

### Tool Implementation Guidelines

When implementing new AI SDK tools:

1. **Create unified tool using `tool()` function** from the `ai` package
2. **Define comprehensive TypeScript interfaces** for type safety
3. **Implement action-based parameter system** for multiple operations
4. **Add tool to Express server** tools object in `/src/routes/chat.ts`
5. **Configure environment variables** for authentication
6. **Add tool descriptions and usage** to system prompt

### Client Development Patterns

- Use existing UI components in `/src/components/ui/`
- Follow Next.js App Router conventions
- AI integration through AI SDK with React hooks
- Styling with Tailwind CSS and class-variance-authority for variants
- Type safety with Zod for schema validation

## Environment Configuration

### Express Server AI SDK Tools

- **Notion**: `NOTION_TOKEN` for Notion API authentication
- **Slack**: `SLACK_BOT_TOKEN`, `SLACK_TEAM_ID`, `SLACK_CHANNEL_IDS`
- **Google Drive/Sheets**:
  - `GDRIVE_CREDENTIALS_PATH` - Path to saved OAuth2 credentials (default: `/server/credentials/.gdrive-server-credentials.json`)
  - `GDRIVE_OAUTH_PATH` - Path to OAuth2 configuration file (default: `/server/credentials/gcp-oauth.keys.json`)
  - OAuth2 credentials auto-generated after initial authentication flow

### Client Application

- Next.js environment variables for API keys and configuration
- OpenTelemetry configuration for observability

## AI SDK Tool Capabilities

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

### Google Drive Integration (AI SDK Tool)

**Available Actions**:

- `search` - Search for files in Google Drive by content or metadata
- `get_file` - Retrieve file metadata and optionally include content
- `get_file_content` - Get file content with automatic format conversion
- `list_files` - Browse folder contents or recent files
- `create_folder` - Create new folders for organization

**Automatic Format Conversion**:

- Google Docs → Markdown format
- Google Sheets → CSV format
- Google Slides → Plain text format
- Other files → Native format or base64 encoding

**Implementation**:

- Direct integration into Express server as unified AI SDK tool
- Type-safe implementation with comprehensive TypeScript interfaces
- Action-based parameter system for 5 different operations
- Automatic OAuth2 authentication flow when users first access Google tools
- Environment variables: `GDRIVE_CREDENTIALS_PATH`, `GDRIVE_OAUTH_PATH`

### Google Sheets Integration (AI SDK Tool)

**Available Actions**:

- `get_spreadsheet` - Retrieve spreadsheet metadata and structure
- `read_range` - Read data from specific cells or ranges
- `read_multiple_ranges` - Batch read from multiple ranges
- `write_range` - Update existing cells with new data
- `append_to_range` - Add new rows of data
- `clear_range` - Clear data from specified ranges
- `create_spreadsheet` - Create new spreadsheets
- `add_sheet` - Add new worksheets to existing spreadsheets
- `format_as_table` - Read data in structured table format

**Implementation**:

- Direct integration into Express server as unified AI SDK tool
- Type-safe implementation with comprehensive TypeScript interfaces
- Action-based parameter system for 9 different operations
- Shares Google OAuth2 authentication with Google Drive tool
- Environment variables: `GDRIVE_CREDENTIALS_PATH`, `GDRIVE_OAUTH_PATH`

### Google Authentication Flow

**Automatic Authentication**:

1. User attempts to use Google Drive or Sheets tool
2. If credentials don't exist, OAuth2 flow automatically triggers
3. Browser opens for Google authentication
4. Credentials saved to configured path
5. Tool execution continues seamlessly

**Configuration Files**:

- `gcp-oauth.keys.json` - OAuth2 client configuration from Google Cloud Console
- `.gdrive-server-credentials.json` - Auto-generated OAuth2 tokens (refresh/access tokens)

## Testing

No specific test commands are configured at the root level. Individual components may have their own test configurations.
