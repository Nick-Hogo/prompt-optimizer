<template>
  <NButton
    :type="buttonType"
    :size="buttonSize"
    :loading="loading"
    :loading-text="loadingText || t('common.loading')"
    :disabled="loading"
    @click="$emit('click')"
    class="action-button"
    :class="{ 'action-button--enhanced': !ghost }"
    :ghost="ghost"
    :round="round"
    :strong="false"
  >
    <template #icon>
      <slot name="icon">
        <span class="text-base sm:text-lg">{{ icon }}</span>
      </slot>
    </template>
    <span class="text-sm max-md:hidden">{{ text }}</span>
  </NButton>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useI18n } from 'vue-i18n'
import { NButton } from 'naive-ui'

const { t } = useI18n()

interface Props {
  icon?: string
  text: string
  loading?: boolean
  loadingText?: string
  type?: 'default' | 'tertiary' | 'primary' | 'success' | 'info' | 'warning' | 'error' | 'quaternary'
  size?: 'tiny' | 'small' | 'medium' | 'large'
  ghost?: boolean
  round?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'medium',
  ghost: false,
  round: true
})

defineEmits<{
  (e: 'click'): void
}>()

// 动态计算按钮类型和尺寸，保持与主题的一致性
const buttonType = computed(() => props.type)
const buttonSize = computed(() => props.size)
</script>

<style scoped>
.action-button {
  /* 保持与原有主题系统的兼容性 */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  letter-spacing: 0.01em;
}

/* 增强型按钮样式 - 更柔和��视觉效果 */
.action-button--enhanced {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06),
              0 1px 4px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(8px);
  border-width: 1.5px !important;
}

.action-button--enhanced:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1),
              0 2px 6px rgba(0, 0, 0, 0.06);
}

.action-button--enhanced:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08),
              0 1px 3px rgba(0, 0, 0, 0.05);
}

/* 幽灵按钮保持轻量 */
.action-button:not(.action-button--enhanced):hover {
  transform: translateY(-1px);
  opacity: 0.85;
}
</style>