# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Prompt Optimizer is a powerful AI prompt optimization tool that helps write better AI prompts and improve AI output quality. It's built as a monorepo with multiple packages supporting Web, Desktop, Chrome Extension, and Docker deployment.

## Development Commands

### Essential Commands

你应该使用 pmpm dev:fresh 清理缓存并重启服务以获得服务的访问地址，并确保最新最可靠的界面体验

```bash
# Development
pnpm dev:fresh         # Clean install and restart development 
pnpm dev:desktop       # Build core/ui, run web and desktop
pnpm dev:desktop:fresh # Clean install and restart desktop development

# Building
pnpm build            # Build all packages (core → ui → web/ext/desktop in parallel)
pnpm build:core       # Build core package only
pnpm build:ui         # Build UI components package only
pnpm build:web        # Build web application only
pnpm build:desktop    # Build desktop application with packaging

# Testing
pnpm test            # Run all tests across packages
pnpm -F @prompt-optimizer/core test    # Run core package tests
pnpm -F @prompt-optimizer/ui test      # Run UI package tests

# Maintenance  
pnpm clean           # Clean dist and vite cache
pnpm version:sync    # Sync versions across all packages
```

### Package-Specific Commands

Use `pnpm -F <package-name>` to run commands in specific packages:
- `@prompt-optimizer/core` - Core functionality
- `@prompt-optimizer/ui` - UI components  
- `@prompt-optimizer/web` - Web application
- `@prompt-optimizer/extension` - Chrome extension
- `@prompt-optimizer/desktop` - Desktop application
- `@prompt-optimizer/mcp-server` - MCP server

## Architecture Overview

### Monorepo Structure

The project follows a strict dependency hierarchy:
```
packages/core (foundation)
    ↓
packages/ui (components, depends on core)
    ↓
packages/web|extension|desktop (applications, depend on ui + core)
```

### Build Order

Due to internal dependencies, builds must follow this sequence:
1. `core` - Core services, types, and business logic
2. `ui` - Vue components and composables  
3. `web/extension/desktop` - Final applications (can build in parallel)

### Key Packages

- **`packages/core`**: Contains all business logic, LLM services, model management, template processing, storage services
- **`packages/ui`**: Vue 3 + TypeScript components, composables, internationalization, theme system
- **`packages/web`**: Vite-based web application entry point
- **`packages/desktop`**: Electron desktop application with IPC proxying
- **`packages/extension`**: Chrome extension with popup interface

## Technical Stack

- **Frontend**: Vue 3 + TypeScript + Composition API
- **Build**: Vite + pnpm workspaces
- **Styling**: TailwindCSS + PostCSS
- **Testing**: Vitest + Playwright (for MCP testing)
- **Desktop**: Electron with auto-updater
- **Internationalization**: Vue-i18n
- **State Management**: Reactive composables (no Pinia/Vuex)

## Core Service Architecture

### Services Layer (`packages/core/src/services/`)

All services follow a consistent pattern with types, errors, and proxy layers:

- **`llm/`** - LLM API integration (OpenAI, Gemini, DeepSeek, etc.)
- **`model/`** - Model configuration management with advanced parameters
- **`prompt/`** - Prompt optimization and custom conversation testing
- **`template/`** - Template management with CSP-safe processing
- **`history/`** - Optimization history tracking
- **`storage/`** - Multi-adapter storage (localStorage, IndexedDB, file system)
- **`preference/`** - User preferences with cross-platform sync

### Electron Architecture

Desktop app uses **proxy pattern** for service communication:
- Main process hosts all core services
- Renderer process uses `*-electron-proxy.ts` files
- IPC serialization handles complex object passing
- All business logic remains in shared core services

## Development Guidelines

### Working with Services

1. **Core services** should be platform-agnostic
2. **Electron proxies** handle IPC communication only
3. **UI composables** provide reactive interfaces to services
4. Always update both service and proxy when modifying interfaces

### Component Development

1. Use Vue 3 Composition API exclusively
2. Follow the theme system using `theme-manager-*` CSS classes
3. Implement proper TypeScript types
4. Use composables for business logic, components for presentation only

