# devops-actions

DevOps GitHub Actions 示例项目 - 包含自动化测试、发布风控等功能。

## 📋 项目结构

```
devops-actions/
├── app/                           # 前端示例应用
│   ├── index.html
│   ├── style.css
│   └── app.js
├── scripts/                       # 服务器脚本
│   └── server-setup.sh           # 服务器初始化脚本
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                # CI 流水线
│   │   └── cd.yml                # CD 流水线 (支持 SSH 部署)
│   └── actions/
│       ├── gray-release/         # 自定义灰度发布 Action
│       │   ├── action.yml
│       │   ├── src/index.js
│       │   └── package.json
│       └── ssh-deploy/           # SSH 部署 Action
│           ├── action.yml
│           └── src/index.js
├── Dockerfile                     # 容器镜像
├── nginx.conf                     # Nginx 配置
├── 服务器部署指南.md              # 服务器部署详细指南
├── 本地运行指南.md                # 本地运行指南
└── README.md
```

## 🚀 功能特性

### 1. CI/CD 流水线
- **CI**: 代码检查、Docker 镜像构建
- **CD**: 自动构建、灰度发布、全量发布

### 2. 灰度发布 Action
自定义 GitHub Action，支持：
- 可配置灰度流量比例 (0-100%)
- 发布状态跟踪
- 与 GitHub Deployments 集成
- 发布前验证

### 3. SSH 服务器部署
- 通过 SSH 直接部署到你的服务器
- 支持密码或密钥认证
- Docker 容器化部署
- 部署前/后自定义脚本

### 4. 发布风控
- 灰度阶段人工确认
- 发布进度可视化
- 失败自动回滚（示例）

## 📦 使用方法

### 1. 本地运行前端应用

```bash
cd app
# 直接用浏览器打开 index.html
# 或使用本地服务器
python -m http.server 8080
```

### 2. 本地构建 Docker 镜像

```bash
docker build -t devops-actions .
docker run -p 8080:80 devops-actions
```

### 3. 使用 GitHub Actions

#### CI 流水线
- 推送到 `main` 或 `develop` 分支自动触发
- PR 自动检查

#### CD 流水线
- 打 tag `v*` 自动触发发布流程
- 先灰度 10%，确认后全量发布

### 4. 自定义灰度发布 Action

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Gray Release
        uses: ./.github/actions/gray-release
        with:
          percentage: 20
          image-tag: my-image:v1.0.0
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## 🔧 配置

### 需要的 Secrets

| Secret | 说明 |
|--------|------|
| `GITHUB_TOKEN` | 自动提供，无需手动配置 |

### 环境

- `gray`: 灰度环境
- `production`: 生产环境

## 📚 技术栈

- **前端**: HTML5, CSS3, JavaScript
- **Web Server**: Nginx
- **容器化**: Docker
- **CI/CD**: GitHub Actions
- **Node.js**: 用于自定义 Action

## 🎯 针对岗位要求

这个项目演示了以下技能：

| 岗位要求 | 实现 |
|----------|------|
| GitHub Action 二次开发 | ✅ 自定义 `gray-release` + `ssh-deploy` Action |
| 自动化测试 | ✅ CI 流水线包含检查 |
| 发布风控 | ✅ 灰度发布、人工确认 |
| 多环境部署 | ✅ SSH 直接部署到服务器 |
| Docker/K8s | ✅ Docker 支持，可扩展 K8s 部署 |
| CI/CD 全流程 | ✅ 完整的 CI + CD + 服务器部署 |

## 📄 License

MIT
