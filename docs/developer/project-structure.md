# 项目结构文档

> **最后更新**: 2025-01-25  
> **文档说明**: 本文档详细介绍 Prompt Optimizer 项目的文件和目录结构，以及各部分的作用和依赖关系。

## 目录
- [1. 项目整体架构](#1-项目整体架构)
- [2. 核心包结构 (packages/core)](#2-核心包结构-packagescore)
- [3. UI 组件包 (packages/ui)](#3-ui-组件包-packagesui)
- [4. Web 应用 (packages/web)](#4-web-应用-packagesweb)
- [5. Desktop 应用 (packages/desktop)](#5-desktop-应用-packagesdesktop)
- [6. Chrome 扩展 (packages/extension)](#6-chrome-扩展-packagesextension)
- [7. MCP 服务器 (packages/mcp-server)](#7-mcp-服务器-packagesmcp-server)
- [8. 文档系统 (docs/)](#8-文档系统-docs)
- [9. Docker 部署配置](#9-docker-部署配置)
- [10. 依赖关系](#10-依赖关系)

---

## 1. 项目整体架构

### 1.1 根目录结构

```
prompt-optimizer/
├── packages/                # Monorepo 包目录
│   ├── core/               # 核心业务逻辑（平台无关）
│   ├── ui/                 # Vue 组件库
│   ├── web/                # Web 应用入口
│   ├── desktop/            # Electron 桌面应用
│   ├── extension/          # Chrome 扩展
│   └── mcp-server/         # MCP 服务器
│
├── docs/                    # 文档系统
│   ├── architecture/       # 架构设计文档
│   ├── developer/          # 开发者指南
│   ├── user/               # 用户手册
│   ├── deployment/         # 部署指南
│   ├── testing/            # 测试文档
│   ├── archives/           # 历史记录（按版本号）
│   └── workspace/          # 当前工作文档
│
├── docker/                  # Docker 部署配置
│   ├── nginx.conf          # Nginx 配置模板
│   ├── supervisord.conf    # 进程管理配置
│   ├── start-services.sh   # 启动脚本
│   ├── generate-config.sh  # 动态配置生成
│   └── generate-auth.sh    # 认证配置生成
│
├── scripts/                 # 构建脚本
│   └── sync-versions.js    # 版本同步脚本
│
├── tests/                   # E2E 测试
│   └── e2e/                # Playwright E2E 测试
│
├── images/                  # 项目图片资源
│   ├── logo/               # Logo 文件
│   ├── demo/               # 演示截图
│   └── vercel/             # Vercel 部署截图
│
├── mkdocs/                  # MkDocs 文档站点
│   ├── docs/               # 文档内容
│   ├── mkdocs.yml          # MkDocs 配置
│   └── requirements.txt    # Python 依赖
│
├── CLAUDE.md                # 项目说明（AI 助手）
├── CLAUDE.local.md          # 本地开发配置（不提交）
├── GEMINI.md                # Gemini 配置说明
├── AGENTS.md                # AI Agents 配置
├── package.json             # Workspace 根配置
├── pnpm-workspace.yaml      # pnpm workspace 定义
├── pnpm-lock.yaml           # 依赖锁定文件
├── Dockerfile               # Docker 镜像构建
├── docker-compose.yml       # Docker Compose 配置
└── playwright.config.ts     # E2E 测试配置
```

### 1.2 核心配置文件

#### Workspace 配置
- `pnpm-workspace.yaml` - 定义 pnpm workspace 包范围
- `package.json` - 根 workspace 配置，包含全局脚本和依赖
- `pnpm-lock.yaml` - 锁定所有包的依赖版本

#### 环境配置
- `env.local.example` - 环境变量模板（包含 API Key 配置示例）
- `.env.local` - 本地环境变量（不提交到 Git）

#### 构建配置
- `tsconfig.json` - TypeScript 全局配置（各包继承）
- `playwright.config.ts` - E2E 测试配置

#### Docker 配置
- `Dockerfile` - 多阶段构建配置
- `docker-compose.yml` - Docker Compose 编排
- `docker-compose.dev.yml` - 开发环境配置

#### AI 助手配置
- `CLAUDE.md` - Claude Code 项目说明（提交到仓库）
- `CLAUDE.local.md` - 本地开发偏好（不提交）
- `GEMINI.md` - Gemini 使用说明
- `AGENTS.md` - AI Agents 工具配置

### 1.3 文档系统概览

```
docs/
├── README.md                # 文档总索引
├── architecture/            # 架构设计文档
│   ├── storage-key-architecture.md
│   ├── llm-refactor.md
│   └── ...
├── developer/              # 开发者文档
│   ├── README.md           # 开发者文档索引
│   ├── project-structure.md # 本文档
│   ├── technical-development-guide.md
│   ├── desktop-developer-guide.md
│   └── troubleshooting/    # 故障排查
├── user/                   # 用户文档
│   ├── README.md
│   ├── quick-start.md
│   ├── desktop-user-manual.md
│   ├── mcp-server.md
│   └── deployment/         # 部署指南
├── archives/               # 历史文档（按版本号组织）
│   ├── 101-singleton-refactor/
│   ├── 102-web-architecture-refactor/
│   └── ...
└── workspace/              # 当前工作文档
    ├── scratchpad.md
    └── experience.md
```

## 2. 核心包结构 (packages/core)

> **作用**: 平台无关的业务逻辑核心，被所有其他包依赖

### 2.1 目录结构

```
packages/core/
├── src/
│   ├── services/              # 核心服务层
│   │   ├── llm/              # LLM API 适配器
│   │   │   ├── service.ts    # LLM 服务实现
│   │   │   ├── types.ts      # 类型定义
│   │   │   ├── errors.ts     # 错误定义
│   │   │   ├── electron-proxy.ts # Electron IPC 代理
│   │   │   └── adapters/     # 多提供商适配器
│   │   │       ├── abstract-adapter.ts  # 抽象基类
│   │   │       ├── registry.ts          # 适配器注册表
│   │   │       ├── openai.ts           # OpenAI 适配器
│   │   │       ├── gemini.ts           # Google Gemini 适配器
│   │   │       ├── deepseek.ts         # DeepSeek 适配器
│   │   │       ├── siliconflow.ts      # SiliconFlow 适配器
│   │   │       ├── zhipu.ts            # 智谱 AI 适配器
│   │   │       └── custom.ts           # 自定义模型适配器
│   │   │
│   │   ├── model/            # 文本模型管理
│   │   │   ├── manager.ts    # 模型管理器
│   │   │   ├── types.ts      # 类型定义
│   │   │   ├── defaults.ts   # 默认模型配置
│   │   │   ├── text-model-defaults.ts # 文本模型默认值
│   │   │   ├── converter.ts  # 模型配置转换器
│   │   │   └── electron-proxy.ts # Electron 代理
│   │   │
│   │   ├── image/            # 图片生成服务
│   │   │   ├── service.ts    # 图片生成服务
│   │   │   ├── types.ts      # 类型定义
│   │   │   ├── errors.ts     # 错误定义
│   │   │   ├── electron-proxy.ts # Electron 代理
│   │   │   └── adapters/     # 图片提供商适配器
│   │   │       ├── abstract-adapter.ts # 抽象基类
│   │   │       ├── registry.ts         # 适配器注册表
│   │   │       ├── openai.ts          # DALL-E 适配器
│   │   │       ├── gemini.ts          # Gemini 图片适配器
│   │   │       ├── siliconflow.ts     # SiliconFlow 适配器
│   │   │       └── seedream.ts        # SeeDream 适配器
│   │   │
│   │   ├── image-model/      # 图片模型管理
│   │   │   ├── manager.ts    # 图片模型管理器
│   │   │   ├── types.ts      # 类型定义
│   │   │   ├── defaults.ts   # 默认配置
│   │   │   └── electron-proxy.ts # Electron 代理
│   │   │
│   │   ├── prompt/           # Prompt 优化服务
│   │   │   ├── service.ts    # Prompt 优化实现
│   │   │   ├── types.ts      # 类型定义
│   │   │   ├── errors.ts     # 错误定义
│   │   │   └── electron-proxy.ts # Electron 代理
│   │   │
│   │   ├── template/         # 模板管理服务
│   │   │   ├── manager.ts    # 模板管理器
│   │   │   ├── types.ts      # 类型定义
│   │   │   ├── errors.ts     # 错误定义
│   │   │   ├── csp-safe-processor.ts # CSP 安全模板处理
│   │   │   ├── electron-proxy.ts     # Electron 代理
│   │   │   └── default-templates/    # 内置模板
│   │   │       ├── basic/           # 基础优化模板
│   │   │       ├── context/         # 上下文模式模板
│   │   │       └── image-optimize/  # 图片优化模板
│   │   │
│   │   ├── history/          # 历史记录服务
│   │   │   ├── manager.ts    # 历史管理器
│   │   │   ├── types.ts      # 类型定义
│   │   │   └── electron-proxy.ts # Electron 代理
│   │   │
│   │   ├── storage/          # 多适配器存储服务
│   │   │   ├── manager.ts    # 存储管理器
│   │   │   ├── types.ts      # 类型定义
│   │   │   ├── errors.ts     # 错误定义
│   │   │   └── adapters/     # 存储适配器
│   │   │       ├── local-storage.ts  # localStorage 适配器
│   │   │       ├── indexeddb.ts      # IndexedDB 适配器
│   │   │       ├── file-system.ts    # 文件系统适配器（Desktop）
│   │   │       └── memory.ts         # 内存适配器（测试用）
│   │   │
│   │   ├── preference/       # 用户偏好服务
│   │   │   ├── manager.ts    # 偏好管理器
│   │   │   ├── types.ts      # 类型定义
│   │   │   └── electron-proxy.ts # Electron 代理
│   │   │
│   │   ├── favorite/         # 收藏夹服务
│   │   │   ├── manager.ts    # 收藏管理器
│   │   │   ├── types.ts      # 类型定义
│   │   │   └── electron-proxy.ts # Electron 代理
│   │   │
│   │   ├── context/          # 上下文模式服务
│   │   │   ├── manager.ts    # 上下文管理器
│   │   │   ├── types.ts      # 类型定义
│   │   │   └── electron-proxy.ts # Electron 代理
│   │   │
│   │   ├── data/             # 数据导入导出服务
│   │   │   ├── manager.ts    # 数据管理器
│   │   │   ├── types.ts      # 类型定义
│   │   │   └── electron-proxy.ts # Electron 代理
│   │   │
│   │   └── compare/          # 结果对比服务
│   │       ├── manager.ts    # 对比管理器
│   │       └── types.ts      # 类型定义
│   │
│   ├── types/                # 公共类型定义
│   │   ├── global.d.ts       # 全局类型声明
│   │   └── advanced.ts       # 高级参数类型
│   │
│   ├── utils/                # 工具函数
│   │   ├── environment.ts    # 环境检测
│   │   └── ipc-serialization.ts # IPC 序列化工具
│   │
│   ├── constants/            # 常量定义
│   │   └── storage-keys.ts   # 存储键常量
│   │
│   ├── interfaces/           # 公共接口
│   │   └── import-export.ts  # 导入导出接口
│   │
│   └── index.ts              # 包导出入口
│
├── tests/                    # 测试
│   ├── unit/                # 单元测试
│   │   ├── llm/             # LLM 服务测试
│   │   ├── model/           # 模型管理测试
│   │   ├── prompt/          # Prompt 服务测试
│   │   ├── storage/         # 存储服务测试
│   │   └── image/           # 图片服务测试
│   │
│   └── integration/         # 集成测试
│       ├── openai-api.test.ts      # OpenAI API 测试
│       ├── gemini-api.test.ts      # Gemini API 测试
│       └── siliconflow-api.test.ts # SiliconFlow API 测试
│
├── package.json              # 包配置
├── tsconfig.json             # TypeScript 配置
└── vitest.config.js          # Vitest 测试配置
```

### 2.2 核心服务说明

#### LLM 服务 (services/llm/)
- **作用**: 统一的 LLM API 调用接口
- **特性**: 
  - 多提供商适配器模式（OpenAI、Gemini、DeepSeek 等）
  - 流式响应支持
  - 错误处理和重试机制
  - Tool Calling 支持

#### 模型管理 (services/model/)
- **作用**: 文本模型配置管理
- **特性**:
  - 模型 CRUD 操作
  - 高级参数配置（temperature、top_p 等）
  - 连接测试
  - 默认模型管理

#### 存储服务 (services/storage/)
- **作用**: 统一的跨平台存储接口
- **适配器**:
  - `localStorage`: Web/Extension
  - `IndexedDB`: Web（大数据）
  - `FileSystem`: Desktop（Electron）
  - `Memory`: 测试环境

#### 模板服务 (services/template/)
- **作用**: Prompt 模板管理
- **特性**:
  - CSP 安全的模板处理
  - 变量替换系统 `{{variableName}}`
  - 内置模板库
  - 自定义模板支持

### 2.3 Electron 代理模式

所有服务都提供 `*-electron-proxy.ts` 文件，用于 Desktop 端的 IPC 通信：

```typescript
// 渲染进程使用代理
import { PromptService } from '@prompt-optimizer/core'

// 代理会自动通过 IPC 调用主进程的真实服务
const result = await promptService.optimize(prompt)
```

## 3. Web包结构 (packages/web)

### 3.1 源代码目录 (packages/web/src/)
```
src/
├── components/        # Vue组件
│   ├── PromptPanel.vue      # 提示词面板
│   ├── ModelManager.vue     # 统一模型管理器（支持文本/图像模型切换）
│   ├── ImageModelManager.vue# 图像模型专用管理组件
│   ├── ImageModelEditModal.vue # 图像模型编辑弹窗
│   ├── TemplateManager.vue  # 模板管理器
│   ├── InputPanel.vue       # 输入面板
│   ├── OutputPanel.vue      # 输出面板
│   └── image-mode/         # 图像模式专用组件
│       └── ImageWorkspace.vue # 图像工作区
├── composables/       # Vue组合式函数
│   ├── useImageModelManager.ts # 图像模型管理composable
│   ├── useImageGeneration.ts   # 图像生成composable
│   └── useImageWorkspace.ts    # 图像工作区composable
├── services/          # 业务逻辑
│   ├── llm/           # LLM服务
│   ├── model/         # 模型配置
│   ├── prompt/        # 提示词服务
│   ├── promptManager.js # 提示词管理
│   └── themeManager.js # 主题管理
├── assets/           # 静态资源
│   ├── images/       # 图片资源
│   └── styles/       # 样式资源
├── prompts/          # 提示词模板
├── App.vue           # 根组件
└── main.ts           # 入口文件
```

### 3.2 组件目录详情 (packages/web/src/components/)

#### 核心组件
- `PromptPanel.vue` - 提示词输入和优化面板
- `InputPanel.vue` - 输入面板组件
- `OutputPanel.vue` - 输出面板组件
- `TemplateManager.vue` - 模板管理器
- `ThemeToggle.vue` - 主题切换组件
- `LoadingSpinner.vue` - 加载动画组件

#### 模型管理架构
- `ModelManager.vue` - **统一模型管理器**
  - 支持文本模型和图像模型的标签页切换
  - 文本模型：直接在该组件内管理
  - 图像模型：委托给 `ImageModelManager.vue` 组件处理
  - 替代了原有的单一模型管理方案（`ModelManager.vue.bak`）

- `ImageModelManager.vue` - **图像模型专用管理组件**
  - 专门负责图像模型的列表展示、连接测试、启用/禁用等操作
  - 与 `useImageModelManager` composable 配合使用
  - 支持图像提供商（OpenAI DALL-E、Gemini、SiliconFlow等）的模型管理

- `ImageModelEditModal.vue` - **图像模型编辑弹窗**
  - 用于添加/编辑图像模型配置
  - 提供商选择、模型选择、连接配置等表单功能

#### 图像模式组件
- `image-mode/ImageWorkspace.vue` - **图像工作区**
  - 图像模式的主要工作界面
  - 整合文生图、图生图、图像迭代等功能

### 3.3 测试目录 (packages/web/tests/)
```
tests/
├── unit/            # 单元测试
│   ├── components/  # 组件测试
│   └── services/    # 服务测试
└── integration/     # 集成测试
    └── services/    # 服务集成测试
```

### 3.4 Web包配置
- `package.json` - Web包配置
- `vite.config.ts` - Vite配置
- `tailwind.config.js` - TailwindCSS配置
- `.env.local` - 本地环境变量
- `postcss.config.js` - PostCSS配置
- `index.html` - 项目入口HTML文件

## 4. 扩展包结构 (packages/extension)

### 4.1 源代码目录 (packages/extension/src/)
```
src/
├── popup/           # 弹出窗口界面
├── background/      # 后台脚本
├── content/         # 内容脚本
└── manifest.json    # 扩展配置文件
```

### 4.2 扩展包配置
- `package.json` - 扩展包配置
- `vite.config.ts` - 构建配置

## 5. 依赖关系

### 5.1 核心包依赖 (@prompt-optimizer/core)
```
@prompt-optimizer/core
├── @openai/openai ^4.83.0      # OpenAI SDK
├── @google/generative-ai ^0.21.0 # Google Generative AI SDK
└── uuid ^11.0.5                # UUID生成
```

### 5.2 Web包依赖 (@prompt-optimizer/web)
```
@prompt-optimizer/web
├── @prompt-optimizer/core  # 依赖核心包
├── vue ^3.5.x             # Vue框架
├── pinia ^2.1.x           # 状态管理
└── tailwindcss ^3.4.1     # 样式框架
```

### 5.3 扩展包依赖 (@prompt-optimizer/extension)
```
@prompt-optimizer/extension
├── @prompt-optimizer/core  # 依赖核心包
├── @prompt-optimizer/ui    # 依赖UI组件包
└── vue ^3.5.x             # Vue框架
``` 