<template>
  <NCard
    :bordered="false"
    class="output-display-core"
    content-style="padding: 12px; height: 100%; max-height: 100%; display: flex; flex-direction: column; overflow: hidden;"
  >
    <NFlex vertical :size="12" style="height: 100%; min-height: 0; overflow: hidden;">
      <!-- 统一顶层工具栏 -->
      <NFlex v-if="hasToolbar" justify="space-between" align="center" style="flex-shrink: 0;">
        <!-- 左侧：视图控制按钮组 -->
        <NButtonGroup>
          <NButton 
            @click="internalViewMode = 'render'"
            size="small"
            :type="internalViewMode === 'render' ? 'primary' : 'default'"
          >
            {{ t('common.render') }}
          </NButton>
          <NButton 
            @click="internalViewMode = 'source'"
            size="small"
            :type="internalViewMode === 'source' ? 'primary' : 'default'"
          >
            {{ t('common.source') }}
          </NButton>
          <NButton 
            v-if="isActionEnabled('diff') && originalContent"
            @click="internalViewMode = 'diff'"
            :disabled="!originalContent"
            size="small"
            :type="internalViewMode === 'diff' ? 'primary' : 'default'"
          >
            {{ t('common.compare') }}
          </NButton>
        </NButtonGroup>
        
        <!-- 右侧：操作按钮 -->
        <NButtonGroup>
          <NButton
            v-if="isActionEnabled('favorite')"
            @click="handleFavorite"
            size="small"
            quaternary
            circle
          >
            <template #icon>
              <NIcon>
                <Star />
              </NIcon>
            </template>
          </NButton>
          <NButton
            v-if="isActionEnabled('copy')"
            @click="handleCopy('content')"
            size="small"
            quaternary
            circle
          >
            <template #icon>
              <NIcon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.03 1.125 0 1.13.094 1.976 1.057 1.976 2.192V7.5M8.25 7.5h7.5M8.25 7.5h-1.5a1.5 1.5 0 00-1.5 1.5v11.25c0 .828.672 1.5 1.5 1.5h10.5a1.5 1.5 0 001.5-1.5V9a1.5 1.5 0 00-1.5-1.5h-1.5" />
                </svg>
              </NIcon>
            </template>
          </NButton>
          <NButton
            v-if="isActionEnabled('fullscreen')"
            @click="handleFullscreen"
            size="small"
            quaternary
            circle
          >
            <template #icon>
              <NIcon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </NIcon>
            </template>
          </NButton>
        </NButtonGroup>
      </NFlex>

      <!-- 推理内容区域 -->
      <div v-if="shouldShowReasoning" style="flex-shrink: 0;">
        <NCollapse v-model:expanded-names="reasoningExpandedNames">
          <NCollapseItem name="reasoning">
            <template #header>
              <NFlex justify="space-between" align="center" style="width: 100%;">
                <NText class="text-sm font-medium">
                  {{ t('common.reasoning') }}
                </NText>
                <NFlex v-if="isReasoningStreaming" align="center" :size="4">
                  <NSpin :size="12" />
                  <NText class="text-xs">{{ t('common.generating') }}</NText>
                </NFlex>
              </NFlex>
            </template>
            
            <NScrollbar class="reasoning-content" ref="reasoningContentRef" style="max-height: clamp(160px, 28vh, 360px);">
              <MarkdownRenderer
                v-if="displayReasoning"
                :content="displayReasoning"
                :streaming="streaming"
                :disableInternalScroll="true"
                class="prose-sm max-w-none px-3 py-2"
              />
              <NSpace v-else-if="streaming" class="text-gray-500 text-sm italic px-3 py-2">
                <NText>{{ t('common.generatingReasoning') }}</NText>
              </NSpace>
            </NScrollbar>
          </NCollapseItem>
        </NCollapse>
      </div>
      
      <!-- 主要内容区域 -->
      <div style="flex: 1; min-height: 0; overflow: hidden; display: flex; flex-direction: column;">
        <!-- 对比模式 -->
        <TextDiffUI v-if="internalViewMode === 'diff' && content && originalContent"
          :originalText="originalContent"
          :optimizedText="content"
          :compareResult="compareResult"
          style="height: 100%; min-height: 0;"
        />

        <!-- 原文模式 -->
        <template v-else-if="internalViewMode === 'source'">
          <!-- 🆕 Pro 模式：使用变量感知输入框 -->
          <VariableAwareInput
            v-if="shouldEnableVariables && variableData"
            :model-value="content"
            @update:model-value="handleSourceInput"
            :readonly="mode !== 'editable' || streaming"
            :placeholder="placeholder"
            :autosize="{ minRows: 10, maxRows: 20 }"
            v-bind="variableData"
            @variable-extracted="handleVariableExtracted"
            @add-missing-variable="handleAddMissingVariable"
            style="height: 100%; min-height: 0;"
          />

          <!-- Basic/Image 模式：使用普通输入框 -->
          <NInput
            v-else
            :value="content"
            @input="handleSourceInput"
            :readonly="mode !== 'editable' || streaming"
            type="textarea"
            :placeholder="placeholder"
            :autosize="{ minRows: 10 }"
            style="height: 100%; min-height: 0;"
          />
        </template>

        <!-- 渲染模式（默认） -->
        <div v-else style="height: 100%; min-height: 0; overflow: hidden; display: flex; flex-direction: column;">
          <MarkdownRenderer
            v-if="displayContent"
            :content="displayContent"
            :streaming="streaming"
            style="flex: 1; min-height: 0; overflow: auto;"
          />
          <div v-else-if="!loading && !streaming" style="flex: 1; min-height: 0; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px;">
            <img :src="waitingIcon" alt="waiting" style="width: auto; height: 120px; max-width: 200px; opacity: 0.85; object-fit: contain;" />
            <NText style="font-size: 14px; color: var(--n-text-color-3, #999);">
              {{ placeholder || t('common.noContent') }}
            </NText>
          </div>
          <NText v-else style="padding: 12px;">{{ placeholder || t('common.loading') }}</NText>
        </div>
      </div>
  
    </NFlex>
  </NCard>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, inject, type Ref } from 'vue'

