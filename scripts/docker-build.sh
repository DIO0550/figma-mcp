#!/bin/bash
# Figma MCP Server Docker Build Script

set -euo pipefail

# 色付きの出力用の定数
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m' # No Color

# プロジェクトのルートディレクトリを設定
readonly PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly BASE_IMAGE_NAME="figma-mcp-base"
readonly MCP_SERVER_IMAGE_NAME="figma-mcp-server"
readonly BASE_IMAGE_TAG="${BASE_IMAGE_TAG:-latest}"
readonly MCP_SERVER_TAG="${MCP_SERVER_TAG:-latest}"

# ログ関数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Dockerがインストールされているかチェック
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    log_info "Docker is installed: $(docker --version)"
}

# ベースイメージをビルド
build_base_image() {
    log_info "Building base image: ${BASE_IMAGE_NAME}:${BASE_IMAGE_TAG}"
    
    if ! docker build \
        ${docker_args} \
        -f "${PROJECT_ROOT}/docker/Dockerfile.base" \
        -t "${BASE_IMAGE_NAME}:${BASE_IMAGE_TAG}" \
        "${PROJECT_ROOT}"; then
        log_error "Failed to build base image"
        exit 1
    fi
    
    log_info "Base image built successfully"
}

# MCP Serverイメージをビルド
build_mcp_server_image() {
    log_info "Building MCP Server image: ${MCP_SERVER_IMAGE_NAME}:${MCP_SERVER_TAG}"
    
    # package.jsonが存在するか確認
    if [[ ! -f "${PROJECT_ROOT}/package.json" ]]; then
        log_error "package.json not found in project root"
        exit 1
    fi
    
    # package-lock.jsonが存在するか確認
    if [[ ! -f "${PROJECT_ROOT}/package-lock.json" ]]; then
        log_error "package-lock.json not found. Please run 'npm install' first."
        exit 1
    fi
    
    if ! docker build \
        ${docker_args} \
        -f "${PROJECT_ROOT}/mcp-server/Dockerfile" \
        -t "${MCP_SERVER_IMAGE_NAME}:${MCP_SERVER_TAG}" \
        "${PROJECT_ROOT}"; then
        log_error "Failed to build MCP Server image"
        exit 1
    fi
    
    log_info "MCP Server image built successfully"
}

# イメージサイズを表示
show_image_sizes() {
    log_info "Docker images:"
    echo -e "REPOSITORY\tTAG\tIMAGE ID\tSIZE"
    docker images --filter "reference=${BASE_IMAGE_NAME}:*" --format "{{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.Size}}"
    docker images --filter "reference=${MCP_SERVER_IMAGE_NAME}:*" --format "{{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.Size}}"
}

# クリーンアップオプション
cleanup_images() {
    log_warning "Cleaning up Docker images..."
    
    # 古いイメージを削除（より安全なフィルタリング）
    docker image ls --filter "reference=${BASE_IMAGE_NAME}:*" --format "{{.Repository}}:{{.Tag}} {{.ID}}" | \
        grep -vx "${BASE_IMAGE_NAME}:${BASE_IMAGE_TAG} .*" | awk '{print $2}' | xargs -r docker rmi -f 2>/dev/null || true
    docker image ls --filter "reference=${MCP_SERVER_IMAGE_NAME}:*" --format "{{.Repository}}:{{.Tag}} {{.ID}}" | \
        grep -vx "${MCP_SERVER_IMAGE_NAME}:${MCP_SERVER_TAG} .*" | awk '{print $2}' | xargs -r docker rmi -f 2>/dev/null || true
    
    # ダングリングイメージを削除
    docker image prune -f
    
    log_info "Cleanup completed"
}

# ヘルプメッセージ
show_help() {
    cat << EOF
Usage: $0 [OPTIONS]

Build Docker images for Figma MCP Server

OPTIONS:
    -h, --help          Show this help message
    -b, --base-only     Build only the base image
    -s, --server-only   Build only the server image (requires base image)
    -c, --clean         Clean up old images after build
    --no-cache          Build without using cache
    
ENVIRONMENT VARIABLES:
    BASE_IMAGE_TAG      Tag for base image (default: latest)
    MCP_SERVER_TAG      Tag for MCP server image (default: latest)

EXAMPLES:
    # Build both images
    $0
    
    # Build with cleanup
    $0 --clean
    
    # Build without cache
    $0 --no-cache
    
    # Build with custom tags
    BASE_IMAGE_TAG=v1.0 MCP_SERVER_TAG=v1.0 $0
EOF
}

# メイン処理
main() {
    local build_base=true
    local build_server=true
    local clean_after=false
    local docker_args=""
    
    # コマンドライン引数の処理
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -b|--base-only)
                build_server=false
                shift
                ;;
            -s|--server-only)
                build_base=false
                shift
                ;;
            -c|--clean)
                clean_after=true
                shift
                ;;
            --no-cache)
                docker_args="--no-cache"
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Dockerのチェック
    check_docker
    
    # プロジェクトルートに移動
    cd "${PROJECT_ROOT}"
    
    # ビルド実行
    if [[ "${build_base}" == "true" ]]; then
        build_base_image
    fi
    
    if [[ "${build_server}" == "true" ]]; then
        # ベースイメージが存在するかチェック
        if ! docker images | grep -E -q "^${BASE_IMAGE_NAME}[[:space:]]+${BASE_IMAGE_TAG}"; then
            log_error "Base image not found. Building base image first..."
            build_base_image
        fi
        build_mcp_server_image
    fi
    
    # イメージサイズを表示
    show_image_sizes
    
    # クリーンアップ
    if [[ "${clean_after}" == "true" ]]; then
        cleanup_images
    fi
    
    log_info "Build completed successfully!"
}

# スクリプト実行
main "$@"