# 国际化（i18n）规范指南

## 翻译键名规范

为了保持翻译文件的一致性和可维护性，请遵循以下键名规范：

### 1. 命名结构

使用嵌套对象结构，按照以下层次组织翻译键：

```
{
  "模块名": {
    "子模块或功能": {
      "具体文本": "翻译内容"
    }
  }
}
```

### 2. 模块划分

- `common`: 通用文本，如按钮文本、常见操作等
- 具体功能模块: 如 `promptOptimizer`, `settings`, `modelManager` 等

### 3. 参数化文本

对于包含变量的文本，使用花括号标记参数：

```typescript
// 定义
"version": "V{version}"

// 使用
t('common.version', { version: '1.0.0' })
```

### 4. 示例结构

```typescript
export default {
  // 通用文本
  common: {
    buttons: {
      save: '保存',
      cancel: '取消',
      confirm: '确认',
    },
    labels: {
      createdAt: '创建于',
      lastModified: '最后修改',
    },
    messages: {
      loading: '加载中...',
      noData: '暂无数据',
    },
  },
  
  // 功能模块
  promptOptimizer: {
    title: 'GuDa Prompt',
    form: {
      inputPlaceholder: '请输入需要优化的prompt...',
      templateLabel: '优化提示词',
    },
    actions: {
      optimize: '开始优化 →',
      save: '保存提示词',
      share: '分享',
    },
  },
  
  // 设置模块
  settings: {
    title: '设置',
    sections: {
      language: '语言设置',
      theme: '主题设置',
      api: 'API设置',
    },
  },
}
```

## 最佳实践

1. **保持一致性**: 同类型的文本应使用相同的键名结构
2. **避免重复**: 通用文本应放在 `common` 下，避免在多个模块中重复定义
3. **描述性键名**: 键名应清晰描述文本的用途，而不是直接使用翻译内容
4. **模块化**: 按功能模块组织翻译，便于维护和查找
5. **注释**: 对于复杂或特殊用途的文本，添加注释说明

## 添加新语言

添加新语言时，请确保：

1. 在 `locales` 目录下创建对应的语言文件，如 `ja-JP.ts`
2. 复制现有语言文件的结构，确保键名完全一致
3. 在 `packages/ui/src/plugins/i18n.ts` 中：
   - 导入新语言文件
   - 添加到 `SupportedLocale` 类型
   - 添加到 `SUPPORTED_LOCALES` 数组
   - 配置 fallback 规则
   - 添加到 `messages` 对象
4. 在 `packages/ui/src/components/LanguageSwitchDropdown.vue` 中添加新语言选项
5. 测试所有页面在新语言下的显示效果

## 当前支持的语言

- **简体中文 (zh-CN)**: 默认语言，适用于中国大陆用户
- **繁體中文 (zh-TW)**: 适用于台湾、香港等地区用户，基于简体中文翻译并适配港台用语习惯
- **English (en-US)**: 英语，适用于国际用户

## "开始优化"功能完整调用链分析

### 一、UI组件层（用户点击入口）

**按钮位置**: `/root/prompt-optimizer/packages/ui/src/components/InputPanel.vue:192-201`

```vue
<NButton
    type="primary"
    size="medium"
    @click="$emit('submit')"
    :loading="loading"
    :disabled="loading || disabled || !modelValue.trim()"
>
    {{ loading ? loadingText : buttonText }}
</NButton>
```

**国际化键**: `promptOptimizer.optimize` → "开始优化"（zh-CN.ts:504）

### 二、事件传递链路

```
InputPanel.vue:195
  emit('submit')
    ↓
ContextSystemWorkspace.vue:42
  @submit="emit('optimize')"
    ↓
App.vue:~156
  @optimize="handleOptimizePrompt"
```

### 三、核心业务逻辑

#### 1. App.vue - handleOptimizePrompt()

```typescript
const handleOptimizePrompt = () => {
    if (advancedModeEnabled.value) {
        // 高级模式：收集上下文信息
        const advancedContext = {
            variables: variableManager?.variableManager.value?.resolveAllVariables() || {},
            messages: optimizationContext.value.length > 0 ? optimizationContext.value : undefined,
            tools: optimizationContextTools.value.length > 0 ? optimizationContextTools.value : undefined,
        };
        optimizer.handleOptimizePromptWithContext(advancedContext, modelOverrideValue.value);
    } else {
        // 基础模式
        optimizer.handleOptimizePrompt(modelOverrideValue.value);
    }
};
```

#### 2. usePromptOptimizer.ts:91-197 - handleOptimizePrompt()

**核心流程**:

1. **验证阶段**
   - 检查prompt是否为空
   - 检查是否正在优化中
   - 验证模板和模型配置

2. **准备阶段**
   ```typescript
   state.isOptimizing = true
   state.optimizedPrompt = ''
   state.optimizedReasoning = ''
   ```

3. **构建请求**
   ```typescript
   const request: OptimizationRequest = {
       optimizationMode: optimizationMode.value,
       targetPrompt: state.prompt,
       templateId: currentTemplate.id,
       modelKey: optimizeModel.value,
       modelOverride: modelOverride,
       contextMode: contextMode?.value,
       advancedContext: advancedContext  // 仅在带上下文版本中
   }
   ```

