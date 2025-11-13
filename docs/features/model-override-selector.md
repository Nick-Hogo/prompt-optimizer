# 模型覆盖选择器功能设计文档

## 功能概述

模型覆盖选择器（Model Override Selector）是一个新增的 UI 功能，允许用户在已选择的"优化模型"配置基础上，动态选择该配置下的具体模型进行优化。

### 业务场景

在实际使用中，用户可能需要：
1. 在同一个 API 配置下测试不同的模型（如 OpenAI 配置下测试 gpt-4、gpt-3.5-turbo 等）
2. 快速切换模型而无需修改配置
3. 对比不同模型在相同提示词下的优化效果

### 核心价值

- **灵活性**：无需修改模型配置即可切换模型
- **效率**：一键获取可用模型列表，快速切换
- **直观性**：清晰的 UI 展示，用户可选择是否覆盖默认模型

---

## 设计原理

### 1. 数据流架构

```
用户操作
   ↓
ModelOverrideSelector 组件（UI 层）
   ↓
App.vue 状态管理
   ↓
usePromptOptimizer Composable
   ↓
PromptService（传递 OptimizationRequest）
   ↓
LLMService（使用 modelOverride 覆盖 modelMeta.id）
   ↓
对应的 Provider Adapter（实际 API 调用）
```

### 2. 分层设计

#### **UI 层**
- **组件**：`ModelOverrideSelector.vue`
- **职责**：
  - 展示模型选择下拉框
  - 提供刷新按钮获取模型列表
  - 支持清除选择

#### **状态层**
- **位置**：`App.vue`
- **状态变量**：
  ```typescript
  const modelOverrideValue = ref<string | undefined>(undefined)      // 当前选中的模型 ID
  const modelOverrideOptions = ref<Array<{ label: string; value: string }>>([])  // 可用模型列表
  const isLoadingModelList = ref(false)  // 加载状态
  ```
- **方法**：
  ```typescript
  const handleRefreshModelOverrideList = async () => {
    // 调用 llmService.fetchModelList() 获取可用模型
  }
  ```

#### **业务逻辑层**
- **位置**：`usePromptOptimizer.ts`
- **修改**：
  ```typescript
  // 方法签名添加 modelOverride 参数
  handleOptimizePrompt: async (modelOverride?: string) => {}
  handleOptimizePromptWithContext: async (advancedContext, modelOverride?: string) => {}
  ```
- **处理**：将 `modelOverride` 传递到 `OptimizationRequest` 中

#### **服务层**
- **位置**：`prompt/types.ts`
- **类型定义**：
  ```typescript
  export interface OptimizationRequest {
    // ... 其他字段
    modelOverride?: string;  // 🆕 模型覆盖：指定具体的模型ID
  }
  ```

#### **API 调用层**
- **已有支持**：`LLMService.fetchModelList(provider, customConfig)`
- **功能**：通过 Provider Adapter 的 `getModelsAsync()` 方法动态获取可用模型

---

## 实现细节

### 1. ModelOverrideSelector 组件

**文件**：`packages/ui/src/components/ModelOverrideSelector.vue`

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { NSelect, NButton, NSpace, NTooltip, NIcon } from 'naive-ui'

interface ModelOption {
  label: string
  value: string
}

const props = defineProps<{
  modelValue?: string
  options?: ModelOption[]
  loading?: boolean
  disabled?: boolean
  placeholder?: string
  size?: 'small' | 'medium' | 'large'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
  'refresh': []
}>()

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>

<template>
  <NSpace :size="8" align="center" :wrap="false">
    <NSelect
      v-model:value="internalValue"
      :options="options || []"
      :placeholder="placeholder"
      :size="size"
      :disabled="disabled"
      :loading="loading"
      filterable
      clearable
    />
    <NTooltip>
      <template #trigger>
        <NButton
          :size="size"
          :disabled="disabled"
          :loading="loading"
          @click="emit('refresh')"
          quaternary
          circle
        >
          <!-- 刷新图标 -->
        </NButton>
      </template>
      <span>获取可用模型列表</span>
    </NTooltip>
  </NSpace>
