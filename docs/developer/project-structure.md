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

## 3. UI 组件包 (packages/ui)

> **作用**: Vue 3 组件库和 Composition API 钩子，被所有前端应用包依赖

### 3.1 目录结构

```
packages/ui/
├── src/
│   ├── components/              # Vue 组件
│   │   ├── context-mode/       # 上下文模式组件
│   │   │   ├── ContextEditor.vue           # 上下文编辑器
│   │   │   ├── ContextModeActions.vue      # 上下文模式操作栏
│   │   │   ├── ContextSystemWorkspace.vue  # 系统上下文工作区
│   │   │   ├── ContextUserWorkspace.vue    # 用户上下文工作区
│   │   │   └── ConversationManager.vue     # 对话管理器
│   │   │
│   │   ├── image-mode/         # 图片模式组件
│   │   │   └── ImageWorkspace.vue          # 图片工作区
│   │   │
│   │   ├── variable/           # 变量管理组件
│   │   │   ├── VariableImporter.vue        # 变量导入器
│   │   │   └── VariableManagerModal.vue    # 变量管理弹窗
│   │   │
│   │   ├── variable-extraction/ # 变量提取组件
│   │   │   └── codemirror-extensions.ts    # CodeMirror 扩展
│   │   │
│   │   ├── types/              # 组件类型定义
│   │   │
│   │   ├── ActionButton.vue               # 动作按钮
│   │   ├── ApiKeySetupModal.vue          # API Key 设置弹窗
│   │   ├── BasicTestMode.vue             # 基础测试模式
│   │   ├── BuiltinTemplateLanguageSwitch.vue # 内置模板语言切换
│   │   ├── CategoryManager.vue           # 分类管理器
│   │   ├── CategoryTreeSelect.vue        # 分类树选择器
│   │   ├── ContentCard.vue               # 内容卡片
│   │   ├── DataManager.vue               # 数据管理器
│   │   ├── FavoriteButton.vue            # 收藏按钮
│   │   ├── FavoriteCard.vue              # 收藏卡片
│   │   ├── FavoriteListItem.vue          # 收藏列表项
│   │   ├── FavoriteManager.vue           # 收藏夹管理器
│   │   ├── FullscreenDialog.vue          # 全屏对话框
│   │   ├── FunctionModeSelector.vue      # 功能模式选择器
│   │   ├── HistoryDrawer.vue             # 历史记录抽屉
│   │   ├── Icon.vue                      # 图标组件
│   │   ├── ImageModelEditModal.vue       # 图片模型编辑弹窗
│   │   ├── ImageModelManager.vue         # 图片模型管理器
│   │   ├── InputPanel.vue                # 输入面板
│   │   ├── InputWithSelect.vue           # 带选择器的输入框
│   │   ├── LanguageSwitchDropdown.vue    # 语言切换下拉菜单
│   │   ├── MainLayout.vue                # 主布局
│   │   ├── MarkdownRenderer.vue          # Markdown 渲染器
│   │   ├── Modal.vue                     # 模态框
│   │   ├── ModelAdvancedSection.vue      # 模型高级参数
│   │   ├── ModelManager.vue              # 模型管理器
│   │   ├── ModelOverrideSelector.vue     # 模型覆盖选择器
│   │   ├── ModelParameterEditor.vue      # 模型参数编辑器
│   │   ├── ModelSelect.vue               # 模型选择器
│   │   ├── NavIcon.vue                   # 导航图标
│   │   ├── OptimizationModeSelector.vue  # 优化模式选择器
│   │   ├── OutputDisplay.vue             # 输出显示
│   │   ├── OutputDisplayCore.vue         # 输出显示核心
│   │   ├── OutputDisplayFullscreen.vue   # 全屏输出显示
│   │   ├── Panel.vue                     # 面板
│   │   ├── PromptPanel.vue               # Prompt 面板
│   │   ├── PromptPreviewPanel.vue        # Prompt 预览面板
│   │   ├── ProviderModelSelector.vue     # 提供商模型选择器
│   │   ├── QuickModelConfig.vue          # 快速模型配置
│   │   ├── SaveFavoriteDialog.vue        # 保存收藏对话框
│   │   ├── SelectWithConfig.vue          # 带配置的选择器
│   │   ├── TagManager.vue                # 标签管理器
│   │   ├── TemplateManager.vue           # 模板管理器
│   │   ├── TemplateSelect.vue            # 模板选择器
│   │   ├── TestAreaPanel.vue             # 测试区域面板
│   │   ├── TestControlBar.vue            # 测试控制栏
│   │   ├── TestInputSection.vue          # 测试输入部分
│   │   ├── TestResultSection.vue         # 测试结果部分
│   │   ├── TextDiff.vue                  # 文本差异对比
│   │   ├── TextModelEditModal.vue        # 文本模型编辑弹窗
│   │   ├── TextModelList.vue             # 文本模型列表
│   │   ├── TextModelManager.vue          # 文本模型管理器
│   │   ├── ThemeToggleUI.vue             # 主题切换 UI
│   │   ├── Toast.vue                     # 通知提示
│   │   ├── ToolCallDisplay.vue           # Tool Call 显示
│   │   ├── UpdaterIcon.vue               # 更新器图标
│   │   └── UpdaterModal.vue              # 更新器弹窗
│   │
│   ├── composables/            # Composition API 钩子
│   │   ├── accessibility/      # 可访问性相关
│   │   ├── context/           # 上下文相关
│   │   ├── image/             # 图片相关
│   │   ├── mode/              # 模式相关
│   │   ├── model/             # 模型相关
│   │   ├── performance/       # 性能相关
│   │   ├── prompt/            # Prompt 相关
│   │   ├── storage/           # 存储相关
│   │   ├── system/            # 系统相关
│   │   ├── ui/                # UI 交互相关
│   │   ├── variable/          # 变量相关
│   │   └── index.ts           # 统一导出
│   │
│   ├── i18n/                  # 国际化
│   │   ├── locales/          # 语言包
│   │   │   ├── zh-CN.ts      # 简体中文
│   │   │   ├── zh-TW.ts      # 繁体中文
│   │   │   └── en-US.ts      # 英文
│   │   └── README.md         # 国际化说明
│   │
│   ├── services/              # UI 层服务
│   │   ├── DataImportExportManager.ts    # 数据导入导出管理器
│   │   ├── EnhancedTemplateProcessor.ts  # 增强模板处理器
│   │   ├── PromptDataConverter.ts        # Prompt 数据转换器
│   │   ├── SmartVariableExtractor.ts     # 智能变量提取器
│   │   ├── VariableManager.ts            # 变量管理器
│   │   └── index.ts                      # 服务导出
│   │
│   ├── styles/                # 全局样式
│   │   ├── common.css         # 通用样式
│   │   ├── index.css          # 主样式文件
│   │   └── scrollbar.css      # 滚动条样式
│   │
│   ├── config/                # 配置
│   │   └── naive-theme.ts     # Naive UI 主题配置
│   │
│   ├── data/                  # 数据
│   │   └── quickTemplates/    # 快速模板数据
│   │
│   ├── directives/            # Vue 指令
│   │   └── clickOutside.ts    # 点击外部指令
│   │
│   ├── docs/                  # 文档
│   │   └── syntax-guide.ts    # 语法指南
│   │
│   ├── examples/              # 示例
│   │   └── storage-usage-examples.ts # 存储使用示例
│   │
│   ├── plugins/               # 插件
│   │   └── i18n.ts           # 国际化插件
│   │
│   ├── types/                 # 类型定义
│   │   ├── components.ts      # 组件类型
│   │   ├── data-converter.ts  # 数据转换类型
│   │   ├── electron.d.ts      # Electron 类型
│   │   ├── images.d.ts        # 图片类型
│   │   ├── index.ts           # 类型导出
│   │   ├── select-options.ts  # 选择器选项类型
│   │   ├── services.ts        # 服务类型
│   │   ├── standard-prompt.ts # 标准 Prompt 类型
│   │   ├── template.ts        # 模板类型
│   │   ├── variable.ts        # 变量类型
│   │   ├── vue-i18n.d.ts      # Vue-i18n 类型
│   │   └── workspace.ts       # 工作区类型
│   │
│   ├── utils/                 # 工具函数
│   │   ├── data-transformer.ts # 数据转换器
│   │   ├── error.ts           # 错误处理
│   │   └── platform.ts        # 平台检测
│   │
│   ├── assets/                # 静态资源
│   │   ├── GuDa-Logo.png      # Logo 文件
│   │   ├── guda-logo.png      # Logo 小图
│   │   ├── waiting.backup.png # 等待图标备份
│   │   └── waiting.png        # 等待图标
│   │
│   ├── components.d.ts        # 组件类型声明
│   └── index.ts               # 包导出入口
│
├── tests/                     # 测试
│   ├── e2e/                  # E2E 测试
│   │   └── context-editor-refactor.spec.ts
│   ├── integration/          # 集成测试
│   │   ├── context-editor-persist.spec.ts
│   │   └── context-editor-sync.spec.ts
│   └── unit/                 # 单元测试
│       └── components/       # 组件单元测试
│           └── ContextEditor.spec.ts
│
├── docs/                      # UI 包文档
├── package.json               # 包配置
├── tsconfig.json              # TypeScript 配置
├── postcss.config.js          # PostCSS 配置
├── tailwind.config.js         # TailwindCSS 配置
├── vite.config.ts             # Vite 配置
└── vitest.config.ts           # Vitest 测试配置
```

