# Figma MCP Server Docker

このディレクトリには、Figma MCPサーバーの本番環境用Dockerイメージの定義が含まれています。

## ビルド方法

```bash
# プロジェクトルートから実行

# 1. ベースイメージをビルド（初回のみ）
docker build -f docker/Dockerfile.base -t figma-mcp-base:latest .

# 2. MCPサーバーイメージをビルド
docker build -f mcp-server/Dockerfile -t figma-mcp-server:latest .
```

## 実行方法

```bash
# 環境変数を設定
export FIGMA_PERSONAL_ACCESS_TOKEN="your-figma-token"

# コンテナを起動
docker run -d \
  --name figma-mcp-server \
  -p 8765:8765 \
  -e FIGMA_PERSONAL_ACCESS_TOKEN=$FIGMA_PERSONAL_ACCESS_TOKEN \
  -e NODE_ENV=production \
  figma-mcp-server:latest
```

## 環境変数

- `FIGMA_PERSONAL_ACCESS_TOKEN`: Figma APIアクセストークン（必須）
- `NODE_ENV`: 実行環境（production推奨）

## ポート

- `8765`: MCPサーバーのデフォルトポート