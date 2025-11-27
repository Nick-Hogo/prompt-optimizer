<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { NSelect } from 'naive-ui'

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
}>()

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleClear = () => {
  emit('update:modelValue', undefined)
}
</script>

<template>
  <NSelect
    v-model:value="internalValue"
    :options="options || []"
    :placeholder="placeholder || '选择具体模型（可选）'"
    :size="size || 'medium'"
    :disabled="disabled"
    :loading="loading"
    filterable
    clearable
    @clear="handleClear"
  />
</template>

<style scoped>
</style>