### Testing Strategy

- **Unit tests**: Individual service methods and utilities
- **Integration tests**: Cross-service workflows and API integrations  
- **Real API tests**: Limited tests against actual LLM providers
- **Component tests**: Vue component behavior and rendering

## Environment Configuration

### Local Development

Create `.env.local` in project root:
```env
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key
# ... other API keys
```

### Multi-Custom Model Support

The system supports unlimited custom model configurations:
```env
VITE_CUSTOM_API_KEY_modelname=api_key
VITE_CUSTOM_API_BASE_URL_modelname=https://api.example.com/v1
VITE_CUSTOM_API_MODEL_modelname=model-name
```

## Advanced Features

### Variable Management System

The project includes an advanced variable management system (`packages/ui/src/components/AdvancedTestPanel.vue`):
- Custom variable CRUD operations
- Multi-turn conversation management  
- Variable replacement with preview
- Missing variable detection and auto-creation
- Import/export functionality

### Template Processing

Uses CSP-safe template processing (`packages/core/src/services/template/csp-safe-processor.ts`):
- Prevents XSS attacks
- Supports variable replacement with `{{variableName}}` syntax
- Handles both predefined and custom variables

### Storage Architecture

Multi-adapter storage system supports:
- **Browser**: localStorage for web/extension
- **Desktop**: File system storage via Electron
- **Fallback**: Memory storage for testing
- **IndexedDB**: For large data in browsers

## Branch and Release Management

### Branch Structure
- `main/master` - Production branch (triggers Vercel deployment)
- `develop` - Development branch (no Vercel deployment)
- `feature/*` - Feature branches from develop

### Version Management
```bash
# Update version (don't create tags yet)
pnpm version:prepare patch|minor|major

# Create and push tags (triggers desktop builds)
pnpm run version:tag
pnpm run version:publish
```

## Important Notes

### Node.js & Package Manager
- **Required**: Node.js >= 18, pnpm >= 8
- **Forbidden**: Do not use npm or yarn (enforced in package.json)
- Use `pnpm install` and pnpm workspace commands only

### Docker Deployment

Docker是推荐的生产环境部署方式,提供完整的Web应用和MCP服务器支持。

#### 架构说明
- **多阶段构建**: 使用Node.js构建,Nginx+Node运行时部署
- **服务管理**: Supervisor管理Nginx和MCP服务器两个进程
- **端口配置**: 
  - Nginx监听 `${NGINX_PORT}` (默认80)
  - MCP服务器监听内部3000端口
  - MCP通过 `/mcp` 路径对外提供服务
- **访问控制**: 支持Basic Auth密码保护Web界面
- **配置注入**: 启动时动态生成 `config.js` 注入环境变量

#### 快速部署命令

```bash
# 基础部署(无密码保护)
docker run -d -p 8081:80 --restart unless-stopped \
  --name prompt-optimizer \
  linshen/prompt-optimizer

# 完整配置(含API密钥和访问控制)
docker run -d -p 8081:80 \
  -e VITE_OPENAI_API_KEY=your_key \
  -e VITE_GEMINI_API_KEY=your_key \
  -e ACCESS_USERNAME=admin \
  -e ACCESS_PASSWORD=your_password \
  -e MCP_DEFAULT_MODEL_PROVIDER=openai \
  --restart unless-stopped \
  --name prompt-optimizer \
  linshen/prompt-optimizer

# 国内镜像(阿里云)
docker run -d -p 8081:80 --restart unless-stopped \
  --name prompt-optimizer \
  registry.cn-guangzhou.aliyuncs.com/prompt-optimizer/prompt-optimizer
```

#### Docker Compose部署

```bash
# 1. 克隆项目
git clone https://github.com/linshenkx/prompt-optimizer.git
cd prompt-optimizer

# 2. 配置环境变量(可选)
cp env.local.example .env
# 编辑.env文件

# 3. 启动服务
docker compose up -d

# 4. 查看日志
docker compose logs -f

# 5. 访问服务
# Web界面: http://localhost:8081
# MCP服务: http://localhost:8081/mcp
```

#### 环境变量配置