import { useI18n } from 'vue-i18n'
import {
  NCard, NButton, NButtonGroup, NIcon, NCollapse, NCollapseItem,
  NInput, NEmpty, NSpin, NScrollbar, NFlex, NText, NSpace
} from 'naive-ui'
import { useToast } from '../composables/ui/useToast'
import { Star } from '@vicons/tabler'
import { useClipboard } from '../composables/ui/useClipboard'
import MarkdownRenderer from './MarkdownRenderer.vue'
import TextDiffUI from './TextDiff.vue'
import type { CompareResult } from '@prompt-optimizer/core'
import { VariableAwareInput } from './variable-extraction'
import { useFunctionMode } from '../composables/mode/useFunctionMode'
import { useTemporaryVariables } from '../composables/variable/useTemporaryVariables'
import { useVariableManager } from '../composables/prompt/useVariableManager'
import type { AppServices } from '../types/services'
import { platform } from '../utils/platform'
import waitingIcon from '../assets/waiting.png'

type ActionName = 'fullscreen' | 'diff' | 'copy' | 'edit' | 'reasoning' | 'favorite'

const { t } = useI18n()
const { copyText } = useClipboard()

const message = useToast()

// 🆕 注入 services（用于变量管理）
const services = inject<Ref<AppServices | null>>('services', ref(null))

// 移除收藏状态管理(改由父组件处理)

// 组件 Props
interface Props {
  // 内容相关
  content?: string
  originalContent?: string
  reasoning?: string
  
  // 显示模式
  mode: 'readonly' | 'editable'
  reasoningMode?: 'show' | 'hide' | 'auto'
  
  // 功能开关
  enabledActions?: ActionName[]
  
  // 样式配置
  height?: string | number
  placeholder?: string
  
  // 状态
  loading?: boolean
  streaming?: boolean
  
