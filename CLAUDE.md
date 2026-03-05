# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a DevOps Actions demo project featuring a simple frontend application with GitHub Actions CI/CD pipelines and a custom gray release action.

## Project Structure

- **app/** - Frontend application (HTML, CSS, JavaScript)
- **.github/actions/gray-release/** - Custom GitHub Action for gray releases
- **.github/workflows/** - CI and CD pipeline definitions
- **Dockerfile** - Container configuration using nginx:alpine
- **nginx.conf** - Nginx web server configuration

## Key Components

### Custom GitHub Action: gray-release

Located in `.github/actions/gray-release/`, this is a Node.js-based action that:
- Accepts inputs: `percentage` (0-100), `image-tag`, `github-token`, `environment`
- Outputs: `release-id`, `status`
- Main source: [src/index.js](.github/actions/gray-release/src/index.js)

**Development commands for the action:**
```bash
cd .github/actions/gray-release
npm run build   # Build with ncc
npm run lint    # Lint source files
```

### CI/CD Pipelines

- **[ci.yml](.github/workflows/ci.yml)** - Runs on push to main/develop and PRs:
  - Checks for required files (index.html, Dockerfile)
  - Builds Docker image

- **[cd.yml](.github/workflows/cd.yml)** - Runs on tag push (v*) or manual dispatch:
  - Builds and pushes image to GHCR
  - Supports three deploy types: `gray` (default), `full`, `ssh`

### Frontend Application

- Simple static HTML/CSS/JS app served via Nginx
- Version: v1.0.0
- Health check endpoint: `/health` returns 200 OK

## Common Commands

**Build Docker image:**
```bash
docker build -t devops-actions .
```

**Run container locally:**
```bash
docker run -d --name devops-actions -p 80:80 devops-actions
```
