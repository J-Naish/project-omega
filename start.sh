#!/bin/bash

# Project Omega Startup Script
# This script starts all components of the project

git pull

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i ":$1" >/dev/null 2>&1
}

# Function to kill processes on a port
kill_port() {
    if port_in_use $1; then
        print_warning "Port $1 is in use. Killing existing processes..."
        lsof -ti ":$1" | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

print_status "Starting Project Omega..."

# Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"
if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION'))" 2>/dev/null; then
    print_warning "Node.js version $NODE_VERSION detected. Recommended: $REQUIRED_VERSION or higher"
fi

print_success "Prerequisites check completed"

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check environment variables
print_status "Checking environment variables..."

ENV_FILE="web/.env.local"
if [ ! -f "$ENV_FILE" ]; then
    print_error "Environment file $ENV_FILE not found!"
    print_status "Please create $ENV_FILE with the following variables:"
    echo "ANTHROPIC_API_KEY=your_anthropic_key"
    echo "OPENAI_API_KEY=your_openai_key"
    echo "NOTION_TOKEN=your_notion_token"
    echo "SLACK_TEAM_ID=your_slack_team_id"
    echo "SLACK_BOT_TOKEN=your_slack_bot_token"
    echo "EXA_API_KEY=your_exa_api_key"
    exit 1
fi

# Source environment variables to check them
set -a
source "$ENV_FILE"
set +a

missing_vars=()
[ -z "$ANTHROPIC_API_KEY" ] && missing_vars+=("ANTHROPIC_API_KEY")
[ -z "$NOTION_TOKEN" ] && missing_vars+=("NOTION_TOKEN")
[ -z "$SLACK_TEAM_ID" ] && missing_vars+=("SLACK_TEAM_ID")
[ -z "$SLACK_BOT_TOKEN" ] && missing_vars+=("SLACK_BOT_TOKEN")
[ -z "$EXA_API_KEY" ] && missing_vars+=("EXA_API_KEY")

if [ ${#missing_vars[@]} -ne 0 ]; then
    print_error "Missing required environment variables: ${missing_vars[*]}"
    exit 1
fi

print_success "Environment variables check completed"

# Clean up any existing processes
print_status "Cleaning up existing processes..."
kill_port 3000  # Next.js dev server

# Build MCP servers if needed
print_status "Building MCP servers..."

# Build Notion MCP server
if [ -d "mcp-servers/notion" ]; then
    print_status "Building Notion MCP server..."
    cd mcp-servers/notion
    print_status "Installing/updating Notion MCP server dependencies..."
    npm install
    npm run build
    cd "$SCRIPT_DIR"
    print_success "Notion MCP server built"
else
    print_warning "Notion MCP server directory not found"
fi

# Build Slack MCP server
if [ -d "mcp-servers/slack" ]; then
    print_status "Building Slack MCP server..."
    cd mcp-servers/slack
    print_status "Installing/updating Slack MCP server dependencies..."
    npm install
    npm run build
    cd "$SCRIPT_DIR"
    print_success "Slack MCP server built"
else
    print_warning "Slack MCP server directory not found"
fi

# Install and start web application
print_status "Setting up web application..."
cd web

print_status "Installing/updating web application dependencies..."
npm install

# Run linting
print_status "Running code quality checks..."
npm run lint

print_success "All components built and validated"

# Start the development server
print_status "Starting development server on http://localhost:3000..."
print_status "Press Ctrl+C to stop the server"
print_status ""
print_success "🚀 Project Omega is starting up!"
print_status "Dashboard will be available at: ${BLUE}http://localhost:3000${NC}"
print_status ""

# Start Next.js development server
exec npm run dev