</template>
```

**设计要点**：
1. **受控组件**：使用 v-model 双向绑定
2. **状态管理**：loading 和 disabled 状态外部控制
3. **交互反馈**：Tooltip 提示、清除按钮
4. **样式一致**：使用 Naive UI 组件，保持风格统一

### 2. InputPanel 布局集成

**文件**：`packages/ui/src/components/InputPanel.vue`

**修改点**：
```vue
<!-- 在模型选择器和模板选择器之间插入 -->
<div v-if="modelOverrideLabel" class="inline-select-item">
  <NText :depth="3" style="font-size: 13px; margin-right: 8px;">
    {{ modelOverrideLabel }}:
  </NText>
  <div style="min-width: 220px;">
    <slot name="model-override-select"></slot>
  </div>
</div>
```

**Props 新增**：
```typescript
interface Props {
  // ... 其他 props
  modelOverrideLabel?: string;  // 🆕 模型覆盖选择标签
}
```

**布局顺序**：
```
[优化模型] → [模型切换] → [优化提示词] → [优化按钮]
```

### 3. App.vue 状态管理

**文件**：`packages/web/src/App.vue`

#### 状态定义
```typescript
// 模型覆盖选择器状态
const modelOverrideValue = ref<string | undefined>(undefined);
const modelOverrideOptions = ref<Array<{ label: string; value: string }>>([]);
const isLoadingModelList = ref(false);
```

#### 获取模型列表方法
```typescript
const handleRefreshModelOverrideList = async () => {
  if (!services.value?.llmService || !modelManager.selectedOptimizeModel) {
    toast.error(t('toast.error.noModelSelected'));
    return;
  }

  try {
    isLoadingModelList.value = true;
    const provider = modelManager.selectedOptimizeModel;
    const models = await services.value.llmService.fetchModelList(provider);
    modelOverrideOptions.value = models;
    
    if (models.length > 0) {
      toast.success(t('toast.success.modelListFetched', { count: models.length }));
    } else {
      toast.warning(t('toast.warning.noModelsAvailable'));
    }
  } catch (error: any) {
    console.error('[App] Failed to fetch model list:', error);
    toast.error(t('toast.error.fetchModelListFailed') + ': ' + error.message);
    modelOverrideOptions.value = [];
  } finally {
    isLoadingModelList.value = false;
  }
};
```

#### 组件集成
```vue
<template #model-override-select>
  <ModelOverrideSelector
    v-model="modelOverrideValue"
    :options="modelOverrideOptions"
    :loading="isLoadingModelList"
    :disabled="optimizer.isOptimizing"
    :placeholder="t('promptOptimizer.modelOverridePlaceholder')"
    size="medium"
    @refresh="handleRefreshModelOverrideList"
  />