### 3.2 技术特性

#### Vue 3 + Composition API
- 完全使用 Composition API
- TypeScript 类型支持
- 响应式数据管理

#### Naive UI 组件库
- 基于 Naive UI 构建
- 主题系统（亮/暗模式）
- 自定义主题配置

#### 国际化支持
- Vue-i18n 实现
- 支持中文（简/繁）、英文
- 动态语言切换

#### 图标系统
- 使用 @vicons/tabler 图标库
- 统一的 NavIcon 组件封装
- 可配置尺寸和描边宽度

---

## 4. Web 应用 (packages/web)

> **作用**: Web 应用入口，使用 Vite 构建的 SPA 应用

### 4.1 目录结构

```
packages/web/
├── src/
│   ├── App.vue              # 应用根组件
│   └── main.ts              # 应用入口文件
│
├── public/                  # 静态资源
│   ├── favicon.ico          # 网站图标
│   └── config.js            # 运行时配置（Docker 注入）
│
├── tests/                   # 测试
│   ├── unit/               # 单元测试
│   └── integration/        # 集成测试
│
├── index.html               # HTML 模板
├── package.json             # 包配置
├── vite.config.ts           # Vite 构建配置
├── postcss.config.js        # PostCSS 配置
├── tailwind.config.js       # TailwindCSS 配置
├── tsconfig.json            # TypeScript 配置
├── tsconfig.node.json       # Node.js TypeScript 配置
└── vitest.config.ts         # Vitest 测试配置
```