4. **流式优化**
   ```typescript
   await promptService.value!.optimizePromptStream(
       request,
       {
           onToken: (token: string) => {
               state.optimizedPrompt += token
           },
           onReasoningToken: (reasoningToken: string) => {
               state.optimizedReasoning += reasoningToken
           },
           onComplete: async () => {
               // 创建历史记录
               const recordData = { /* ... */ };
               const newRecord = await historyManager.value!.createNewChain(recordData);
               // 更新版本信息
               state.currentChainId = newRecord.chainId;
               state.currentVersions = newRecord.versions;
               state.currentVersionId = newRecord.currentRecord.id;
           },
           onError: (error: Error) => {
               toast.error(error.message)
           }
       }
   )
   ```

#### 3. PromptService.optimizePromptStream()

**位置**: `/root/prompt-optimizer/packages/core/src/services/prompt/service.ts`

**核心步骤**:

```typescript
async optimizePromptStream(
    request: OptimizationRequest,
    callbacks: StreamHandlers,
): Promise<void> {
    // 1. 验证请求参数
    this.validateOptimizationRequest(request);

    // 2. 获取模型配置
    const modelConfig = await this.modelManager.getModel(request.modelKey);

    // 3. 获取优化模板
    const template = await this.templateManager.getTemplate(request.templateId);

    // 4. 创建模板上下文
    const baseContext: TemplateContext = {
        originalPrompt: request.targetPrompt,
        optimizationMode: request.optimizationMode,
        contextMode: request.contextMode,
        renderPhase: "optimize",
    };

    // 5. 扩展上下文（变量、会话消息）
    const context = TemplateProcessor.createExtendedContext(
        baseContext,
        request.advancedContext?.variables,
        request.advancedContext?.messages,
    );

    // 6. 处理会话消息
    if (request.advancedContext?.messages) {
        const conversationText = TemplateProcessor.formatConversationAsText(
            request.advancedContext.messages,
        );
        context.conversationContext = conversationText;
    }

    // 7. 渲染模板得到最终提示词
    const renderedPrompt = await TemplateProcessor.render(template.content, context);

    // 8. 调用LLM服务进行流式生成
    await this.llmService.streamChat(
        renderedPrompt,
        modelConfig,
        callbacks,
        request.modelOverride
    );
}
```

### 四、完整调用链图示

```
用户点击"开始优化"按钮
    ↓
InputPanel.vue:195 → emit('submit')
    ↓
ContextSystemWorkspace.vue:42 → emit('optimize')
    ↓
App.vue:~156 → handleOptimizePrompt()
    ↓
    [模式判断]
    ├─ 高级模式 → optimizer.handleOptimizePromptWithContext(advancedContext, modelOverride)
    └─ 基础模式 → optimizer.handleOptimizePrompt(modelOverride)
    ↓
usePromptOptimizer.ts:91-314
    ↓
    1. 验证模板和模型
    2. 清空之前结果
    3. 构建OptimizationRequest
    4. 调用promptService.optimizePromptStream()
    ↓
PromptService.optimizePromptStream()
    ↓
    1. 验证请求参数
    2. 获取模型配置
    3. 获取优化模板
    4. 创建并扩展模板上下文
    5. 渲染模板
    6. 调用llmService.streamChat()
    ↓
LLMService.streamChat()
    ↓
    [流式返回结果]
    ├─ onToken → 更新optimizedPrompt
    ├─ onReasoningToken → 更新optimizedReasoning
    ├─ onComplete → 创建历史记录、更新版本信息
    └─ onError → 显示错误提示
```

### 五、关键数据流

#### 输入数据
1. **用户输入的提示词** (`optimizer.prompt`)
2. **选择的优化模型** (`optimizeModel.value`)
3. **选择的优化模板** (`selectedOptimizeTemplate` / `selectedUserOptimizeTemplate`)
4. **高级上下文**（可选）:
   - 变量值 (`variables`)
   - 会话消息 (`messages`)
   - 工具定义 (`tools`)
5. **模型覆盖参数**（可选）(`modelOverride`)

#### 输出数据
1. **优化后的提示词** (`optimizedPrompt`) - 流式更新
2. **优化推理过程** (`optimizedReasoning`) - 流式更新
3. **历史记录** - 完成时创建
4. **版本信息** - 完成时更新

### 六、状态管理

| 状态变量 | 作用 | 更新时机 |
|---------|------|---------|
| `isOptimizing` | 防止重复提交 | 开始时设为true,完成/错误时设为false |
| `optimizedPrompt` | 优化结果 | 流式累积,每次onToken回调时追加 |
| `optimizedReasoning` | 推理过程 | 流式累积,每次onReasoningToken回调时追加 |
| `currentChainId` | 记录链ID | onComplete时更新 |
| `currentVersions` | 版本列表 | onComplete时更新 |
| `currentVersionId` | 当前版本ID | onComplete时更新 |

### 七、错误处理机制

1. **UI层**: 按钮disabled条件（无输入、正在优化）
2. **Composable层**: 检查模板、模型是否选择
3. **Service层**: 验证请求参数、模型配置、模板存在性
4. **LLM层**: 通过onError回调传递错误
5. **用户反馈**: 通过toast显示错误信息 