  // 服务
  compareService: ICompareService
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  originalContent: '',
  reasoning: '',
  mode: 'readonly',
  reasoningMode: 'auto',
  enabledActions: () => ['fullscreen', 'diff', 'copy', 'edit', 'reasoning', 'favorite'],
  height: '100%',
  placeholder: ''
})

// 事件定义
const emit = defineEmits<{
  'update:content': [content: string]
  'update:reasoning': [reasoning: string]
  'copy': [content: string, type: 'content' | 'reasoning' | 'all']
  'fullscreen': []
  'edit-start': []
  'edit-end': []
  'reasoning-toggle': [expanded: boolean]
  'view-change': [mode: 'base' | 'diff']
  'save-favorite': [data: { content: string; originalContent?: string }]
}>()

// 🆕 变量管理功能（仅 Pro 模式）
// ==================== 功能模式判断 ====================
// ✅ 无条件调用，使用全局单例的 functionMode
// ⚠️ 不主动初始化，避免在 services 未就绪时污染全局单例
const { functionMode } = useFunctionMode(services)

// 判断是否启用变量功能（仅 Pro 模式）
const shouldEnableVariables = computed(() => functionMode.value === 'pro')

// ==================== 变量管理 Composables ====================
// 临时变量管理器（全局单例）
const tempVars = useTemporaryVariables()

// ✅ 无条件调用，composable 内部会等待 services.preferenceService 准备就绪
const globalVarsManager = useVariableManager(services)

// ==================== 变量数据计算 ====================
/**
 * 计算纯预定义变量
 * allVariables = 预定义变量 + 自定义全局变量
 * 因此：预定义变量 = allVariables - customVariables
 */
const purePredefinedVariables = computed(() => {
  const all = globalVarsManager.allVariables.value || {}
  const custom = globalVarsManager.customVariables.value || {}

  const predefined: Record<string, string> = {}
  for (const [key, value] of Object.entries(all)) {
    // 只保留不在 customVariables 中的变量
    if (!(key in custom)) {
      predefined[key] = value
    }
  }

  return predefined
})

const variableData = computed(() => {
  // 只在 Pro 模式下提供变量数据
  if (!shouldEnableVariables.value) return null

  // 🔒 如果全局变量管理器未就绪，返回 null 以禁用变量功能
  // 这样可以避免文本被替换但变量未保存的不一致状态
  if (!globalVarsManager.isReady.value) return null

  return {
    existingGlobalVariables: Object.keys(globalVarsManager.customVariables.value || {}),
    existingTemporaryVariables: Object.keys(tempVars.temporaryVariables.value || {}),
    predefinedVariables: Object.keys(purePredefinedVariables.value),
    globalVariableValues: globalVarsManager.customVariables.value || {},
    temporaryVariableValues: tempVars.temporaryVariables.value || {},
    predefinedVariableValues: purePredefinedVariables.value
  }
})

// ==================== 变量事件处理 ====================
/**
 * 处理变量提取事件
 * 在 Pro 模式的原文编辑模式下，用户选中文本提取变量时触发
 *
 * ⚠️ 注意：此函数只会在 variableData 不为 null 时被调用
 * （即管理器已就绪且为 Pro 模式），因此不需要额外检查
 *
 * ⚠️ 数据一致性问题：
 * VariableAwareInput 在触发此事件前已完成文本替换（{{varName}}）
 * 如果保存失败，文本已被修改但变量未保存，需提示用户撤销操作
 */