### 4.2 部署特性
- **Vercel 部署**: 主分支自动部署到 Vercel
- **Docker 部署**: 多阶段构建，支持生产环境
- **配置注入**: 支持运行时环境变量注入

---

## 5. Desktop 应用 (packages/desktop)

> **作用**: Electron 桌面应用，支持跨平台（Windows/macOS/Linux）

### 5.1 目录结构

```
packages/desktop/
├── main.js                  # Electron 主进程
├── preload.js               # 预加载脚本
├── test-app.js              # 测试应用脚本
│
├── config/                  # 配置文件
│   ├── electron-builder.json # 打包配置
│   └── app-update.yml       # 自动更新配置
│
├── icons/                   # 应用图标
│   ├── icon.icns           # macOS 图标
│   ├── icon.ico            # Windows 图标
│   └── icon.png            # Linux 图标
│
├── build-desktop.bat        # Windows 构建脚本
├── dev-app-update.yml       # 开发环境更新配置
├── package.json             # 包配置
└── README.md                # Desktop 说明文档
```

### 5.2 架构特性

#### IPC 代理模式
- **主进程**: 托管所有 core 服务的真实实例
- **渲染进程**: 使用 `*-electron-proxy.ts` 代理
- **IPC 通信**: 自动序列化复杂对象

#### 文件系统存储
- 使用 Electron 的文件系统 API
- 数据存储在用户目录
- 支持数据迁移和备份

#### 自动更新系统
- 基于 electron-updater
- 支持增量更新
- 版本检查和通知

---