</template>
```

#### 优化调用修改
```typescript
const handleOptimizePrompt = () => {
  if (advancedModeEnabled.value) {
    // 传递 modelOverride
    optimizer.handleOptimizePromptWithContext(advancedContext, modelOverrideValue.value);
  } else {
    // 传递 modelOverride
    optimizer.handleOptimizePrompt(modelOverrideValue.value);
  }
};
```

### 4. usePromptOptimizer Composable

**文件**：`packages/ui/src/composables/prompt/usePromptOptimizer.ts`

#### 方法签名修改
```typescript
// 方法定义
handleOptimizePrompt: async (modelOverride?: string) => {}
handleOptimizePromptWithContext: async (advancedContext, modelOverride?: string) => {}
```

#### 请求构建
```typescript
state.handleOptimizePrompt = async (modelOverride?: string) => {
  // ... 验证逻辑
  
  const request: OptimizationRequest = {
    optimizationMode: optimizationMode.value,
    targetPrompt: state.prompt,
    templateId: currentTemplate.id,
    modelKey: optimizeModel.value,
    modelOverride: modelOverride,  // 🆕 传递模型覆盖参数
    contextMode: contextMode?.value
  }
  
  await promptService.value!.optimizePromptStream(request, {
    // ... 回调处理
  })
}
```

### 5. 类型定义扩展

**文件**：`packages/core/src/services/prompt/types.ts`

```typescript
export interface OptimizationRequest {
  optimizationMode: OptimizationMode;
  targetPrompt: string;
  templateId?: string;
  modelKey: string;
  modelOverride?: string;  // 🆕 模型覆盖：指定具体的模型ID
  contextMode?: import("../context/types").ContextMode;
  advancedContext?: {
    variables?: Record<string, string>;
    messages?: ConversationMessage[];
    tools?: ToolDefinition[];
  };
}
```

**设计说明**：
- `modelKey`：指定使用哪个模型配置（如 "openai"、"claude"）
- `modelOverride`：可选参数，指定具体的模型 ID（如 "gpt-4"、"gpt-3.5-turbo"）
- **优先级**：`modelOverride` > `modelConfig.modelMeta.id`

### 6. 国际化支持

**文件**：`packages/ui/src/i18n/locales/zh-CN.ts`

```typescript
promptOptimizer: {
  optimizeModel: "优化模型",
  modelOverride: "模型切换",
  modelOverridePlaceholder: "选择具体模型（可选）",
  // ...
},
toast: {
  error: {
    noModelSelected: "请先选择优化模型",
    fetchModelListFailed: "获取模型列表失败",
  },
  success: {
    modelListFetched: "成功获取 {count} 个可用模型",
  },
  warn: {
    noModelsAvailable: "没有可用的模型",
  },
}
```

---

## 技术实现原理

### 1. 动态模型获取

**核心机制**：通过 Provider Adapter 的 `getModelsAsync()` 方法

```typescript
// OpenAI Adapter 示例
public async getModelsAsync(config: TextModelConfig): Promise<TextModel[]> {
  const openai = this.createOpenAIInstance(config, false);
  
  try {
    const response = await openai.models.list();
    
    if (response && response.data && Array.isArray(response.data)) {
      return response.data
        .map((model) => this.buildDefaultModel(model.id))
        .sort((a, b) => a.id.localeCompare(b.id));
    }
    
    throw new Error('INVALID_RESPONSE: Unexpected API response format');
  } catch (error: any) {
    // 错误处理
  }
}
```

**支持的 Provider**：
- ✅ OpenAI (supportsDynamicModels: true)
- ✅ DeepSeek (supportsDynamicModels: true，OpenAI 兼容)
- ✅ SiliconFlow (supportsDynamicModels: true，OpenAI 兼容)
- ❌ Gemini (supportsDynamicModels: false，使用静态模型列表)
- ❌ Anthropic (supportsDynamicModels: false，使用静态模型列表)

### 2. 模型覆盖机制

**当前实现方案**：

由于时间限制，目前采用**类型传递**方案：
1. `modelOverride` 参数从 UI 层传递到 Service 层
2. 在 `OptimizationRequest` 中携带 `modelOverride` 字段
3. PromptService 接收到请求后，理论上应在调用 LLM 时使用该值

**未来优化方向**：

需要在 LLM Service 或 Adapter 层实现实际的模型 ID 覆盖逻辑：

```typescript
// 方案 A：在 LLM Service 层处理
async sendMessage(messages: Message[], provider: string, modelOverride?: string) {
  const modelConfig = await this.modelManager.getModel(provider);
  
  // 如果提供了 modelOverride，临时覆盖 modelMeta.id
  const effectiveConfig = modelOverride ? {
    ...modelConfig,
    modelMeta: {
      ...modelConfig.modelMeta,
      id: modelOverride
    }
  } : modelConfig;
  
  // 使用覆盖后的配置调用 API
}

// 方案 B：在 Adapter 层处理
// 每个 Adapter 的 sendMessage 方法接收 modelOverride 参数
// 在构建 API 请求时使用 modelOverride 覆盖默认 model
```

### 3. 状态管理策略

**设计原则**：
1. **局部状态**：`modelOverrideValue` 只在当前会话有效，不持久化
2. **依赖关系**：模型列表依赖于当前选中的优化模型
3. **清空策略**：切换优化模型时，可考虑自动清空 `modelOverrideValue`
4. **加载状态**：提供 loading 反馈，提升用户体验

**状态生命周期**：
```
用户选择优化模型
   ↓
点击刷新按钮
   ↓
isLoadingModelList = true
   ↓
调用 fetchModelList
   ↓
更新 modelOverrideOptions
   ↓
isLoadingModelList = false
   ↓
用户从下拉框选择具体模型
   ↓
modelOverrideValue 更新
   ↓
