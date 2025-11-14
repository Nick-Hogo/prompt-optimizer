<template>
  <div class="provider-model-selector">
    <!-- 供应商选择 -->
    <div class="selector-item">
      <NSelect
        v-model:value="selectedProvider"
        :options="providerOptions"
        :placeholder="t('model.select.providerPlaceholder')"
        :size="size"
        filterable
        :disabled="disabled"
        @update:value="handleProviderChange"
      />
    </div>

    <!-- 模型选择 -->
    <div class="selector-item">
      <SelectWithConfig
        :modelValue="modelValue"
        :options="filteredModelOptions"
        :getPrimary="getPrimary"
        :getSecondary="getSecondary"
        :getValue="getValue"
        :placeholder="t('model.select.placeholder')"
        :size="size"
        :disabled="disabled || !selectedProvider"
        :filterable="true"
        :show-config-action="showConfigAction"
        :show-empty-config-c-t-a="showEmptyConfigCTA"
        @update:modelValue="handleModelChange"
        @focus="$emit('focus')"
        @config="$emit('config')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { NSelect } from 'naive-ui'
import SelectWithConfig from './SelectWithConfig.vue'

interface ModelOption {
  [key: string]: unknown
  provider?: string
}

interface Props {
  modelValue: string | number
  options: ModelOption[]
  getPrimary: (opt: ModelOption) => string
  getSecondary?: (opt: ModelOption) => string
  getValue: (opt: ModelOption) => string | number
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  showConfigAction?: boolean
  showEmptyConfigCTA?: boolean
  // 初始选中的提供商(可选)
  defaultProvider?: string
  // ✅ 是否在切换提供商时自动选择第一个模型（默认true，保持向后兼容）
  autoSelectModelOnProviderChange?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  disabled: false,
  showConfigAction: false,
  showEmptyConfigCTA: false,
  defaultProvider: undefined,
  getSecondary: undefined,
  autoSelectModelOnProviderChange: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'provider-change': [provider: string]
  'focus': []
  'config': []
}>()

const { t } = useI18n()

// 选中的提供商
const selectedProvider = ref<string>('')

// 提供商选项列表
const providerOptions = computed(() => {
  const providers = new Set<string>()
  props.options.forEach(opt => {
    const provider = opt.provider as string | undefined
    if (provider) {
      providers.add(provider)
    }
  })
  
  return Array.from(providers).map(provider => ({
    label: provider,
    value: provider,
  })).sort((a, b) => a.label.localeCompare(b.label))
})

// 根据选中的提供商过滤模型
const filteredModelOptions = computed(() => {
  if (!selectedProvider.value) {
    return []
  }
  
  return props.options.filter(opt => {
    return opt.provider === selectedProvider.value
  })
})

// 处理提供商变化
const handleProviderChange = (provider: string) => {
  console.log('[ProviderModelSelector] Provider changed:', {
    provider,
    currentModelValue: props.modelValue,
    componentKey: 'check parent component key'
  })

  selectedProvider.value = provider
  emit('provider-change', provider)

  // ✅ 仅在启用自动选择时才执行模型自动选择逻辑
  if (!props.autoSelectModelOnProviderChange) {
    console.log('[ProviderModelSelector] Auto-select disabled, skipping model selection')
    return
  }

  // ✅ 切换提供商时始终自动选择第一个模型
  if (filteredModelOptions.value.length > 0) {
    const firstModel = filteredModelOptions.value[0]
    const firstModelValue = props.getValue(firstModel)

    console.log('[ProviderModelSelector] Auto-selecting first model:', firstModelValue)

    // ✅ 仅在模型值真正需要改变时才触发更新
    if (firstModelValue !== props.modelValue) {
      emit('update:modelValue', firstModelValue)
    }
  }
}

// 处理模型变化
const handleModelChange = (value: string | number) => {
  emit('update:modelValue', value)
}

// ✅ 初始化提供商选择（仅在组件首次挂载时执行一次）
// 每个实例完全独立，不受其他实例影响
const isInitialized = ref(false)

// 1. 首先尝试从当前 modelValue 推断提供商（仅初始化时）
watch(() => props.modelValue, (newValue) => {
  if (isInitialized.value) return // 已初始化后，提供商完全由用户手动控制
  if (!newValue) return
  
  const selectedModel = props.options.find(opt => props.getValue(opt) === newValue)
  if (selectedModel && selectedModel.provider) {
    selectedProvider.value = selectedModel.provider as string
    isInitialized.value = true
  }
}, { immediate: true })

// 2. 如果有默认提供商，使用它（仅在未初始化时）
watch(() => props.defaultProvider, (newProvider) => {
  if (isInitialized.value) return
  if (newProvider && !selectedProvider.value) {
    selectedProvider.value = newProvider
    isInitialized.value = true
  }
}, { immediate: true })

// 3. 如果没有默认提供商且有选项，自动选择第一个提供商（仅在未初始化时）
watch(providerOptions, (options) => {
  if (isInitialized.value) return
  if (!selectedProvider.value && options.length > 0) {
    selectedProvider.value = options[0].value
    isInitialized.value = true
  }
}, { immediate: true })
</script>

<style scoped>
.provider-model-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.selector-item {
  flex: 1;
  min-width: 0;
}

.selector-item--full {
  flex: 1;
  width: 100%;
}
</style>