const handleVariableExtracted = (data: {
  variableName: string
  variableValue: string
  variableType: 'global' | 'temporary'
}) => {
  if (data.variableType === 'global') {
    try {
      // 保存到全局变量
      globalVarsManager.addVariable(data.variableName, data.variableValue)
      message.success(
        t('variableExtraction.savedToGlobal', { name: data.variableName })
      )
    } catch (error) {
      console.error('[OutputDisplayCore] Failed to save global variable:', error)
      // ⚠️ 保存失败但文本已被替换，提示用户需要撤销
      message.error(
        t('variableExtraction.saveFailedWithUndo', {
          name: data.variableName,
          undo: platform.getUndoKey()
        }),
        {
          duration: 8000, // 延长显示时间，确保用户看到
          closable: true
        }
      )
    }
  } else {
    // 保存到临时变量（临时变量管理器是全局单例，始终可用）
    try {
      tempVars.setVariable(data.variableName, data.variableValue)
      message.success(
        t('variableExtraction.savedToTemporary', { name: data.variableName })
      )
    } catch (error) {
      console.error('[OutputDisplayCore] Failed to save temporary variable:', error)
      // 临时变量保存失败的可能性极低，但仍需处理
      message.error(
        t('variableExtraction.saveFailedWithUndo', {
          name: data.variableName,
          undo: platform.getUndoKey()
        }),
        {
          duration: 8000,
          closable: true
        }
      )
    }
  }
}

/**
 * 处理添加缺失变量事件
 * 当用户悬停在缺失变量上并点击快速添加时触发
 */
const handleAddMissingVariable = (varName: string) => {
  tempVars.setVariable(varName, '')
  message.success(
    t('variableDetection.addSuccess', { name: varName })
  )
}

// 内部状态
const reasoningContentRef = ref<HTMLDivElement | null>(null)
const userHasManuallyToggledReasoning = ref(false)

// 新的视图状态机
const internalViewMode = ref<'render' | 'source' | 'diff'>('render')
const compareResult = ref<CompareResult | undefined>()

// 推理折叠面板状态
const reasoningExpandedNames = ref<string[]>([])

const isActionEnabled = (action: ActionName) => props.enabledActions.includes(action)

const hasToolbar = computed(() =>
  ['diff', 'copy', 'fullscreen', 'edit'].some(action => isActionEnabled(action as ActionName))
)

// 计算属性
const displayContent = computed(() => (props.content || '').trim())
const displayReasoning = computed(() => (props.reasoning || '').trim())

const hasContent = computed(() => !!displayContent.value)
const hasReasoning = computed(() => !!displayReasoning.value)

const isReasoningStreaming = computed(() => {
  return props.streaming && hasReasoning.value && !hasContent.value
})

const shouldShowReasoning = computed(() => {
  if (!isActionEnabled('reasoning')) return false
  if (props.reasoningMode === 'hide') return false
  if (props.reasoningMode === 'show') return true
  return hasReasoning.value
})

// 推理展开/折叠状态的计算属性
const isReasoningExpanded = computed({
  get: () => reasoningExpandedNames.value.includes('reasoning'),
  set: (expanded: boolean) => {
    if (expanded) {
      reasoningExpandedNames.value = ['reasoning']
    } else {
      reasoningExpandedNames.value = []
    }
    emit('reasoning-toggle', expanded)
  }
})

// 处理原文模式输入
const handleSourceInput = (value: string) => {
  emit('update:content', value)
}

// 复制功能
const handleCopy = (type: 'content' | 'reasoning' | 'all') => {
  let textToCopy = ''
  const emitType: 'content' | 'reasoning' | 'all' = type
  
  switch (type) {
    case 'content':
      textToCopy = displayContent.value
      break
    case 'reasoning':
      textToCopy = displayReasoning.value
      break
    case 'all':
      textToCopy = [
        displayReasoning.value && `推理过程：\n${displayReasoning.value}`,
        `主要内容：\n${displayContent.value}`
      ].filter(Boolean).join('\n\n')
      break
  }
  
  if (textToCopy) {
    copyText(textToCopy)
    emit('copy', textToCopy, emitType)
  }
}

// 全屏功能
const handleFullscreen = () => {
  emit('fullscreen')
}

const scrollReasoningToBottom = () => {
  if (reasoningContentRef.value) {
    nextTick(() => {
      if (reasoningContentRef.value) {
        // 使用 Naive UI NScrollbar 的正确 API
        const scrollContainer = reasoningContentRef.value.$el || reasoningContentRef.value
        if (scrollContainer && scrollContainer.scrollTo) {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: 'smooth'
          })
        } else if (reasoningContentRef.value.scrollTo) {
          // 直接调用 NScrollbar 实例的 scrollTo 方法
          reasoningContentRef.value.scrollTo({
            top: 999999,  // 滚动到底部
            behavior: 'smooth'
          })
        }
      }
    })
  }
}

