#!/bin/bash

# Project Omega 起動スクリプト
# このスクリプトはクライアントとサーバーの開発環境を起動します

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
kill_port 8080  # Express API サーバー

# Google認証ファイルの確認
print_status "Google認証設定を確認しています..."
if [ ! -f "server/credentials/.gdrive-server-credentials.json" ]; then
    print_warning "Google Drive認証が未完了です"
    print_status "Google Drive/Sheetsツールを使用する際に自動で認証フローが開始されます"
    print_status "事前認証したい場合は、server/credentials/gcp-oauth.keys.json ファイルを配置してください"
else
    print_success "Google Drive認証ファイルが見つかりました"
fi

# Express サーバーをセットアップ
print_status "Express サーバーをセットアップしています..."
cd server

print_status "Express サーバーの依存関係をインストール/更新しています..."
npm install

# リントを実行
print_status "Express サーバーのコード品質チェックを実行しています..."
npm run lint

cd "$SCRIPT_DIR"

# クライアントアプリケーションをセットアップ
print_status "クライアントアプリケーションをセットアップしています..."
cd client

print_status "クライアントアプリケーションの依存関係をインストール/更新しています..."
npm install

cd "$SCRIPT_DIR"

print_success "すべてのコンポーネントのセットアップが完了しました"
print_status ""
print_success "🚀 Project Omega を起動しています！"
print_status "クライアント: ${BLUE}http://localhost:3000${NC}"
print_status "Express API: ${BLUE}http://localhost:8080${NC}"
print_status ""
print_status "サーバーを停止するには各ターミナルで Ctrl+C を押してください"
print_status ""

# 並行してサーバーを起動
print_status "Express サーバーを http://localhost:8080 で起動しています..."
cd server
npm run dev &
SERVER_PID=$!

cd "$SCRIPT_DIR"

print_status "クライアントを http://localhost:3000 で起動しています..."
cd client

# クライアントをフォアグラウンドで実行（メインプロセス）
npm run dev