<template>
  <NGrid :cols="24" :x-gap="12" responsive="screen">
    <!-- 模型选择区域 -->
    <NGridItem :span="modelSelectSpan" :xs="24" :sm="modelSelectSpan">
      <div style="display: flex; align-items: center; gap: 12px; flex-wrap: nowrap; overflow-x: auto;">
        <!-- 提供商选择 -->
        <div class="select-item">
          <NText :depth="3" style="font-size: 14px; white-space: nowrap;">
            {{ t('promptOptimizer.optimizeModel') }}:
          </NText>
          <div style="min-width: 140px; max-width: 200px;">
            <slot name="model-select"></slot>
          </div>
        </div>
        
        <!-- 模型选择器 -->
        <!-- <div v-if="showModelOverride" class="select-item">
          <NText :depth="3" style="font-size: 14px; white-space: nowrap;">
            {{ t('promptOptimizer.modelOverride') }}:
          </NText>
          <div style="min-width: 160px; max-width: 240px;">
            <slot name="model-override-select"></slot>
          </div>
        </div> -->
      </div>
    </NGridItem>

    <!-- 控制按钮区域 -->
    <NGridItem :span="controlButtonsSpan" :xs="24" :sm="controlButtonsSpan">
      <NFlex justify="end" align="end" vertical :style="{ height: '100%' }">
        <!-- 次要控制按钮 -->
        <NFlex v-if="hasSecondaryControls" justify="end" align="center" :size="8">
          <slot name="secondary-controls"></slot>
        </NFlex>
        
        <!-- 主要控制按钮 -->
        <NFlex justify="end" align="center" :size="8">
          <!-- 对比模式切换按钮 -->
          <NButton
            v-if="showCompareToggle"
            @click="handleCompareToggle"
            :type="isCompareMode ? 'primary' : 'default'"
            :size="buttonSize"
            class="whitespace-nowrap"
            :ghost="!isCompareMode"
          >
            {{ isCompareMode ? t('test.toggleCompare.disable') : t('test.toggleCompare.enable') }}
          </NButton>

          <!-- 主要操作按钮 -->
          <NButton
            @click="handlePrimaryAction"
            :disabled="primaryActionDisabled"
            :loading="primaryActionLoading"
            type="primary"
            :size="buttonSize"
            class="whitespace-nowrap"
          >
            {{ primaryActionText }}
          </NButton>

          <!-- 自定义操作按钮 -->
          <slot name="custom-actions"></slot>
        </NFlex>
      </NFlex>
    </NGridItem>
  </NGrid>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useI18n } from 'vue-i18n'
import { NGrid, NGridItem, NFlex, NText, NButton } from 'naive-ui'

const { t } = useI18n()

interface Props {
  // 模型选择相关
  modelLabel: string
  showModelOverride?: boolean
  
  // 对比模式控制
  showCompareToggle?: boolean
  isCompareMode?: boolean
  
  // 主要操作按钮
  primaryActionText: string
  primaryActionDisabled?: boolean
  primaryActionLoading?: boolean
  
  // 布局配置
  layout?: 'default' | 'compact' | 'minimal'
  buttonSize?: 'small' | 'medium' | 'large'
  
  // 响应式配置
  modelSelectSpan?: number
  controlButtonsSpan?: number
}

withDefaults(defineProps<Props>(), {
  showModelOverride: false,
  showCompareToggle: true,
  isCompareMode: false,
  primaryActionDisabled: false,
  primaryActionLoading: false,
  layout: 'default',
  buttonSize: 'medium',
  modelSelectSpan: 14,
  controlButtonsSpan: 10
})

const emit = defineEmits<{
  'compare-toggle': []
  'primary-action': []
}>()

// 计算属性
const hasSecondaryControls = computed(() => {
  // 检查是否有次要控制插槽内容
  return false // 可以通过插槽检测实现
})

// 事件处理
const handleCompareToggle = () => {
  emit('compare-toggle')
}

const handlePrimaryAction = () => {
  emit('primary-action')
}
</script>

<style scoped>
.select-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>