// 对比功能
const updateCompareResult = async () => {
  if (internalViewMode.value === 'diff' && props.originalContent && props.content) {
    try {
      if (!props.compareService) {
        throw new Error('CompareService is required but not provided')
      }
      compareResult.value = await props.compareService.compareTexts(
        props.originalContent,
        props.content
      )
    } catch (error) {
      console.error('Error calculating diff:', error)
      throw error
    }
  } else {
    compareResult.value = undefined
  }
}

// 流式生成时的智能推理折叠逻辑
watch(() => props.streaming, (isStreaming, wasStreaming) => {
  if (isStreaming && !wasStreaming) {
    // 新任务开始，重置用户记忆
    userHasManuallyToggledReasoning.value = false
  } else if (!isStreaming && wasStreaming) {
    // 任务结束，如果用户未干预且思考区域仍然展开，自动折叠
    if (!userHasManuallyToggledReasoning.value && isReasoningExpanded.value) {
      isReasoningExpanded.value = false
    }
  }
})

watch(internalViewMode, updateCompareResult, { immediate: true })
watch(() => [props.content, props.originalContent], () => {
  if (internalViewMode.value === 'diff') {
    updateCompareResult()
  }
})

watch(() => props.reasoning, (newReasoning, oldReasoning) => {
  // 当推理内容从无到有，且用户未手动干预时，自动展开
  if (newReasoning && !oldReasoning && !userHasManuallyToggledReasoning.value) {
    isReasoningExpanded.value = true
  }
  
  // 如果思考过程已展开且有新内容，滚动到底部
  if (isReasoningExpanded.value && newReasoning) {
    scrollReasoningToBottom()
  }
}, { flush: 'post' })

watch(() => props.content, (newContent, oldContent) => {
  // 当主要内容开始流式输出时，如果用户未干预，自动折叠思考过程
  const mainContentJustStarted = newContent && !oldContent
  if (props.streaming && mainContentJustStarted && !userHasManuallyToggledReasoning.value) {
    isReasoningExpanded.value = false
  }
})

// 监听推理折叠状态变化
watch(reasoningExpandedNames, (newNames) => {
  const expanded = newNames.includes('reasoning')
  if (expanded !== isReasoningExpanded.value) {
    userHasManuallyToggledReasoning.value = true
  }
})

// 暴露方法给父组件
const resetReasoningState = (initialState: boolean) => {
  isReasoningExpanded.value = initialState
  userHasManuallyToggledReasoning.value = false
}

const forceExitEditing = () => {
  internalViewMode.value = 'render'
}

const forceRefreshContent = () => {
  // V2版本中这个方法不再需要，但保留以确保向后兼容
}

// 收藏相关方法 - 触发保存对话框而不是直接保存
const handleFavorite = () => {
  if (!props.content) {
    message.warning('没有内容可以收藏');
    return;
  }

  // 触发保存收藏事件,由父组件打开保存对话框
  emit('save-favorite', {
    content: props.content,
    originalContent: props.originalContent
  });
};

// 组件挂载时设置初始视图模式
onMounted(() => {
  // ⚠️ 不在此处初始化 functionMode
  // 原因：useFunctionMode 是全局单例，不应由单个组件控制初始化时机
  // - 如果 services 未就绪，初始化会失败但仍标记为已完成，导致永久卡在 'basic'
  // - 应该在应用级别统一初始化（如 App.vue）
  // - functionMode 有默认值 'basic'，可以正常工作

  // 所有模式都默认显示渲染模式
  internalViewMode.value = 'render';
});

// 注意：不再监听mode变化自动切换视图，让用户自己选择

defineExpose({ resetReasoningState, forceRefreshContent, forceExitEditing })
</script>

