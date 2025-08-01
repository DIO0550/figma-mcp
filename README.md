# Figma MCP Server

Figma REST APIを使用してFigmaデザインファイルの情報を取得・操作できるModel Context Protocol (MCP)サーバーです。

## 概要

このMCPサーバーを使用することで、AIアシスタント（Claude等）がFigmaのデザイン情報にアクセスし、デザインに関する質問への回答や分析を行えるようになります。

## 機能

- **ファイル操作**: Figmaファイルの基本情報、構造、ノード詳細の取得
- **コンポーネント管理**: コンポーネント一覧、使用状況、バリアント情報の取得
- **スタイル管理**: カラー、テキスト、エフェクトスタイルの取得
- **画像エクスポート**: PNG、JPG、SVG、PDF形式での画像エクスポート
- **コメント機能**: コメントと返信情報の取得
- **バージョン管理**: バージョン履歴の取得

## インストール

### 前提条件

- Docker および Docker Compose
- Figma Personal Access Token（[取得方法](https://www.figma.com/developers/api#access-tokens)）

### Dockerを使用したセットアップ

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/figma-mcp.git
cd figma-mcp

# Dockerイメージのビルド
docker build -t figma-mcp .

# または docker-compose を使用
docker-compose build
```

## 設定

### 1. Figma Personal Access Tokenの取得

1. [Figma](https://www.figma.com)にログイン
2. Settings → Account → Personal access tokensに移動
3. 「Create new token」をクリック
4. トークンに名前を付けて生成
5. 生成されたトークンをコピー（再表示できないので注意）

### 2. Claude Desktop アプリケーションでの設定

Claude Desktopの設定ファイル（`claude_desktop_config.json`）に以下を追加：

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

#### Dockerコンテナとして実行する場合

```json
{
  "mcpServers": {
    "figma-mcp": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "--env", "FIGMA_ACCESS_TOKEN", "figma-mcp:latest"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "your_figma_personal_access_token_here"
      }
    }
  }
}
```

#### docker-composeを使用する場合

```json
{
  "mcpServers": {
    "figma-mcp": {
      "command": "docker-compose",
      "args": ["-f", "/path/to/figma-mcp/docker-compose.yml", "run", "--rm", "figma-mcp"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "your_figma_personal_access_token_here"
      }
    }
  }
}
```

### 3. 環境変数の設定方法

環境変数は以下の3つの方法で設定できます（優先順位順）：

1. **MCP設定ファイルで指定**（推奨）

   ```json
   "env": {
     "FIGMA_ACCESS_TOKEN": "your_token_here",
     "LOG_LEVEL": "INFO"
   }
   ```

2. **システム環境変数**

   ```bash
   export FIGMA_ACCESS_TOKEN="your_token_here"
   ```

3. **.envファイル**（開発時）
   ```bash
   cp .env.example .env
   # .envファイルを編集してトークンを設定
   ```

### 利用可能な環境変数

| 環境変数             | 説明                                   | デフォルト値             |
| -------------------- | -------------------------------------- | ------------------------ |
| `FIGMA_ACCESS_TOKEN` | Figma Personal Access Token（必須）    | -                        |
| `LOG_LEVEL`          | ログレベル（ERROR, WARN, INFO, DEBUG） | INFO                     |
| `FIGMA_API_BASE_URL` | Figma API のベースURL                  | https://api.figma.com/v1 |

## 使用方法

### 利用可能なツール

MCPサーバーが提供するツール一覧：

#### `get_file`

Figmaファイルの基本情報を取得します。

```typescript
{
  "fileKey": "your-file-key"
}
```

#### `get_file_nodes`

特定のノードの詳細情報を取得します。

```typescript
{
  "fileKey": "your-file-key",
  "ids": ["node-id-1", "node-id-2"]
}
```

#### `get_components`

ファイル内のコンポーネント一覧を取得します。

```typescript
{
  "fileKey": "your-file-key"
}
```

#### `get_styles`

ファイル内のスタイル一覧を取得します。

```typescript
{
  "fileKey": "your-file-key"
}
```

#### `export_images`

ノードを画像としてエクスポートします。

```typescript
{
  "fileKey": "your-file-key",
  "ids": ["node-id"],
  "format": "png",  // png, jpg, svg, pdf
  "scale": 2
}
```

#### `get_comments`

ファイルのコメントを取得します。

```typescript
{
  "fileKey": "your-file-key"
}
```

#### `get_versions`

ファイルのバージョン履歴を取得します。

```typescript
{
  "fileKey": "your-file-key"
}
```

#### `set_config`

実行時に設定を変更します。

```typescript
{
  "baseUrl": "https://api.figma.com/v1"
}
```

### 使用例

Claude等のAIアシスタントで使用する場合の例：

1. **ファイル情報の取得**

   ```
   「FigmaファイルID abc123 の情報を取得してください」
   ```

2. **コンポーネントの分析**

   ```
   「このFigmaファイルのコンポーネント一覧を表示して、使用頻度を分析してください」
   ```

3. **画像のエクスポート**

   ```
   「ノードID xyz789 をPNG形式で2倍の解像度でエクスポートしてください」
   ```

4. **デザインシステムの確認**
   ```
   「このファイルで使用されているカラースタイルを一覧表示してください」
   ```

## 開発

### 開発環境のセットアップ

#### ローカル開発

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動（ホットリロード対応）
npm run dev

# TypeScriptのコンパイル
npm run build

# リント
npm run lint

# テストの実行
npm test
```

#### Docker開発環境

```bash
# 開発用コンテナの起動
docker-compose up -d

# コンテナ内でコマンド実行
docker-compose exec figma-mcp npm run dev

# ログの確認
docker-compose logs -f
```

### プロジェクト構造

```
src/
├── index.ts              # MCPサーバーのエントリーポイント
├── api/                  # Figma API関連
│   ├── client.ts         # HTTPクライアント
│   ├── figma-api-client.ts # APIクライアント
│   └── endpoints/        # 各APIエンドポイント
├── tools/                # MCPツールの実装
│   ├── file/            # ファイル関連ツール
│   ├── component/       # コンポーネント関連ツール
│   └── ...
├── types/               # 型定義
└── utils/              # ユーティリティ関数
```

## トラブルシューティング

### よくある問題

1. **「FIGMA_ACCESS_TOKEN environment variable is required」エラー**

   - 環境変数が正しく設定されているか確認してください
   - MCP設定ファイルの`env`フィールドを確認してください

2. **「401 Unauthorized」エラー**

   - Figma Personal Access Tokenが有効か確認してください
   - トークンに必要な権限があるか確認してください

3. **「429 Too Many Requests」エラー**
   - APIレート制限に達しています。しばらく待ってから再試行してください
   - サーバーは自動的にリトライしますが、大量のリクエストは避けてください

### ログの確認

環境変数 `LOG_LEVEL` を設定することで、詳細なログを確認できます：

```json
"env": {
  "FIGMA_ACCESS_TOKEN": "your_token",
  "LOG_LEVEL": "DEBUG"
}
```

## ライセンス

[MIT License](./LICENSE)

## 関連リンク

- [Figma API Documentation](https://www.figma.com/developers/api)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [MCP Servers](https://github.com/modelcontextprotocol/servers)
