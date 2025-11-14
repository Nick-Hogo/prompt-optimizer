<template>
  <NModal
    v-model:show="showModal"
    preset="card"
    :title="t('modelManager.quickConfig')"
    style="width: 720px; max-width: 90vw;"
    :segmented="{
      content: true
    }"
    @close="handleClose"
  >
    <NForm
      label-placement="top"
      size="medium"
      :show-feedback="false"
      class="config-form"
    >
      <NGrid :x-gap="16" :y-gap="12" :cols="24">
        <NGridItem :span="24">
          <NFormItem :label="t('modelManager.apiKey')" required>
            <NInput
              v-model:value="form.apiKey"
              type="password"
              :placeholder="t('modelManager.apiKeyPlaceholder')"
              @blur="handleApiKeyBlur"
              show-password-on="click"
              clearable
              required
            />
          </NFormItem>
        </NGridItem>

        <NGridItem :span="12">
          <NFormItem :label="t('modelManager.provider.label')">
            <NSelect
              v-model:value="form.providerId"
              :options="providerOptions"
              :placeholder="t('modelManager.provider.placeholder')"
              @update:value="handleProviderChange"
              :consistent-menu-width="false"
            />
          </NFormItem>
        </NGridItem>

        <NGridItem :span="12">
          <NFormItem :label="t('modelManager.apiUrl')">
            <NInput
              v-model:value="form.baseURL"
              :placeholder="t('modelManager.apiUrlPlaceholder')"
              clearable
            />
          </NFormItem>
        </NGridItem>

        <NGridItem :span="24">
          <NFormItem :label="t('modelManager.selectModel')">
            <div class="model-select-wrapper">
              <NSelect
                v-model:value="form.modelId"
                :options="modelOptions"
                :loading="isLoadingModels"
                :placeholder="t('modelManager.selectModelPlaceholder')"
                :disabled="!form.providerId"
                filterable
                clearable
                :consistent-menu-width="false"
              />
              <NTooltip :disabled="!canRefreshModels" :show-arrow="false">
                <template #trigger>
                  <NButton
                    @click="handleRefreshModels"
                    :loading="isLoadingModels"
                    :disabled="!canRefreshModels"
                    circle
                    secondary
                    size="small"
                    class="refresh-button"
                  >
                    <template #icon>
                      <NIcon>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </NIcon>
                    </template>
                  </NButton>
                </template>
                {{ t('modelManager.refreshModels') }}
              </NTooltip>
              <NTag v-if="isLoadingModels" type="info" size="small" :bordered="false" class="loading-tag">
                <template #icon>
                  <NIcon>
                    <svg class="rotating" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                  </NIcon>
                </template>
                {{ t('modelManager.detectingModels') }}
              </NTag>
            </div>
          </NFormItem>
        </NGridItem>
      </NGrid>

      <NGrid :x-gap="16" :y-gap="12" :cols="24" style="margin-top: 12px;">
        <NGridItem :span="12">
          <NFormItem :label="t('modelManager.displayName')">
            <NInput
              v-model:value="form.displayName"
              :placeholder="t('modelManager.displayNamePlaceholder')"
              clearable
            />
          </NFormItem>
        </NGridItem>

        <NGridItem :span="12">
          <NFormItem :label="t('modelManager.modelKey')">
            <NInput
              v-model:value="form.modelKey"
              :placeholder="t('modelManager.modelKeyPlaceholder')"
              :disabled="isEditing"
              clearable
            />
          </NFormItem>
        </NGridItem>

        <NGridItem :span="24">
          <NFormItem :label="t('modelManager.enabledStatus')">
            <NCheckbox v-model:checked="form.enabled" size="medium">
              {{ t('modelManager.enableModel') }}
            </NCheckbox>
          </NFormItem>
        </NGridItem>
      </NGrid>

      <div class="action-buttons">
        <NSpace :size="12">
          <NButton
            @click="handleTest"
            :loading="isTesting"
            :disabled="!canTest"
            secondary
            size="medium"
          >
            <template #icon>
              <NIcon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </NIcon>
            </template>
            {{ t('modelManager.testConnection') }}
          </NButton>
          <NButton
            @click="handleSave"
            :loading="isSaving"
            :disabled="!canSave"
            type="primary"
            size="medium"
          >
            <template #icon>
              <NIcon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
              </NIcon>
            </template>
            {{ t('common.save') }}
          </NButton>
        </NSpace>
      </div>
    </NForm>
  </NModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppServices } from '../types/services'