点击优化按钮
   ↓
传递 modelOverride 到后端
```

---

## 用户交互流程

### 标准流程

```
1. 用户选择"优化模型" → 例如选择 "OpenAI"
   ↓
2. 点击"模型切换"旁的刷新按钮 🔄
   ↓
3. 系统调用 OpenAI API: GET /v1/models
   ↓
4. 返回可用模型列表: [gpt-4, gpt-3.5-turbo, ...]
   ↓
5. 下拉框显示可选模型
   ↓
6. 用户选择具体模型（可选） → 例如选择 "gpt-4"
   ↓
7. 输入提示词，点击"开始优化"
   ↓
8. 系统使用 gpt-4 模型进行优化（而非配置中的默认模型）
```

### 可选流程

```
场景 1：不选择具体模型
- 用户直接使用配置中的默认模型
- modelOverride 为 undefined
- 系统使用 modelConfig.modelMeta.id

场景 2：清除已选择的模型
- 用户点击下拉框的清除按钮
- modelOverride 恢复为 undefined
- 后续优化使用默认模型

场景 3：切换优化模型
- 用户切换到另一个优化模型（如从 OpenAI 切换到 Claude）
- 建议自动清空 modelOverrideValue（未来优化）
```

---

## 错误处理

### 1. API 调用失败

```typescript
catch (error: any) {
  console.error('[App] Failed to fetch model list:', error);
  toast.error(t('toast.error.fetchModelListFailed') + ': ' + error.message);
  modelOverrideOptions.value = [];  // 清空列表
}
```

**常见错误**：
- 网络错误：`CONNECTION_FAILED`
- 跨域错误：`CROSS_ORIGIN_CONNECTION_FAILED`
- API 错误：`API_ERROR`
- 认证失败：`AUTHENTICATION_FAILED`

### 2. 空列表处理

```typescript
if (models.length > 0) {
  toast.success(t('toast.success.modelListFetched', { count: models.length }));
} else {
  toast.warning(t('toast.warning.noModelsAvailable'));
}
```

### 3. 未选择优化模型

```typescript
if (!services.value?.llmService || !modelManager.selectedOptimizeModel) {
  toast.error(t('toast.error.noModelSelected'));
  return;
}
```

---

## 未来优化建议

### 1. 模型覆盖的实际实现

**当前状态**：类型已定义，但 LLM Service 尚未实际使用 `modelOverride`

**建议实现**：
```typescript
// 在 LLMService.sendMessageStructured 中
async sendMessageStructured(
  messages: Message[], 
  provider: string,
  modelOverride?: string  // 🆕 新增参数
): Promise<LLMResponse> {
  const modelConfig = await this.modelManager.getModel(provider);
  
  // 如果提供了 modelOverride，创建临时配置
  const effectiveConfig = modelOverride ? {
    ...modelConfig,
    modelMeta: {
      ...modelConfig.modelMeta,
      id: modelOverride  // 覆盖模型 ID
    }
  } : modelConfig;
  
  const adapter = this.registry.getAdapter(effectiveConfig.providerMeta.id);
  return await adapter.sendMessage(messages, effectiveConfig);
}
```

### 2. 自动清空逻辑

**场景**：当用户切换优化模型时，自动清空 `modelOverrideValue`

```typescript
watch(() => modelManager.selectedOptimizeModel, () => {
  modelOverrideValue.value = undefined;
  modelOverrideOptions.value = [];
});
```

### 3. 缓存机制

**优化**：缓存已获取的模型列表，避免重复请求

```typescript
const modelListCache = ref<Map<string, ModelOption[]>>(new Map());

const handleRefreshModelOverrideList = async (forceRefresh = false) => {
  const cacheKey = modelManager.selectedOptimizeModel;
  
  // 检查缓存
  if (!forceRefresh && modelListCache.value.has(cacheKey)) {
    modelOverrideOptions.value = modelListCache.value.get(cacheKey)!;
    return;
  }
  
  // 获取并缓存
  const models = await services.value.llmService.fetchModelList(provider);
  modelListCache.value.set(cacheKey, models);
  modelOverrideOptions.value = models;
};
```

### 4. 模型信息展示

**增强**：显示模型的详细信息（上下文长度、支持的功能等）

```vue
<NSelect
  :render-label="renderLabel"
  :render-tag="renderTag"