## 6. Chrome 扩展 (packages/extension)

> **作用**: Chrome 扩展，提供浏览器内的 Prompt 优化功能

### 6.1 目录结构

```
packages/extension/
├── src/
│   ├── App.vue              # 扩展应用入口
│   └── main.ts              # 应用初始化
│
├── public/
│   ├── manifest.json        # Chrome 扩展配置
│   ├── icons/              # 扩展图标
│   └── popup.html          # 弹窗 HTML
│
├── chrome.md                # Chrome 扩展说明
├── permissions-explanation.md # 权限说明
├── privacy-policy.md        # 隐私政策
├── publish-guide.md         # 发布指南
├── screenshots.md           # 截图说明
│
├── package.json             # 包配置
├── vite.config.ts           # Vite 配置
├── postcss.config.js        # PostCSS 配置
├── tailwind.config.js       # TailwindCSS 配置
└── tsconfig.json            # TypeScript 配置
```

### 6.2 扩展特性
- **弹窗界面**: 简洁的 Prompt 优化界面
- **localStorage**: 使用浏览器本地存储
- **权限最小化**: 只请求必要的权限

---

## 7. MCP 服务器 (packages/mcp-server)

> **作用**: Model Context Protocol 服务器，支持 Claude Desktop/Cline 集成

### 7.1 目录结构

```
packages/mcp-server/
├── src/
│   ├── index.ts             # 服务器入口
│   ├── tools/              # MCP 工具定义
│   │   ├── prompt-optimize.ts    # Prompt 优化工具
│   │   ├── template-manage.ts    # 模板管理工具
│   │   └── model-config.ts       # 模型配置工具
│   │
│   └── handlers/           # 请求处理器
│       ├── tool-handler.ts      # 工具调用处理
│       └── resource-handler.ts  # 资源处理
│
├── tests/                   # 测试
│   └── mcp-integration.test.ts # MCP 集成测试
│
├── preload-env.cjs          # 环境预加载（CJS）
├── preload-env.js           # 环境预加载（ES）
├── package.json             # 包配置
├── tsconfig.json            # TypeScript 配置
└── README.md                # MCP 服务器说明
```

### 7.2 MCP 特性
- **工具调用**: 提供 Prompt 优化、模板管理等工具
- **资源管理**: 管理模板和配置资源
- **多语言支持**: 支持中英文界面
- **Docker 集成**: 支持 Docker 部署

---

## 8. 文档系统 (docs/)

### 8.1 文档架构

```
docs/
├── README.md                # 文档总索引
│
├── architecture/            # 架构设计文档
│   ├── function-mode.md
│   ├── storage-key-architecture.md
│   ├── llm-refactor.md
│   └── ...
│
├── developer/              # 开发者文档
│   ├── README.md           # 开发者指南入口
│   ├── project-structure.md # 本文档
│   ├── technical-development-guide.md
│   ├── desktop-developer-guide.md
│   ├── electron-ipc-best-practices.md
│   └── troubleshooting/    # 故障排查
│       ├── README.md
│       └── general-checklist.md
│
├── user/                   # 用户文档
│   ├── README.md
│   ├── quick-start.md      # 快速开始
│   ├── desktop-user-manual.md # 桌面端用户手册
│   ├── mcp-server.md       # MCP 服务器使用
│   ├── multi-custom-models.md # 多自定义模型
│   ├── favorites.md        # 收藏夹功能
│   └── deployment/         # 部署指南
│       └── docker-guide.md
│
├── archives/               # 历史文档（按版本号组织）
│   ├── 101-singleton-refactor/
│   ├── 102-web-architecture-refactor/
│   ├── 103-desktop-architecture/
│   ├── 104-test-panel-refactor/
│   ├── 105-output-display-v2/
│   ├── ... （120+ 个版本记录）
│   └── INDEX.md            # 版本索引
│
├── workspace/              # 当前工作文档
│   ├── ui-design-analysis.md
│   ├── ui-refactor-plan.md
│   └── variable-system-redesign.md
│
├── testing/                # 测试文档
│   └── ai-automation/     # AI 自动化测试
│
├── deployment/             # 部署文档
│   └── docker-mcp-integration.md
│
├── features/               # 功能文档
│   └── model-override-selector.md
│
└── project/                # 项目管理文档
    ├── README.md
    ├── prd.md              # 产品需求文档
    ├── project-status.md    # 项目状态
    └── version-sync.md      # 版本同步
```

