<template>
  <NDropdown 
    trigger="click" 
    :options="fontOptions" 
    @select="handleFontSelect"
    :render-label="renderLabel"
  >
    <NButton 
      text 
      :title="t('settings.fontFamily')"
      class="font-switcher-button"
    >
      <template #icon>
        <NIcon :size="20">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10" />
          </svg>
        </NIcon>
      </template>
    </NButton>
  </NDropdown>
</template>

<script setup lang="ts">
import { h, computed } from 'vue'
import { NDropdown, NButton, NIcon, NText } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { 
  availableFonts, 
  currentFontId, 
  switchFont,
  type FontConfig 
} from '../config/font-manager'

const { t } = useI18n()

// 字体选项
const fontOptions = computed(() => {
  return availableFonts.map((font: FontConfig) => ({
    key: font.id,
    label: font.name,
    font: font,
    props: {
      style: {
        fontFamily: font.uiFont
      }
    }
  }))
})

// 自定义渲染标签 - 使用对应字体渲染标签文本
const renderLabel = (option: any) => {
  const font = option.font as FontConfig
  const isActive = currentFontId.value === font.id
  
  return h(
    NText,
    {
      strong: isActive,
      style: {
        fontSize: '16px',
        fontFamily: font.uiFont,
        padding: '4px 0',
        display: 'inline-block',
        transition: 'all 0.3s ease'
      }
    },
    { default: () => `${font.name} (${font.nameEn})` }
  )
}

// 处理字体选择
const handleFontSelect = (key: string) => {
  switchFont(key)
}
</script>

<style scoped>
.font-switcher-button {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--po-transition-base);
}

.font-switcher-button:hover {
  transform: translateY(-1px);
}
</style>
