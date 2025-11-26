// 字体配置管理 - 类似主题切换的字体系统
import { computed, ref } from 'vue'

// 字体方案类型定义
export interface FontConfig {
  id: string
  name: string
  nameEn: string
  uiFont: string // 界面字体
  zhFont: string // 中文字体
  monoFont: string // 等宽字体
}

// 可用字体方案配置
export const fontConfigs: Record<string, FontConfig> = {
  // 衬线字体方案
  notoSerif: {
    id: 'nfotoSeri',
    name: '优雅',
    nameEn: 'Noto Serif',
    // description: '优雅',
    uiFont: '"Noto Serif SC", "PingFang SC", "Microsoft YaHei", serif',
    zhFont: '"Noto Serif SC", "Source Han Serif SC", "SimSun", serif',
    monoFont: '"JetBrains Mono", "Fira Code", "SF Mono", "Consolas", monospace'
  },
  
  // 马善政手写字体
  maShanZheng: {
    id: 'maShanZheng',
    name: '国风',
    nameEn: 'Ma Shan Zheng',
    // description: '中国风',
    uiFont: '"Ma Shan Zheng", "KaiTi", "STKaiti", serif',
    zhFont: '"Ma Shan Zheng", "KaiTi", "STKaiti", serif',
    monoFont: '"JetBrains Mono", "Fira Code", "SF Mono", "Consolas", monospace'
  },
  
  // 等宽字体方案（全局等宽）
  monoAll: {
    id: 'monoAll',
    name: '技术',
    nameEn: 'Monospace',
    // description: '技术感',
    uiFont: '"JetBrains Mono", "Fira Code", "SF Mono", "Consolas", monospace',
    zhFont: '"Sarasa Mono SC", "Source Han Mono", "Consolas", monospace',
    monoFont: '"JetBrains Mono", "Fira Code", "SF Mono", "Consolas", monospace'
  }
}

// 当前字体方案 ID
export const currentFontId = ref<string>('maShanZheng')

// 获取可用字体列表
export const availableFonts = Object.values(fontConfigs)

// 获取当前字体配置
export const currentFontConfig = computed<FontConfig>(() => 
  fontConfigs[currentFontId.value] || fontConfigs.maShanZheng
)

// 获取字体 CSS 变量
export const fontCSSVariables = computed(() => {
  const config = currentFontConfig.value
  return {
    '--po-font-ui': config.uiFont,
    '--po-font-zh': config.zhFont,
    '--po-font-code': config.monoFont,
    '--po-font-editor': config.monoFont,
    '--po-font-number': config.monoFont,
    '--po-font-heading': config.uiFont
  }
})

// 字体切换函数
export const switchFont = (fontId: string): boolean => {
  if (!fontConfigs[fontId]) {
    console.warn(`Font config '${fontId}' not found`)
    return false
  }

  currentFontId.value = fontId
  
  // 应用字体到 DOM
  applyFontToDOM(fontConfigs[fontId])
  
  // 保存到 localStorage
  try {
    localStorage.setItem('font-config-id', fontId)
  } catch (error) {
    console.warn('Failed to save font preference:', error)
  }
  
  console.log(`Font switched to: ${fontId}`)
  return true
}

// 应用字体到 DOM
const applyFontToDOM = (config: FontConfig) => {
  const root = document.documentElement
  
  // 根据传入的config直接计算CSS变量，不依赖computed
  const cssVars = {
    '--po-font-ui': config.uiFont,
    '--po-font-zh': config.zhFont,
    '--po-font-code': config.monoFont,
    '--po-font-editor': config.monoFont,
    '--po-font-number': config.monoFont,
    '--po-font-heading': config.uiFont
  }
  
  console.log('[Font Manager] Applying font config:', config)
  console.log('[Font Manager] CSS Variables to set:', cssVars)
  
  // 设置 CSS 变量
  Object.entries(cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
    console.log(`[Font Manager] Set ${key} = ${value}`)
  })
  
  // 验证设置是否成功
  console.log('[Font Manager] Verification:')
  Object.keys(cssVars).forEach(key => {
    const actualValue = getComputedStyle(root).getPropertyValue(key)
    console.log(`[Font Manager] ${key} actual value:`, actualValue.trim())
  })
  
  // 强制重新渲染页面以应用字体变化
  // 触发 reflow
  document.body.style.display = 'none'
  // 使用 requestAnimationFrame 确保浏览器完成重排
  requestAnimationFrame(() => {
    document.body.style.display = ''
    console.log('[Font Manager] Page reflow completed')
  })
}

// 获取当前字体 ID
export const getCurrentFontId = (): string => currentFontId.value

// 获取字体配置
export const getFontConfig = (fontId: string): FontConfig | null => {
  return fontConfigs[fontId] || null
}

// 初始化字体系统
export const initializeFontSystem = (): void => {
  // 从 localStorage 获取保存的字体
  let savedFont: string | null = null
  try {
    savedFont = localStorage.getItem('font-config-id')
  } catch (error) {
    console.warn('Failed to load font preference:', error)
  }

  // 验证保存的字体是否有效
  if (!savedFont || !fontConfigs[savedFont]) {
    if (savedFont) {
      console.warn(`Saved font '${savedFont}' not found, falling back to 'maShanZheng'`)
    }
    savedFont = 'maShanZheng'
  }

  // 应用字体
  switchFont(savedFont)
}

// 导出默认配置
export default {
  fontConfigs,
  currentFontId,
  currentFontConfig,
  fontCSSVariables,
  switchFont,
  getCurrentFontId,
  getFontConfig,
  initializeFontSystem,
  availableFonts
}