/>

<script>
const renderLabel = (option) => {
  return h('div', [
    h('div', option.label),
    h('div', { style: 'font-size: 12px; color: #999;' }, 
      `Context: ${option.maxContextLength || 'N/A'}`)
  ])
}
</script>
```

### 5. 静态模型支持

**场景**：对于不支持动态获取的 Provider（如 Gemini、Anthropic）

```typescript
const handleRefreshModelOverrideList = async () => {
  const provider = modelManager.selectedOptimizeModel;
  const adapter = registry.getAdapter(provider);
  
  if (!adapter.getProvider().supportsDynamicModels) {
    // 使用静态模型列表
    const staticModels = adapter.getModels();
    modelOverrideOptions.value = staticModels.map(m => ({
      label: m.name,
      value: m.id
    }));
  } else {
    // 动态获取
    const models = await llmService.fetchModelList(provider);
    modelOverrideOptions.value = models;
  }
};
```

---

## 测试建议

### 1. 单元测试

```typescript
describe('ModelOverrideSelector', () => {
  it('should emit refresh event when button clicked', () => {
    // 测试刷新按钮事件
  });
  
  it('should update modelValue when selection changed', () => {
    // 测试选择变化
  });
  
  it('should clear selection when clear button clicked', () => {
    // 测试清除功能
  });
});
```

### 2. 集成测试

```typescript
describe('Model Override Flow', () => {
  it('should fetch models when refresh clicked', async () => {
    // 测试获取模型列表
  });
  
  it('should pass modelOverride to optimization request', async () => {
    // 测试参数传递
  });
  
  it('should handle API errors gracefully', async () => {
    // 测试错误处理
  });
});
```

### 3. E2E 测试

```typescript
test('User can select override model and optimize prompt', async ({ page }) => {
  // 1. 选择优化模型
  await page.selectOption('[data-testid="optimize-model-select"]', 'openai');
  
  // 2. 点击刷新按钮
  await page.click('[data-testid="model-override-refresh"]');
  await page.waitForSelector('[data-testid="model-override-select"]');
  
  // 3. 选择具体模型
  await page.selectOption('[data-testid="model-override-select"]', 'gpt-4');
  
  // 4. 输入提示词并优化
  await page.fill('[data-testid="prompt-input"]', 'Test prompt');
  await page.click('[data-testid="optimize-button"]');
  
  // 5. 验证结果
  await expect(page.locator('[data-testid="optimized-prompt"]')).toBeVisible();
});
```

---

## 总结

### 设计亮点

1. **非侵入式**：不修改现有模型配置，通过可选覆盖实现
2. **渐进增强**：用户可以不使用此功能，不影响现有流程
3. **类型安全**：完整的 TypeScript 类型定义
4. **用户友好**：清晰的 UI、即时反馈、错误提示
5. **可扩展**：为未来的功能增强预留空间

### 技术债务

1. **LLM Service 实现**：`modelOverride` 参数尚未在 LLM Service 层实际使用
2. **状态持久化**：考虑是否需要记住用户的模型选择
3. **缓存策略**：避免重复请求相同的模型列表
4. **静态模型支持**：需要为不支持动态获取的 Provider 提供回退方案

### 实现优先级

**P0 - 已完成**：
- ✅ UI 组件实现
- ✅ 状态管理
- ✅ 类型定义
- ✅ 数据流打通
- ✅ 国际化支持

**P1 - 待实现**：
- ⏳ LLM Service 实际使用 modelOverride
- ⏳ Adapter 层模型 ID 覆盖逻辑

**P2 - 优化方向**：
- 📋 自动清空逻辑
- 📋 模型列表缓存
- 📋 静态模型支持
- 📋 模型详细信息展示

---

## 参考资料

- [OpenAI Models API](https://platform.openai.com/docs/api-reference/models)
- [Naive UI Select Component](https://www.naiveui.com/en-US/os-theme/components/select)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [项目 CLAUDE.md](../../CLAUDE.md)

---

**文档版本**：v1.0.0  
**最后更新**：2025-01-11  
**作者**：AI Assistant  
**状态**：功能已实现，待后端集成
