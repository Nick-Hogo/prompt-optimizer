<template>
  <div
    class="test-result-section"
    :style="{ 
      flex: 1, 
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column'
    }"
  >
    <!-- 对比模式：双列布局 -->
    <NFlex
      v-if="isCompareMode && showOriginal"
      :vertical="verticalLayout"
      justify="space-between"
      :style="{
        flex: 1,
        overflow: 'hidden',
        height: '100%',
        gap: '12px'
      }"
    >
      <!-- 原始结果 -->
      <div
        :style="{
          flex: 1,
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }"
      >
        <h3 class="result-title">{{ displayOriginalTitle }}</h3>
        <slot name="original-result"></slot>
        <!-- 原始结果的工具调用 -->
        <ToolCallDisplay
          v-if="originalResult?.toolCalls"
          :tool-calls="originalResult.toolCalls"
          :size="size"
          class="tool-calls-section"
        />
      </div>

      <!-- 优化结果 -->
      <div
        :style="{
          flex: 1,
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }"
      >
        <h3 class="result-title">{{ displayOptimizedTitle }}</h3>
        <slot name="optimized-result"></slot>
        <!-- 优化结果的工具调用 -->
        <ToolCallDisplay
          v-if="optimizedResult?.toolCalls"
          :tool-calls="optimizedResult.toolCalls"
          :size="size"
          class="tool-calls-section"
        />
      </div>
    </NFlex>
    
    <!-- 单一模式：单列布局 -->
    <div
      v-else
      :style="{
        flex: 1,
        height: '100%',
        overflow: 'hidden'
      }"
    >
      <slot name="single-result"></slot>
      <!-- 单一结果的工具调用 -->
      <ToolCallDisplay
        v-if="singleResult?.toolCalls"
        :tool-calls="singleResult.toolCalls"
        :size="size"
        class="tool-calls-section"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { NFlex } from 'naive-ui'
import ToolCallDisplay from './ToolCallDisplay.vue'
import type { AdvancedTestResult } from '@prompt-optimizer/core'

const { t } = useI18n()

interface Props {
  // 布局模式
  isCompareMode?: boolean
  verticalLayout?: boolean
  showOriginal?: boolean

  // 标题配置
  originalTitle?: string
  optimizedTitle?: string
  singleResultTitle?: string

  // 测试结果数据（用于工具调用显示）
  originalResult?: AdvancedTestResult
  optimizedResult?: AdvancedTestResult
  singleResult?: AdvancedTestResult

  // 尺寸配置
  cardSize?: 'small' | 'medium' | 'large'
  size?: 'small' | 'medium' | 'large'

  // 间距配置
  gap?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  isCompareMode: false,
  verticalLayout: false,
  showOriginal: true,
  originalTitle: '',
  optimizedTitle: '',
  singleResultTitle: '',
  cardSize: 'small',
  size: 'small',
  gap: 12
})

// 标题计算属性：优先使用 props，否则使用国际化默认值
const displayOriginalTitle = computed(() =>
  props.originalTitle || t('test.originalResult')
)
const displayOptimizedTitle = computed(() =>
  props.optimizedTitle || t('test.optimizedResult')
)
</script>

<style scoped>
.test-result-section {
  /* 确保正确的flex行为和高度管理 */
  min-height: 0;
  max-height: 100%;
}

/* 结果标题样式 */
.result-title {
  flex-shrink: 0;
  margin: 0 0 12px 0;
  padding: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  color: var(--n-text-color);
}

/* 三段式布局样式 */
.result-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  /* 为正文区域提供独立滚动 */
  border: none;
  outline: none;
  box-shadow: none;
}

.tool-calls-section {
  flex: 0 0 auto;
  /* 工具调用区域根据内容自适应高度 */
}
</style>