**Web应用API密钥**:
- `VITE_OPENAI_API_KEY` - OpenAI API密钥
- `VITE_GEMINI_API_KEY` - Google Gemini API密钥
- `VITE_DEEPSEEK_API_KEY` - DeepSeek API密钥
- `VITE_SILICONFLOW_API_KEY` - SiliconFlow API密钥
- `VITE_ZHIPU_API_KEY` - 智谱AI API密钥

**多自定义模型配置**:
```bash
VITE_CUSTOM_API_KEY_<suffix>=your_key
VITE_CUSTOM_API_BASE_URL_<suffix>=http://api.example.com/v1
VITE_CUSTOM_API_MODEL_<suffix>=model-name
# 例如: Ollama本地模型
VITE_CUSTOM_API_KEY_ollama=dummy_key
VITE_CUSTOM_API_BASE_URL_ollama=http://host.docker.internal:11434/v1
VITE_CUSTOM_API_MODEL_ollama=qwen2.5:7b
```

**MCP服务器配置**:
- `MCP_DEFAULT_MODEL_PROVIDER` - 默认模型提供商(openai/gemini/deepseek等)
- `MCP_LOG_LEVEL` - 日志级别(debug/info/warn/error, 默认debug)
- `MCP_DEFAULT_LANGUAGE` - 默认语言(zh/en, 默认zh)

**访问控制**:
- `ACCESS_USERNAME` - Web访问用户名(默认admin)
- `ACCESS_PASSWORD` - Web访问密码(不设置则无密码保护)
- 注意: MCP服务不受访问控制影响

**Nginx配置**:
- `NGINX_PORT` - Nginx监听端口(默认80)

#### 本地构建Docker镜像

```bash
# 在项目根目录执行
docker build -t my-prompt-optimizer .

# 运行自构建镜像
docker run -d -p 8081:80 \
  -e VITE_OPENAI_API_KEY=your_key \
  --name prompt-optimizer \
  my-prompt-optimizer
```

#### 关键文件说明

- `Dockerfile` - 多阶段构建配置
- `docker-compose.yml` - Docker Compose编排配置
- `docker/nginx.conf` - Nginx配置模板(支持环境变量替换)
- `docker/start-services.sh` - 容器启动脚本
- `docker/generate-config.sh` - 动态生成config.js的脚本
- `docker/generate-auth.sh` - 生成Basic Auth配置的脚本
- `docker/supervisord.conf` - Supervisor进程管理配置

#### 健康检查

Docker Compose配置了健康检查:
```yaml
healthcheck:
  test: ["CMD", "sh", "-c", "curl -f http://localhost:80/ && curl -f http://localhost:80/mcp"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

#### 故障排查

```bash
# 查看容器日志
docker logs prompt-optimizer

# 查看Nginx日志
docker exec prompt-optimizer tail -f /var/log/nginx/error.log

# 查看Supervisor日志
docker exec prompt-optimizer tail -f /var/log/supervisor/supervisord.log

# 检查MCP服务器状态
docker exec prompt-optimizer supervisorctl status

# 验证config.js生成
docker exec prompt-optimizer cat /usr/share/nginx/html/config.js

# 进入容器调试
docker exec -it prompt-optimizer sh
```

#### 性能优化

- **Gzip压缩**: 已启用,压缩级别6
- **静态资源缓存**: /assets目录缓存7天
- **SPA路由**: 通过try_files支持前端路由
- **访问日志**: 已关闭以提升性能(仅记录错误日志)
- **连接复用**: 启用HTTP/1.1 Keep-Alive

### Desktop Application
- Auto-updater system with version checking
- IPC-based architecture with service proxying
- Cross-platform builds (Windows/macOS/Linux)
- Supports both installer and portable versions

## Documentation Structure

- `docs/developer/` - Technical documentation and guides
- `docs/user/` - User-facing documentation and deployment guides  
- `docs/archives/` - Historical development records and lessons learned
- `docs/workspace/` - Current project work tracking and reports
- `docs/testing/` - Testing scenarios and automation guides
- ui应尽量使用naive ui组件
- 记住，我们要尽量使用naive ui实现