import type { TextModelConfig } from '@prompt-optimizer/core'
import {
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NButton,
  NSpace,
  NText,
  NCheckbox,
  NModal,
  NTag,
  NIcon,
  NGrid,
  NGridItem,
  NTooltip
} from 'naive-ui'
import { useToast } from '../composables/ui/useToast'

interface Props {
  services: AppServices | null
  show?: boolean
}

interface Emits {
  (e: 'model-saved'): void
  (e: 'update:show', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  show: false
})
const emit = defineEmits<Emits>()

const showModal = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

const handleClose = () => {
  emit('update:show', false)
}

const { t } = useI18n()
const toast = useToast()

const isLoadingModels = ref(false)
const isTesting = ref(false)
const isSaving = ref(false)
const isEditing = ref(false)

const form = ref({
  apiKey: '',
  providerId: '',
  baseURL: '',
  modelId: '',
  displayName: '',
  modelKey: '',
  enabled: true
})

const providerOptions = ref([
  { label: 'OpenAI', value: 'openai' },
  { label: 'Google Gemini', value: 'gemini' },
  { label: 'DeepSeek', value: 'deepseek' },
  { label: 'SiliconFlow', value: 'siliconflow' },
  { label: 'Zhipu AI', value: 'zhipu' },
  { label: t('modelManager.provider.custom'), value: 'custom' }
])

const modelOptions = ref<Array<{ label: string; value: string }>>([])

const providerDefaults: Record<string, { baseURL: string; models?: string[] }> = {
  openai: {
    baseURL: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4', 'gpt-3.5-turbo']
  },
  gemini: {
    baseURL: 'https://generativelanguage.googleapis.com',
    models: ['gemini-2.0-flash']
  },
  deepseek: {
    baseURL: 'https://api.deepseek.com/v1',
    models: ['deepseek-chat', 'deepseek-reasoner']
  },
  siliconflow: {
    baseURL: 'https://api.siliconflow.cn/v1',
    models: ['Qwen/Qwen3-8B']
  },
  zhipu: {
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    models: ['glm-4-flash', 'glm-4-plus', 'glm-4']
  },
  custom: {
    baseURL: 'http://localhost:11434/v1',
    models: []
  }
}

const canTest = computed(() => {
  return form.value.apiKey && form.value.baseURL && form.value.modelId
})

const canSave = computed(() => {
  return form.value.apiKey && form.value.providerId && form.value.baseURL && form.value.modelId
})

const canRefreshModels = computed(() => {
  return form.value.apiKey && form.value.baseURL && !isLoadingModels.value
})

const handleProviderChange = async (providerId: string) => {
  const defaults = providerDefaults[providerId]
  if (defaults) {
    form.value.baseURL = defaults.baseURL
    
    if (defaults.models && defaults.models.length > 0) {
      modelOptions.value = defaults.models.map(m => ({ label: m, value: m }))
      form.value.modelId = defaults.models[0]
    } else {
      await detectModels()
    }
  }
}

const handleApiKeyBlur = () => {
  if (form.value.apiKey && form.value.providerId && form.value.baseURL) {
    detectModels()
  }
}

