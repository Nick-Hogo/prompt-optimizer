import { ref, nextTick, computed, reactive, type Ref } from 'vue'

import { useToast } from '../ui/useToast'
import { useI18n } from 'vue-i18n'
import { getErrorMessage } from '../../utils/error'

import { v4 as uuidv4 } from 'uuid'
import type {
  IModelManager,
  IHistoryManager,
  Template,
  PromptRecordChain,
  PromptRecordType,
  IPromptService,
  ITemplateManager,
  OptimizationMode,
  OptimizationRequest,
  ConversationMessage,
  ToolDefinition
} from '@prompt-optimizer/core'
import type { AppServices } from '../../types/services'
import { useFunctionMode, type FunctionMode } from '../mode'


type PromptChain = PromptRecordChain

interface AdvancedContextPayload {
  variables: Record<string, string>
  messages?: ConversationMessage[]
  tools?: ToolDefinition[]
}

/**
 * 提示词优化器Hook
 * @param services 服务实例引用
 * @param selectedOptimizationMode 优化模式
 * @param selectedOptimizeModel 优化模型选择
 * @param selectedTestModel 测试模型选择
 * @param contextMode 上下文模式（用于变量替换策略）
 * @returns 提示词优化器接口
 */
export function usePromptOptimizer(
  services: Ref<AppServices | null>,
  selectedOptimizationMode?: Ref<OptimizationMode>,    // 优化模式
  selectedOptimizeModel?: Ref<string>,                 // 优化模型选择
  selectedTestModel?: Ref<string>,                     // 测试模型选择
  contextMode?: Ref<import('@prompt-optimizer/core').ContextMode>  // 上下文模式
) {
  // 如果没有传入参数，抛出错误而不是使用默认值
  if (!selectedOptimizationMode) {
    throw new Error('selectedOptimizationMode is required for usePromptOptimizer')
  }
  const optimizationMode = selectedOptimizationMode
  const optimizeModel = selectedOptimizeModel || ref('')
  const testModel = selectedTestModel || ref('')
  const toast = useToast()
  const { t } = useI18n()
  
  // 服务引用
  const modelManager = computed(() => services.value?.modelManager)
  const templateManager = computed(() => services.value?.templateManager)
  const historyManager = computed(() => services.value?.historyManager)
  const promptService = computed(() => services.value?.promptService)
  const { functionMode } = useFunctionMode(services)
  
  // 使用 reactive 创建一个响应式状态对象，而不是单独的 ref
  const state = reactive({
    // 状态
    prompt: '',
    optimizedPrompt: '',
    optimizedReasoning: '', // 优化推理内容
    isOptimizing: false,
    isIterating: false,
    selectedOptimizeTemplate: null as Template | null,  // 系统提示词优化模板
    selectedUserOptimizeTemplate: null as Template | null,  // 用户提示词优化模板
    selectedIterateTemplate: null as Template | null,
    currentChainId: '',
    currentVersions: [] as PromptChain['versions'],
  currentVersionId: '',
  
  // 方法 (将在下面定义并绑定到 state)
  handleOptimizePrompt: async (_modelOverride?: string) => {},
  handleOptimizePromptWithContext: async (_advancedContext: AdvancedContextPayload, _modelOverride?: string) => {},
  handleIteratePrompt: async (payload: { originalPrompt: string, optimizedPrompt: string, iterateInput: string }) => {},
  handleSwitchVersion: async (version: PromptChain['versions'][number]) => {}
})
  
  // 注意：存储键现在由 useTemplateManager 统一管理
  
  // 优化提示词
  state.handleOptimizePrompt = async (modelOverride?: string) => {
    if (!state.prompt.trim() || state.isOptimizing) return

    // 根据优化模式选择对应的模板
    const currentTemplate = optimizationMode.value === 'system' 
      ? state.selectedOptimizeTemplate 
      : state.selectedUserOptimizeTemplate

    if (!currentTemplate) {
      toast.error(t('toast.error.noOptimizeTemplate'))
      return
    }

    if (!optimizeModel.value) {
      toast.error(t('toast.error.noOptimizeModel'))
      return
    }

    // 在开始优化前立即清空状态，确保没有竞态条件
    state.isOptimizing = true
    state.optimizedPrompt = ''  // 强制同步清空
    state.optimizedReasoning = '' // 强制同步清空
    
    // 等待一个微任务确保状态更新完成
    await nextTick()

    try {
      // 构建优化请求
      const request: OptimizationRequest = {
        optimizationMode: optimizationMode.value,
        targetPrompt: state.prompt,
        templateId: currentTemplate.id,
        modelKey: optimizeModel.value,
        modelOverride: modelOverride,  // 🆕 传递模型覆盖参数
        contextMode: contextMode?.value  // 传递上下文模式
      }

      // 使用重构后的优化API
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
            if (!currentTemplate) return

            try {
              // Create new record chain with enhanced metadata，ElectronProxy会自动处理序列化
              // 依据 functionMode 与当前模板类型决定历史记录类型
              const isPro = (functionMode.value as FunctionMode) === 'pro'
              const baseType = (optimizationMode.value === 'system' ? 'optimize' : 'userOptimize') as PromptRecordType
              const recordType = (() => {
                if (isPro) {
                  return (optimizationMode.value === 'system' ? 'contextSystemOptimize' : 'contextUserOptimize') as PromptRecordType
                }
                // 兼容：若选择的是 context 模板（即使当前模式非 pro），也记录为 context*
                const tplType = currentTemplate.metadata?.templateType
                if (tplType === 'contextSystemOptimize' || tplType === 'contextUserOptimize') return tplType as PromptRecordType
                return baseType
              })()

              const recordData = {
                id: uuidv4(),
                originalPrompt: state.prompt,
                optimizedPrompt: state.optimizedPrompt,
                type: recordType,
                modelKey: optimizeModel.value,
                templateId: currentTemplate.id,
                timestamp: Date.now(),
                metadata: {
                  optimizationMode: optimizationMode.value,
                  functionMode: functionMode.value
                }
              };

              const newRecord = await historyManager.value!.createNewChain(recordData);

              state.currentChainId = newRecord.chainId;
              state.currentVersions = newRecord.versions;
              state.currentVersionId = newRecord.currentRecord.id;

              toast.success(t('toast.success.optimizeSuccess'))
            } catch (error: unknown) {
              console.error('创建历史记录失败:', error)
              toast.error('创建历史记录失败: ' + getErrorMessage(error))
            } finally {
              state.isOptimizing = false
            }
          },
          onError: (error: Error) => {
            console.error(t('toast.error.optimizeProcessFailed'), error)
            toast.error(error.message || t('toast.error.optimizeFailed'))
            state.isOptimizing = false
          }
        }
      )
    } catch (error: unknown) {
      console.error(t('toast.error.optimizeFailed'), error)
      toast.error(getErrorMessage(error) || t('toast.error.optimizeFailed'))
    } finally {
      state.isOptimizing = false
    }
  }
  
  // 带上下文的优化提示词
  state.handleOptimizePromptWithContext = async (advancedContext: AdvancedContextPayload, modelOverride?: string) => {
    if (!state.prompt.trim() || state.isOptimizing) return

    // 根据优化模式选择对应的模板
    const currentTemplate = optimizationMode.value === 'system' 
      ? state.selectedOptimizeTemplate 
      : state.selectedUserOptimizeTemplate

    if (!currentTemplate) {
      toast.error(t('toast.error.noOptimizeTemplate'))
      return
    }

    if (!optimizeModel.value) {
      toast.error(t('toast.error.noOptimizeModel'))
      return
    }

    // 在开始优化前立即清空状态，确保没有竞态条件
    state.isOptimizing = true
    state.optimizedPrompt = ''  // 强制同步清空
    state.optimizedReasoning = '' // 强制同步清空
    
    // 等待一个微任务确保状态更新完成
    await nextTick()

    try {
      // 构建带有高级上下文的优化请求
      const request: OptimizationRequest = {
        optimizationMode: optimizationMode.value,
        targetPrompt: state.prompt,
        templateId: currentTemplate.id,
        modelKey: optimizeModel.value,
        modelOverride: modelOverride,  // 🆕 传递模型覆盖参数
        contextMode: contextMode?.value,  // 传递上下文模式
        // 关键：添加高级上下文
        advancedContext: {
          variables: advancedContext.variables,
          messages: advancedContext.messages,
          tools: advancedContext.tools  // 🆕 添加工具传递
        }
      }

      console.log('[usePromptOptimizer] Starting optimization with advanced context:', request.advancedContext)

      // 使用重构后的优化API
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
            if (!currentTemplate) return

            // 创建历史记录 - 包含上下文信息
            try {
              const isPro = (functionMode.value as FunctionMode) === 'pro'
              const baseType = (optimizationMode.value === 'system' ? 'optimize' : 'userOptimize') as PromptRecordType
              const recordType = (() => {
                if (isPro) return (optimizationMode.value === 'system' ? 'contextSystemOptimize' : 'contextUserOptimize') as PromptRecordType
                const tplType = currentTemplate.metadata?.templateType
                if (tplType === 'contextSystemOptimize' || tplType === 'contextUserOptimize') return tplType as PromptRecordType
                return baseType
              })()

              const recordData = {
                id: uuidv4(),
                originalPrompt: state.prompt,
                optimizedPrompt: state.optimizedPrompt,
                type: recordType,
                modelKey: optimizeModel.value,
                templateId: currentTemplate.id,
                timestamp: Date.now(),
                // 添加上下文信息到历史记录
                metadata: {
                  optimizationMode: optimizationMode.value,
                  functionMode: functionMode.value,
                  hasAdvancedContext: true,
                  variableCount: Object.keys(advancedContext.variables).length,
                  messageCount: advancedContext.messages?.length || 0
                }
              };

              const newRecord = await historyManager.value!.createNewChain(recordData);

              state.currentChainId = newRecord.chainId;
              state.currentVersions = newRecord.versions;
              state.currentVersionId = newRecord.currentRecord.id;

              toast.success(t('toast.success.optimizeSuccess'))
            } catch (error: unknown) {
              console.error('创建历史记录失败:', error)
              toast.error('创建历史记录失败: ' + getErrorMessage(error))
            } finally {
              state.isOptimizing = false
            }
          },
          onError: (error: Error) => {
            console.error(t('toast.error.optimizeProcessFailed'), error)
            toast.error(error.message || t('toast.error.optimizeFailed'))
            state.isOptimizing = false
          }
        }
      )
    } catch (error: unknown) {
      console.error(t('toast.error.optimizeFailed'), error)
      toast.error(getErrorMessage(error) || t('toast.error.optimizeFailed'))
    } finally {
      state.isOptimizing = false
    }
  }
  
  // 迭代优化
  state.handleIteratePrompt = async ({ originalPrompt, optimizedPrompt: lastOptimizedPrompt, iterateInput }: { originalPrompt: string, optimizedPrompt: string, iterateInput: string }) => {
    if (!originalPrompt || !lastOptimizedPrompt || !iterateInput || state.isIterating) return
    if (!state.selectedIterateTemplate) {
      toast.error(t('toast.error.noIterateTemplate'))
      return
    }

    // 在开始迭代前立即清空状态，确保没有竞态条件
    state.isIterating = true
    state.optimizedPrompt = ''  // 强制同步清空
    state.optimizedReasoning = '' // 强制同步清空
    
    // 等待一个微任务确保状态更新完成
    await nextTick()
    
    try {
      await promptService.value!.iteratePromptStream(
        originalPrompt,
        lastOptimizedPrompt,
        iterateInput,
        optimizeModel.value,
        {
          onToken: (token: string) => {
            state.optimizedPrompt += token
          },
          onReasoningToken: (reasoningToken: string) => {
            state.optimizedReasoning += reasoningToken
          },
          onComplete: async (_response: unknown) => {
            if (!state.selectedIterateTemplate) {
              state.isIterating = false
              return
            }
            
            try {
              // 使用正确的addIteration方法来保存迭代历史，ElectronProxy会自动处理序列化
              const iterationData = {
                chainId: state.currentChainId,
                originalPrompt: originalPrompt,
                optimizedPrompt: state.optimizedPrompt,
                iterationNote: iterateInput,
                modelKey: optimizeModel.value,
                templateId: state.selectedIterateTemplate.id
              };

              const updatedChain = await historyManager.value!.addIteration(iterationData);
              
              state.currentVersions = updatedChain.versions
              state.currentVersionId = updatedChain.currentRecord.id
              
              toast.success(t('toast.success.iterateComplete'))
            } catch (error: unknown) {
              console.error('[History] 迭代记录失败:', error)
              toast.warning(t('toast.warning.historyFailed'))
            } finally {
              state.isIterating = false
            }
          },
          onError: (error: Error) => {
            console.error('[Iterate] 迭代失败:', error)
            toast.error(t('toast.error.iterateFailed'))
            state.isIterating = false
          }
        },
        state.selectedIterateTemplate.id
      )
    } catch (error: unknown) {
      console.error('[Iterate] 迭代失败:', error)
      toast.error(t('toast.error.iterateFailed'))
      state.isIterating = false
    }
  }
  
  // 切换版本 - 增强版本，确保强制更新
  state.handleSwitchVersion = async (version: PromptChain['versions'][number]) => {
    // 强制更新内容，确保UI同步
    state.optimizedPrompt = version.optimizedPrompt;
    state.currentVersionId = version.id;
    
    // 等待一个微任务确保状态更新完成
    await nextTick()
  }
  
  // 注意：模板初始化、选择保存和变化监听现在都由 useTemplateManager 负责

  // 返回 reactive 对象，而不是包含多个 ref 的对象
  return state
} 
