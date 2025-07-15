#!/bin/bash

# Project Omega 起動スクリプト
# このスクリプトはプロジェクトのすべてのコンポーネントを起動します

git pull

set -e  # エラーが発生したら終了

# 出力用の色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # 色なし

# 色付き出力を表示する関数
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

# コマンドが存在するか確認する関数
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# ポートが使用中か確認する関数
port_in_use() {
    lsof -i ":$1" >/dev/null 2>&1
}

# ポート上のプロセスを終了する関数
kill_port() {
    if port_in_use $1; then
        print_warning "ポート $1 が使用中です。既存のプロセスを終了しています..."
        lsof -ti ":$1" | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

print_status "Project Omegaを起動しています..."

# 前提条件を確認
print_status "前提条件を確認しています..."

if ! command_exists node; then
    print_error "Node.jsがインストールされていません。先にNode.jsをインストールしてください。"
    exit 1
fi

if ! command_exists npm; then
    print_error "npmがインストールされていません。先にnpmをインストールしてください。"
    exit 1
fi

# Node.jsバージョンを確認
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"
if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION'))" 2>/dev/null; then
    print_warning "Node.jsバージョン $NODE_VERSION が検出されました。推奨: $REQUIRED_VERSION 以上"
fi

print_success "前提条件の確認が完了しました"

# スクリプトディレクトリを取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 環境変数を確認
print_status "環境変数を確認しています..."

ENV_FILE="web/.env.local"
if [ ! -f "$ENV_FILE" ]; then
    print_error "環境ファイル $ENV_FILE が見つかりません！"
    print_status "以下の変数を含む $ENV_FILE を作成してください:"
    echo "ANTHROPIC_API_KEY=your_anthropic_key"
    echo "OPENAI_API_KEY=your_openai_key"
    echo "NOTION_TOKEN=your_notion_token"
    echo "SLACK_TEAM_ID=your_slack_team_id"
    echo "SLACK_BOT_TOKEN=your_slack_bot_token"
    echo "EXA_API_KEY=your_exa_api_key"
    exit 1
fi

# 環境変数を確認するために読み込み
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
    print_error "必須環境変数が不足しています: ${missing_vars[*]}"
    exit 1
fi

print_success "環境変数の確認が完了しました"

# 既存のプロセスをクリーンアップ
print_status "既存のプロセスをクリーンアップしています..."
kill_port 3000  # Next.js開発サーバー

# 必要に応じてMCPサーバーをビルド
print_status "MCPサーバーをビルドしています..."

# Notion MCPサーバーをビルド
if [ -d "mcp-servers/notion" ]; then
    print_status "Notion MCPサーバーをビルドしています..."
    cd mcp-servers/notion
    print_status "Notion MCPサーバーの依存関係をインストール/更新しています..."
    npm install
    npm run build
    cd "$SCRIPT_DIR"
    print_success "Notion MCPサーバーのビルドが完了しました"
else
    print_warning "Notion MCPサーバーディレクトリが見つかりません"
fi

# Slack MCPサーバーをビルド
if [ -d "mcp-servers/slack" ]; then
    print_status "Slack MCPサーバーをビルドしています..."
    cd mcp-servers/slack
    print_status "Slack MCPサーバーの依存関係をインストール/更新しています..."
    npm install
    npm run build
    cd "$SCRIPT_DIR"
    print_success "Slack MCPサーバーのビルドが完了しました"
else
    print_warning "Slack MCPサーバーディレクトリが見つかりません"
fi

# Webアプリケーションをインストールして起動
print_status "Webアプリケーションをセットアップしています..."
cd web

print_status "Webアプリケーションの依存関係をインストール/更新しています..."
npm install

# リントを実行
print_status "コード品質チェックを実行しています..."
npm run lint

print_success "すべてのコンポーネントのビルドと検証が完了しました"

# 開発サーバーを起動
print_status "開発サーバーを http://localhost:3000 で起動しています..."
print_status "サーバーを停止するには Ctrl+C を押してください"
print_status ""
print_success "🚀 Project Omega が起動しています！"
print_status "ダッシュボードはこちらで利用可能です: ${BLUE}http://localhost:3000${NC}"
print_status ""

# Next.js開発サーバーを起動
exec npm run dev