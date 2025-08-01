# Docker構成

このディレクトリには、Figma MCPサーバーとdevcontainer環境で共有される基本Dockerイメージの定義が含まれています。

## プロジェクト全体のDocker構成

```
/workspace/
├── docker/
│   ├── Dockerfile.base      # 共通ベースイメージ
│   └── README.md
├── mcp-server/
│   └── Dockerfile          # MCPサーバー用Dockerfile
└── .devcontainer/
    └── Dockerfile          # 開発環境用Dockerfile
```

## Dockerイメージ

### docker/Dockerfile.base
Node.js 20.xと日本語環境を含む共通ベースイメージです。以下が含まれます：
- Ubuntu 24.04ベース
- Node.js 20.x
- pnpm
- 日本語ロケールとフォント
- 基本的な開発ツール（git、curl、wget等）

### mcp-server/Dockerfile
本番環境用のMCPサーバーイメージです：
- 共通ベースイメージ（figma-mcp-base）を使用
- 本番用依存関係のみインストール
- 非特権ユーザー（mcpserver）で実行

## ビルド方法

### ベースイメージのビルド
```bash
docker build -f docker/Dockerfile.base -t figma-mcp-base:latest .
```

### MCPサーバーイメージのビルド
```bash
# ベースイメージを先にビルド
docker build -f docker/Dockerfile.base -t figma-mcp-base:latest .

# MCPサーバーイメージをビルド
docker build -f mcp-server/Dockerfile -t figma-mcp-server:latest .
```

### MCPサーバーの起動
```bash
# 環境変数を設定
export FIGMA_PERSONAL_ACCESS_TOKEN="your-token-here"

# コンテナを起動
docker run -d \
  --name figma-mcp-server \
  -p 8765:8765 \
  -e FIGMA_PERSONAL_ACCESS_TOKEN=$FIGMA_PERSONAL_ACCESS_TOKEN \
  -e NODE_ENV=production \
  figma-mcp-server:latest
```

## 開発環境

開発環境では、`.devcontainer/`ディレクトリの設定を使用してください。
VSCodeのDev Containers拡張機能を使用すると、自動的に開発環境が構築されます。