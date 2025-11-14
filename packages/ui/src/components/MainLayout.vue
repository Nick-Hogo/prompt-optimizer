<template>
  <!-- 使用ToastUI包装整个布局以提供NMessageProvider -->
  <ToastUI>
    <NLayout style="position: fixed; inset: 0; width: 100vw; height: 100vh;
    max-height: 100vh;
    overflow: hidden; display: flex; min-height: 0;"
    content-style="height: 100%; max-height: 100%; min-height: 0; overflow: hidden;"
    >

      <NFlex vertical style="position: fixed; inset: 0; width: 100vw; max-height: 100vh; height: 100vh; min-height: 0;">
      <!-- 顶部导航栏 -->
      <NLayoutHeader class="theme-header nav-header-enhanced">
        <NFlex justify="space-between" align="center" class="w-full nav-content" :wrap="false" :size="[16, 12]">
          <!-- 左侧：Logo + 标题 + 核心导航 -->
          <NFlex align="center" :size="16" :wrap="false">
            <!-- Logo + 标题 -->
            <NFlex align="center" :size="8" :wrap="false">
              <NImage
                :src="logoSrc"
                alt="Logo"
                :width="logoSize"
                :height="logoSize"
                object-fit="cover"
                class="logo-image"
                :show-toolbar="false"
                :preview-disabled="true"
                :fallback-src="fallbackLogoSrc"
              />
              <NText class="text-lg sm:text-xl font-bold theme-title" tag="h2">
                <slot name="title">{{ t('common.appName') }}</slot>
              </NText>
            </NFlex>

            <!-- 核心导航元素 -->
            <div class="core-navigation">
              <slot name="core-nav"></slot>
            </div>
          </NFlex>

          <!-- 右侧：操作按钮 -->
          <NFlex align="center" :size="8" :wrap="true" justify="end" class="nav-actions">
            <slot name="actions"></slot>
          </NFlex>
        </NFlex>
      </NLayoutHeader>

      <!-- 主要内容区域 - 严格控制在剩余空间内 -->
      <NLayoutContent has-sider
        style="flex: 1; min-height: 0; overflow: hidden;"
        content-style="height: 100%; max-height: 100%; min-height: 0; box-sizing: border-box; padding: 24px clamp(16px, 2vw, 48px) 40px; display: flex; flex-direction: column; align-items: stretch; overflow: hidden;"
      >
        <div class="main-content-wrapper">
          <slot name="main"></slot>
        </div>
      </NLayoutContent>
      </NFlex>

      <!-- 弹窗插槽 -->
      <slot name="modals"></slot>

    </NLayout>
  </ToastUI>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

import { useI18n } from 'vue-i18n'
import { NLayout, NLayoutHeader, NLayoutContent, NFlex, NImage, NText } from 'naive-ui'
import { ToastUI } from '../index'
import logoImage from '../assets/guda-logo.png'

const { t } = useI18n()

// Logo图片配置
const logoSrc = logoImage

// 创建简单的SVG fallback logo
const createFallbackSvg = () => {
  const svg = `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#BBEFCD"/>
      <text x="16" y="21" text-anchor="middle" fill="#3F5A40" font-family="system-ui" font-size="14" font-weight="bold">G</text>
    </svg>
  `)}`
  return svg
}

const fallbackLogoSrc = createFallbackSvg()

// 响应式Logo尺寸 - 使用更智能的检测
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    windowWidth.value = window.innerWidth
    window.addEventListener('resize', updateWindowWidth)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateWindowWidth)
  }
})

const logoSize = computed(() => {
  if (windowWidth.value < 480) {
    return 56 // 超小屏幕（再放大一倍）
  } else if (windowWidth.value < 640) {
    return 64 // 小屏幕（再放大一倍）
  }
  return 72 // 默认尺寸（再放大一倍）
})
</script>

<style>
.main-content-wrapper {
  width: 100%;
  margin: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.main-content-wrapper > * {
  flex: 1;
  min-height: 0;
}

/* 增强导航栏样式 */
.nav-header-enhanced {
  min-height: 64px !important;
  padding: 12px 20px !important;
}

.nav-content {
  min-height: 40px;
  gap: 16px;
}

.nav-actions {
  min-height: 40px;
  gap: 10px;
}

/* Logo样式优化 */
.logo-image {
  border-radius: 6px;
  transition: transform 0.2s ease-in-out;
  flex-shrink: 0;
}

.logo-image:hover {
  transform: scale(1.05);
}

/* 标题文字对齐优化 */
.theme-title {
  line-height: 1.2 !important;
  margin: 0 !important;
  white-space: nowrap;
}

/* 核心导航样式 */
.core-navigation {
  display: flex;
  align-items: center;
  margin-left: 16px;
  padding-left: 16px;
  border-left: 1.5px solid rgba(187, 239, 205, 0.3);
  min-height: 32px;
}

.core-navigation :deep(.function-mode-selector) {
  transform: scale(1.0);
}

.core-navigation :deep(.n-radio-group) {
  background: rgba(248, 252, 245, 0.8);
  border-radius: 12px;
  padding: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05),
              0 1px 4px rgba(0, 0, 0, 0.03);
  border: 1.5px solid rgba(224, 247, 232, 0.6);
  backdrop-filter: blur(8px);
}

.core-navigation :deep(.n-radio-button) {
  font-weight: 500;
  min-width: 68px;
  border-radius: 9px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.02em;
}

.core-navigation :deep(.n-radio-button--checked) {
  background: linear-gradient(135deg, #BBEFCD 0%, #A5E7BE 100%) !important;
  color: #3F5A40 !important;
  font-weight: 600;
  box-shadow: 0 3px 8px rgba(187, 239, 205, 0.35),
              0 1px 3px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.core-navigation :deep(.n-radio-button:not(.n-radio-button--checked):hover) {
  background: rgba(232, 250, 240, 0.8);
  transform: translateY(-0.5px);
}

/* 响应式优化 */
@media (max-width: 639px) {
  .logo-image {
    border-radius: 4px;
  }

  .core-navigation {
    margin-left: 8px;
    padding-left: 8px;
  }

  .core-navigation :deep(.function-mode-selector) {
    transform: scale(0.95);
  }

  .core-navigation :deep(.n-radio-button) {
    min-width: 48px;
    font-size: 12px;
  }
}

.custom-select {
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  appearance: none !important;
  background-image: none !important;
}

.custom-select::-ms-expand {
  display: none;
}
</style>
