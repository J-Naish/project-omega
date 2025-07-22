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

# スクリプトディレクトリを取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

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

# Google Drive MCPサーバーをビルド
if [ -d "mcp-servers/gdrive" ]; then
    print_status "Google Drive MCPサーバーをビルドしています..."
    cd mcp-servers/gdrive
    print_status "Google Drive MCPサーバーの依存関係をインストール/更新しています..."
    npm install
    npm run build
    
    # 認証ファイルの存在確認
    if [ ! -f ".gdrive-server-credentials.json" ]; then
        print_warning "Google Drive認証が未完了です"
        print_status "認証を実行するには以下のコマンドを実行してください:"
        print_status "cd mcp-servers/gdrive && node dist/index.js auth"
    else
        print_success "Google Drive認証ファイルが見つかりました"
    fi
    
    cd "$SCRIPT_DIR"
    print_success "Google Drive MCPサーバーのビルドが完了しました"
else
    print_warning "Google Drive MCPサーバーディレクトリが見つかりません"
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