const detectModels = async () => {
  if (!form.value.apiKey || !form.value.baseURL) {
    toast.warning('请先配置API密钥和API地址')
    return
  }

  isLoadingModels.value = true
  try {
    const response = await fetch(`${form.value.baseURL}/models`, {
      headers: {
        'Authorization': `Bearer ${form.value.apiKey}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('API响应数据:', data)
      
      if (data.data && Array.isArray(data.data)) {
        modelOptions.value = data.data.map((m: any) => ({
          label: m.id || m.name,
          value: m.id || m.name
        }))
        
        if (modelOptions.value.length > 0) {
          toast.success(`成功获取 ${modelOptions.value.length} 个模型`)
          if (!form.value.modelId) {
            form.value.modelId = modelOptions.value[0].value
          }
        } else {
          toast.warning('未找到可用模型')
        }
      } else {
        console.log('响应格式不符合预期，尝试直接使用数据:', data)
        if (Array.isArray(data)) {
          modelOptions.value = data.map((m: any) => ({
            label: m.id || m.name || m,
            value: m.id || m.name || m
          }))
          
          if (modelOptions.value.length > 0) {
            toast.success(`成功获取 ${modelOptions.value.length} 个模型`)
            if (!form.value.modelId) {
              form.value.modelId = modelOptions.value[0].value
            }
          }
        } else {
          toast.error('模型数据格式不正确')
        }
      }
    } else {
      const errorText = await response.text()
      console.error('API请求失败:', response.status, errorText)
      toast.error(`获取模型失败: ${response.status}`)
    }
  } catch (error) {
    console.error('Failed to detect models:', error)
    toast.error('获取模型失败，请检查网络连接和API配置')
  } finally {
    isLoadingModels.value = false
  }
}

const handleTest = async () => {
  isTesting.value = true
  try {
    const response = await fetch(`${form.value.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${form.value.apiKey}`
      },
      body: JSON.stringify({
        model: form.value.modelId,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 10
      })
    })

    if (response.ok) {
      toast.success(t('modelManager.testSuccess'))
    } else {
      toast.error(t('modelManager.testFailed'))
    }
  } catch (error) {
    toast.error(t('modelManager.testFailed'))
  } finally {
    isTesting.value = false
  }
}

const handleRefreshModels = async () => {
  await detectModels()
}

const handleSave = async () => {
  if (!props.services?.modelManager) {
    toast.error('模型管理器未初始化')
    return
  }

  if (!form.value.modelKey) {
    toast.warning('请填写模型标识')
    return
  }

  isSaving.value = true
  try {
    const { TextAdapterRegistry } = await import('@prompt-optimizer/core')
    const registry = new TextAdapterRegistry()
    
    const adapter = registry.getAdapter(form.value.providerId)
    const providerMeta = adapter.getProvider()
    
    let modelMeta = adapter.getModels().find(m => m.id === form.value.modelId)
    
    if (!modelMeta) {
      modelMeta = {
        id: form.value.modelId,
        name: form.value.displayName || form.value.modelId,
        providerId: form.value.providerId,
        capabilities: {
          supportsTools: false,
          supportsReasoning: false
        },
        parameterDefinitions: []
      }
    }
    
    const modelConfig: TextModelConfig = {
      id: form.value.modelKey,
      name: form.value.displayName || form.value.modelId,
      enabled: form.value.enabled,
      providerMeta: providerMeta,
      modelMeta: modelMeta,
      connectionConfig: {
        apiKey: form.value.apiKey,
        baseURL: form.value.baseURL
      },
      paramOverrides: {}
    }
    
    const existingModel = await props.services.modelManager.getModel(form.value.modelKey)
    
    if (existingModel) {
      await props.services.modelManager.updateModel(form.value.modelKey, modelConfig)
      toast.success('模型配置已更新')
    } else {
      await props.services.modelManager.addModel(form.value.modelKey, modelConfig)
      toast.success('模型配置已保存')
    }
    
    emit('model-saved')
    
    form.value = {
      apiKey: '',
      providerId: '',
      baseURL: '',
      modelId: '',
      displayName: '',
      modelKey: '',
      enabled: true
    }
    modelOptions.value = []
  } catch (error: any) {
    console.error('保存模型配置失败:', error)
    if (error.message?.includes('already exists')) {
      toast.error('该模型标识已存在，请使用其他标识')
    } else {
      toast.error(`保存失败: ${error.message || '未知错误'}`)
    }
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.config-form :deep(.n-form-item) {
  margin-bottom: 0;
}

.config-form :deep(.n-form-item-label) {
  font-size: 13px;
  font-weight: 500;
}

.config-form :deep(.n-input),
.config-form :deep(.n-select) {
  transition: all 0.2s;
}

.config-form :deep(.n-input:hover),
.config-form :deep(.n-select:hover) {
  box-shadow: 0 0 0 2px rgba(24, 160, 88, 0.1);
}

.model-select-wrapper {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
}

.model-select-wrapper :deep(.n-select) {
  flex: 1;
}

.refresh-button {
  flex-shrink: 0;
}

.refresh-button:hover:not(:disabled) {
  transform: scale(1.05);
}

.refresh-button:active:not(:disabled) {
  transform: scale(0.95);
}

.loading-tag {
  flex-shrink: 0;
  animation: fadeIn 0.3s ease-in;
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.advanced-collapse {
  margin-top: 16px;
  animation: fadeIn 0.3s ease-in;
}

.advanced-collapse :deep(.n-collapse-item__header) {
  font-size: 13px;
  font-weight: 500;
  padding: 12px 0;
}

.advanced-collapse :deep(.n-collapse-item__content-inner) {
  padding-top: 12px;
}

.action-buttons {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--n-border-color);
  display: flex;
  justify-content: flex-end;
}

.action-buttons :deep(.n-button) {
  min-width: 100px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .config-form :deep(.n-form-item) {
    grid-column: span 24 !important;
  }
  
  .action-buttons {
    justify-content: stretch;
  }
  
  .action-buttons :deep(.n-space) {
    width: 100%;
  }
  
  .action-buttons :deep(.n-button) {
    flex: 1;
  }
}
</style>
