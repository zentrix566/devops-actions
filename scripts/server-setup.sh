#!/bin/bash
# 服务器初始化脚本
# 支持: Ubuntu/Debian, CentOS/Alibaba Cloud Linux, RHEL
# 在你的服务器上运行此脚本进行初始化

set -e

echo "======================================"
echo "  DevOps Actions 服务器初始化"
echo "======================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检测系统类型
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        VER=$VERSION_ID
    elif [ -f /etc/redhat-release ]; then
        OS="rhel"
    elif [ -f /etc/debian_version ]; then
        OS="debian"
    else
        OS="unknown"
    fi

    echo -e "${YELLOW}检测到系统: $PRETTY_NAME${NC}"
}

# 检查是否为 root
if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}建议使用 root 或 sudo 运行此脚本${NC}"
fi

detect_os

# 根据系统类型选择包管理器
case "$OS" in
    ubuntu|debian)
        PKG_MANAGER="apt-get"
        PKG_INSTALL="$PKG_MANAGER install -y"
        PKG_UPDATE="$PKG_MANAGER update -y"
        ;;
    centos|rhel|alinux|anolis|fedora)
        PKG_MANAGER="yum"
        if command -v dnf &> /dev/null; then
            PKG_MANAGER="dnf"
        fi
        PKG_INSTALL="$PKG_MANAGER install -y"
        PKG_UPDATE="$PKG_MANAGER makecache -y"
        ;;
    *)
        echo -e "${RED}不支持的系统类型: $OS${NC}"
        exit 1
        ;;
esac

echo ""
echo "📦 步骤 1: 更新系统..."
$PKG_UPDATE || true

echo ""
echo "🐳 步骤 2: 安装 Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh

    if [ -n "$SUDO_USER" ]; then
        usermod -aG docker $SUDO_USER || true
    fi

    # 启动 Docker 服务
    systemctl enable docker
    systemctl start docker

    echo -e "${GREEN}Docker 安装完成${NC}"
else
    echo -e "${GREEN}Docker 已安装${NC}"
    docker --version

    # 确保 Docker 正在运行
    if ! systemctl is-active --quiet docker; then
        echo "启动 Docker..."
        systemctl enable docker
        systemctl start docker
    fi
fi

echo ""
echo "🌐 步骤 3: 安装 Nginx (可选)..."
read -p "是否安装 Nginx? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    $PKG_INSTALL nginx
    systemctl enable nginx
    systemctl start nginx
    echo -e "${GREEN}Nginx 安装完成${NC}"
fi

echo ""
echo "📂 步骤 4: 创建部署目录..."
DEPLOY_PATH="/var/www/devops-actions"
mkdir -p $DEPLOY_PATH
if [ -n "$SUDO_USER" ]; then
    chown -R $SUDO_USER:$SUDO_USER $DEPLOY_PATH 2>/dev/null || true
fi
echo -e "${GREEN}部署目录创建完成: $DEPLOY_PATH${NC}"

echo ""
echo "🔑 步骤 5: 配置防火墙..."
if command -v firewall-cmd &> /dev/null; then
    # CentOS/Alibaba Cloud Linux 使用 firewalld
    firewall-cmd --permanent --add-service=http
    firewall-cmd --permanent --add-service=https
    firewall-cmd --permanent --add-service=ssh
    firewall-cmd --reload
    echo -e "${GREEN}firewalld 规则已更新${NC}"
elif command -v ufw &> /dev/null; then
    # Ubuntu/Debian 使用 ufw
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 22/tcp
    echo -e "${GREEN}ufw 规则已更新${NC}"
else
    echo -e "${YELLOW}未检测到防火墙，跳过防火墙配置${NC}"
fi

echo ""
echo "======================================"
echo -e "${GREEN}✅ 服务器初始化完成！${NC}"
echo "======================================"
echo ""
echo "接下来配置 GitHub Secrets:"
echo ""
echo "需要配置的 Secrets:"
echo "  SSH_HOST      = 你的服务器IP"
echo "  SSH_USER      = 服务器用户名 (如: root)"
echo "  SSH_PASS      = 服务器密码"
echo "  SSH_PORT      = 22 (默认)"
echo "  DEPLOY_PATH   = /var/www/devops-actions"
echo "  GHCR_PAT      = GitHub Personal Access Token (用于拉取镜像)"
echo ""
echo "然后在 GitHub Actions 中手动触发部署，选择 'ssh' 类型"
echo ""