---

## 9. Docker 部署配置

### 9.1 Docker 文件结构

```
docker/
├── nginx.conf               # Nginx 配置模板
├── supervisord.conf         # Supervisor 进程管理
├── start-services.sh        # 容器启动脚本
├── generate-config.sh       # 动态配置生成
└── generate-auth.sh         # 基础认证配置
```

### 9.2 部署架构
- **多阶段构建**: Node.js 构建 + Nginx 运行时
- **进程管理**: Supervisor 管理 Nginx + MCP 服务器
- **配置注入**: 启动时动态生成配置文件
- **访问控制**: 支持 Basic Auth 保护

### 9.3 服务端口
- **Nginx**: 监听 `${NGINX_PORT}` (默认 80)
- **MCP 服务器**: 内部 3000 端口
- **MCP 接口**: 通过 `/mcp` 路径对外服务

---

## 10. 依赖关系

### 10.1 包依赖层次

```
                    core (基础层)
                      ↓
                     ui (组件层)
                      ↓
        ┌─────────────┼─────────────┐
        ↓             ↓             ↓
      web         desktop      extension
   (Web应用)    (桌面应用)     (浏览器扩展)
        ↓
   mcp-server
  (MCP服务器)
```

### 10.2 技术栈总览

#### 核心技术
- **前端框架**: Vue 3 + TypeScript + Composition API
- **构建工具**: Vite + pnpm workspaces
- **样式框架**: TailwindCSS + PostCSS
- **UI 组件**: Naive UI
- **图标库**: @vicons/tabler

#### 后端集成
- **LLM API**: OpenAI、Gemini、DeepSeek、SiliconFlow、智谱 AI
- **图片生成**: DALL-E、Gemini Image、SiliconFlow
- **存储**: localStorage、IndexedDB、FileSystem

#### 开发工具
- **测试**: Vitest (单元) + Playwright (E2E)
- **代码检查**: ESLint + TypeScript
- **包管理**: pnpm (必需 >= 8)
- **Node.js**: >= 18

#### 部署平台
- **Web**: Vercel (主分支自动部署)
- **Desktop**: Electron (跨平台打包)
- **Extension**: Chrome Web Store
- **Docker**: 多架构支持 (amd64/arm64)

### 10.3 构建顺序

由于内部依赖关系，必须按以下顺序构建：

```bash
# 1. 核心业务逻辑
pnpm build:core

# 2. UI 组件库
pnpm build:ui

# 3. 应用层（可并行）
pnpm build:web
pnpm build:desktop
pnpm build:extension
```

### 10.4 开发命令

```bash
# 快速开始
pnpm dev:fresh          # 清理并重启开发服务

# 桌面开发
pnpm dev:desktop        # 构建 core/ui，运行 web 和 desktop
pnpm dev:desktop:fresh  # 清理并重启桌面开发

# 构建命令
pnpm build              # 构建所有包
pnpm build:core         # 仅构建核心包
pnpm build:ui           # 仅构建 UI 包

# 测试命令
pnpm test               # 运行所有测试
pnpm -F @prompt-optimizer/core test    # 运行核心包测试

# 维护命令
pnpm clean              # 清理 dist 和缓存
pnpm version:sync       # 同步所有包版本
```

---

## 总结

Prompt Optimizer 采用 **Monorepo + 分层架构** 设计：

1. **Core 层**: 平台无关的业务逻辑核心
2. **UI 层**: Vue 3 组件库和 Composition API
3. **Application 层**: Web、Desktop、Extension 三端应用
4. **MCP 层**: 支持 AI 工具集成的服务器

这种架构设计实现了：
- ✅ **代码复用**: 核心逻辑在所有平台共享
- ✅ **类型安全**: 全程 TypeScript 支持
- ✅ **平台适配**: 每个平台有专门的适配层
- ✅ **扩展性**: 易于添加新平台或新功能
- ✅ **维护性**: 清晰的模块分离和依赖管理

详细的技术实现和开发流程，请参考 [技术开发指南](./technical-development-guide.md)。 