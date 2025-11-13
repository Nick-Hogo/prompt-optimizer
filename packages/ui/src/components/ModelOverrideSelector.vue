<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { NSelect, NButton, NSpace, NTooltip, NIcon, NText } from 'naive-ui'

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

const handleRefresh = () => {
  emit('refresh')
}

const handleClear = () => {
  emit('update:modelValue', undefined)
}
</script>

<template>
  <NSpace :size="8" align="center" :wrap="false">
    <NSelect
      v-model:value="internalValue"
      :options="options || []"
      :placeholder="placeholder || '选择具体模型（可选）'"
      :size="size || 'medium'"
      :disabled="disabled"
      :loading="loading"
      filterable
      clearable
      style="flex: 1;"
      @clear="handleClear"
    />
    <NTooltip trigger="hover">
      <template #trigger>
        <NButton
          :size="size || 'medium'"
          :disabled="disabled"
          :loading="loading"
          @click="handleRefresh"
          quaternary
          circle
        >
          <template #icon>
            <NIcon>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
            </NIcon>
          </template>
        </NButton>
      </template>
      <span>获取可用模型列表</span>
    </NTooltip>
  </NSpace>
</template>

<style scoped>
</style>
