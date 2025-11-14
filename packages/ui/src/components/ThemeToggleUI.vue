<template>
  <NDropdown
    :options="dropdownOptions"
    @select="handleThemeSelect"
    placement="bottom-end"
    trigger="click"
  >
    <NButton 
      quaternary 
      size="small"
      class="flex items-center justify-center gap-1"
    >
      <template #icon>
        <component :is="currentThemeIcon" />
      </template>
      <span class="text-sm max-md:hidden truncate">{{ currentThemeLabel }}</span>
    </NButton>
  </NDropdown>
</template>
  
<script setup lang="ts">
import { computed, h } from 'vue'

import { useI18n } from 'vue-i18n'
import { NButton, NDropdown, type DropdownOption } from 'naive-ui'
import { useNaiveTheme } from '../composables/ui/useNaiveTheme'

const { t } = useI18n()

// 使用新的主题系统
const { 
  themeId, 
  availableThemes, 
  changeTheme 
} = useNaiveTheme()

// 创建更美观的SVG图标组件
const createThemeIcon = (themeId: string, isColored: boolean = false) => {
  const baseClass = 'w-4 h-4'
  
  switch (themeId) {
    case 'light':
      return h('svg', {
        class: `${baseClass}`,
        style: isColored ? 'color: #eab308;' : undefined, // yellow-500
        viewBox: '0 0 24 24',
        fill: 'currentColor'
      }, [
        h('path', { 
          d: 'M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z'
        })
      ])
    
    case 'dark':
      return h('svg', {
        class: `${baseClass}`,
        style: isColored ? 'color: #60a5fa;' : undefined, // blue-400
        viewBox: '0 0 24 24',
        fill: 'currentColor'
      }, [
        h('path', {
          'fill-rule': 'evenodd',
          d: 'M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z',
          'clip-rule': 'evenodd'
        })
      ])
    
    case 'blue':
      return h('svg', {
        class: `${baseClass}`,
        style: isColored ? 'color: #2563eb;' : undefined, // blue-600
        viewBox: '0 0 24 24',
        fill: 'currentColor'
      }, [
        h('path', {
          d: 'M12 2L13.09 8.26L19 7L14.74 12L19 17L13.09 15.74L12 22L10.91 15.74L5 17L9.26 12L5 7L10.91 8.26L12 2Z'
        })
      ])

    case 'macaron':
      return h('svg', {
        class: `${baseClass}`,
        style: isColored ? 'color: #BBEFCD;' : undefined, // macaron green
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }, [
        // 马卡龙图标 - 甜甜圈形状
        h('circle', { cx: '12', cy: '12', r: '8', fill: '#BBEFCD', stroke: '#8FDFAE', 'stroke-width': '1.5' }),
        h('circle', { cx: '12', cy: '12', r: '4', fill: '#FFFCE0', stroke: '#FDE980', 'stroke-width': '1.5' }),
        h('circle', { cx: '9', cy: '10', r: '1', fill: '#FDDCC4' }),
        h('circle', { cx: '15', cy: '10', r: '1', fill: '#FDDCC4' }),
        h('circle', { cx: '12', cy: '14', r: '1', fill: '#FDE980' })
      ])
    
    default:
      return null
  }
}

// 当前主题的图标
const currentThemeIcon = computed(() => createThemeIcon(themeId.value, true))

// 当前主题的标签（使用国际化）
const currentThemeLabel = computed(() => {
  return t(`theme.${themeId.value}`)
})

// 为Naive UI Dropdown创建选项
const dropdownOptions = computed<DropdownOption[]>(() => {
  return availableThemes.map(theme => ({
    key: theme.id,
    label: t(`theme.${theme.id}`),
    icon: () => createThemeIcon(theme.id, true)
  }))
})

// 处理主题选择
const handleThemeSelect = (key: string) => {
  changeTheme(key)
}
</script>