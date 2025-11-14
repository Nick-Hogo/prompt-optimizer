// Naive UI 主题配置 - 全面基于 Naive UI 的 themeOverrides 系统
import { computed, ref } from 'vue'

import { darkTheme, lightTheme, type GlobalThemeOverrides, type GlobalTheme } from 'naive-ui'

// 当前主题ID
export const currentThemeId = ref<string>('macaron')

// 主题类型定义
export interface ThemeConfig {
  id: string
  name: string
  naiveTheme: GlobalTheme | null
  themeOverrides: GlobalThemeOverrides
}

// 纯Naive UI主题配置 - 完全消除CSS依赖
export const naiveThemeConfigs: Record<string, ThemeConfig> = {
  light: {
    id: 'light',
    name: '日间模式',
    naiveTheme: lightTheme,
    themeOverrides: {
      common: {
        primaryColor: '#4b5563',
        primaryColorHover: '#3f4854',
        primaryColorPressed: '#374151',
        primaryColorSuppl: '#9ca3af',
        successColor: '#059669',
        successColorHover: '#047857',
        successColorPressed: '#065f46',
        successColorSuppl: '#dcfce7',
        errorColor: '#dc2626',
        errorColorHover: '#b91c1c',
        errorColorPressed: '#991b1b',
        errorColorSuppl: '#fee2e2',
        bodyColor: '#f5f6f8',
        cardColor: '#ffffff',
        modalColor: '#ffffff',
        popoverColor: '#ffffff',
        tableColor: '#f8f9fb',
        hoverColor: 'rgba(79, 89, 102, 0.08)',
        textColorBase: '#1f2933',
        textColor1: '#1f2933',
        textColor2: '#4b5563',
        textColor3: '#6b7280',
        placeholderColor: '#9ca3af',
        borderColor: '#e5e7eb',
        dividerColor: '#eef1f4',
        scrollbarColor: 'rgba(148, 163, 184, 0.35)',
        scrollbarColorHover: 'rgba(107, 114, 128, 0.55)',
        closeIconColor: 'rgba(79, 89, 102, 0.65)',
        closeIconColorHover: '#4b5563',
        closeIconColorPressed: '#374151',
        clearColor: 'rgba(79, 89, 102, 0.2)',
        clearColorHover: 'rgba(79, 89, 102, 0.28)',
        clearColorPressed: 'rgba(79, 89, 102, 0.36)'
      },
      Button: {
        textColorPrimary: '#f9fafb',
        textColorHoverPrimary: '#f9fafb',
        textColorPressedPrimary: '#f9fafb',
        textColorFocusPrimary: '#f9fafb',
        textColorDisabledPrimary: 'rgba(249, 250, 251, 0.55)',
        colorPrimary: '#4b5563',
        colorHoverPrimary: '#3f4854',
        colorPressedPrimary: '#374151',
        colorFocusPrimary: '#4b5563',
        colorDisabledPrimary: '#c4c8ce',
        borderPrimary: '1px solid #4b5563',
        borderHoverPrimary: '1px solid #3f4854',
        borderPressedPrimary: '1px solid #374151',
        borderFocusPrimary: '1px solid #4b5563',
        borderDisabledPrimary: '1px solid #c4c8ce',
        rippleColorPrimary: 'rgba(79, 89, 102, 0.25)',
        textColor: '#4b5563',
        textColorHover: '#374151',
        textColorPressed: '#1f2933',
        color: '#f4f5f7',
        colorHover: '#e7e9ed',
        colorPressed: '#d9dce2',
        border: '1px solid #e5e7eb',
        borderHover: '1px solid #d5d7dc',
        borderPressed: '1px solid #c4c7cd',
        heightMedium: '36px',
        fontSizeMedium: '14px',
        fontWeightStrong: '500',
        borderRadius: '6px',
        paddingMedium: '0 16px'
      },
      Input: {
        color: '#f7f8fa',
        colorDisabled: '#f1f2f4',
        colorFocus: '#ffffff',
        textColor: '#1f2933',
        textColorDisabled: 'rgba(31, 41, 51, 0.45)',
        placeholderColor: '#9ca3af',
        placeholderColorDisabled: 'rgba(156, 163, 175, 0.6)',
        iconColor: '#9ca3af',
        iconColorHover: '#6b7280',
        iconColorPressed: '#4b5563',
        iconColorDisabled: 'rgba(156, 163, 175, 0.5)',
        clearColor: 'rgba(79, 89, 102, 0.2)',
        clearColorHover: 'rgba(79, 89, 102, 0.3)',
        clearColorPressed: 'rgba(79, 89, 102, 0.4)',
        border: '1px solid #d9dce1',
        borderDisabled: '1px solid rgba(213, 215, 220, 0.6)',
        borderHover: '1px solid #c6cbd2',
        borderFocus: '1px solid #aeb4bd',
        boxShadowFocus: '0 0 0 2px rgba(75, 85, 99, 0.12)',
        caretColor: '#4b5563',
        suffixTextColor: '#6b7280',
        prefixTextColor: '#6b7280',
        heightMedium: '36px',
        fontSizeMedium: '14px',
        borderRadius: '6px',
        paddingMedium: '0 12px',
        lineHeight: '1.6'
      },
      Card: {
        color: '#ffffff',
        colorModal: '#ffffff',
        colorTarget: '#ffffff',
        textColor: '#1f2933',
        titleTextColor: '#181f2a',
        titleFontWeight: '600',
        borderColor: '#e5e7eb',
        actionColor: '#f4f5f7',
        closeIconColor: '#9ca3af',
        closeIconColorHover: '#6b7280',
        closeIconColorPressed: '#4b5563',
        borderRadius: '8px',
        paddingMedium: '20px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)'
      },
      Tabs: {
        tabColor: '#f3f4f6',
        tabColorActive: '#e5e7eb',
        tabBorderColor: '#e5e7eb',
        tabTextColorBar: '#6b7280',
        tabTextColorBarHover: '#4b5563',
        tabTextColorBarActive: '#1f2933',
        tabTextColorCard: '#6b7280',
        tabTextColorCardActive: '#1f2933',
        barColor: '#d1d5db'
      },
      Radio: {
        buttonBorderColor: '#e5e7eb',
        buttonBorderColorActive: '#cbd0d6',
        buttonColor: '#f4f5f7',
        buttonColorActive: '#dfe2e7',
        buttonTextColor: '#6b7280',
        buttonTextColorActive: '#1f2933'
      },
      Dropdown: {
        color: '#ffffff',
        optionTextColor: '#4b5563',
        optionTextColorHover: '#1f2933',
        optionTextColorActive: '#1f2933',
        optionColorHover: '#f1f2f5',
        optionColorActive: '#e6e8ec',
        borderColor: '#e5e7eb'
      }
    }
  },

  dark: {
    id: 'dark', 
    name: '夜间模式',
    naiveTheme: darkTheme,
    themeOverrides: {
      common: {
        primaryColor: '#64748b',
        primaryColorHover: '#475569',
        primaryColorPressed: '#334155',
        primaryColorSuppl: '#94a3b8',
        successColor: '#22c55e',
        successColorHover: '#16a34a',
        successColorPressed: '#15803d',
        successColorSuppl: '#22543d',
        errorColor: '#ef4444',
        errorColorHover: '#dc2626',
        errorColorPressed: '#b91c1c',
        errorColorSuppl: '#7f1d1d',
      }
    }
  },

  blue: {
    id: 'blue',
    name: '蓝色模式',
    naiveTheme: lightTheme,
    themeOverrides: {
      common: {
        primaryColor: '#1f6bd1',
        primaryColorHover: '#185cb8',
        primaryColorPressed: '#134c98',
        primaryColorSuppl: '#6caef7',
        bodyColor: '#e4f0ff',
        cardColor: '#f6faff',
        modalColor: '#f6faff',
        popoverColor: '#f6faff',
        tableColor: '#eef5ff',
        inputColor: '#ffffff',
        hoverColor: 'rgba(31, 107, 209, 0.08)',
        actionColor: '#eaf3ff',
        textColorBase: '#0f2f55',
        textColor1: '#0f2f55',
        textColor2: '#1d4d85',
        textColor3: '#4a6c91',
        placeholderColor: '#6f88aa',
        borderColor: '#92bbea',
        dividerColor: '#c6dcf6',
        scrollbarColor: 'rgba(41, 98, 158, 0.35)',
        scrollbarColorHover: 'rgba(24, 76, 126, 0.55)',
        closeIconColor: 'rgba(26, 69, 119, 0.7)',
        closeIconColorHover: '#185cb8',
        closeIconColorPressed: '#134c98',
        clearColor: 'rgba(31, 107, 209, 0.25)',
        clearColorHover: 'rgba(31, 107, 209, 0.35)',
        clearColorPressed: 'rgba(31, 107, 209, 0.45)'
      },
      Button: {
        textColorPrimary: '#ffffff',
        textColorHoverPrimary: '#ffffff',
        textColorPressedPrimary: '#ffffff',
        textColorFocusPrimary: '#ffffff',
        textColorDisabledPrimary: 'rgba(255, 255, 255, 0.6)',
        colorPrimary: '#1f6bd1',
        colorHoverPrimary: '#185cb8',
        colorPressedPrimary: '#134c98',
        colorFocusPrimary: '#1f6bd1',
        colorDisabledPrimary: '#a1c6f1',
        borderPrimary: '1px solid #1f6bd1',
        borderHoverPrimary: '1px solid #185cb8',
        borderPressedPrimary: '1px solid #134c98',
        borderFocusPrimary: '1px solid #1f6bd1',
        borderDisabledPrimary: '1px solid #a1c6f1',
        rippleColorPrimary: 'rgba(31, 107, 209, 0.25)',
        textColor: '#1d4d85',
        textColorHover: '#16406f',
        textColorPressed: '#0f2f55',
        color: '#eaf3ff',
        colorHover: '#deebff',
        colorPressed: '#cfe1ff',
        border: '1px solid #c0d8f6',
        borderHover: '1px solid #aaccf2',
        borderPressed: '1px solid #97bfec'
      },
      Input: {
        color: '#ffffff',
        colorDisabled: '#f0f5fb',
        colorFocus: '#ffffff',
        textColor: '#0f2f55',
        textColorDisabled: 'rgba(15, 47, 85, 0.45)',
        placeholderColor: '#6f88aa',
        placeholderColorDisabled: 'rgba(111, 136, 170, 0.6)',
        iconColor: '#6f88aa',
        iconColorHover: '#2c5e9b',
        iconColorPressed: '#214a7d',
        iconColorDisabled: 'rgba(111, 136, 170, 0.5)',
        clearColor: 'rgba(31, 107, 209, 0.25)',
        clearColorHover: 'rgba(31, 107, 209, 0.35)',
        clearColorPressed: 'rgba(31, 107, 209, 0.45)',
        border: '1px solid #b2cef2',
        borderDisabled: '1px solid rgba(178, 206, 242, 0.6)',
        borderHover: '1px solid #9ac0ec',
        borderFocus: '1px solid #78ace4',
        boxShadowFocus: '0 0 0 2px rgba(31, 107, 209, 0.2)',
        caretColor: '#1f6bd1',
        suffixTextColor: '#4a6c91',
        prefixTextColor: '#4a6c91'
      },
      Card: {
        color: '#f6faff',
        colorModal: '#f6faff',
        colorTarget: '#f6faff',
        textColor: '#0f2f55',
        titleTextColor: '#0c2443',
        borderColor: '#b2cef2',
        actionColor: '#e3efff',
        closeIconColor: '#6f88aa',
        closeIconColorHover: '#2c5e9b',
        closeIconColorPressed: '#214a7d',
        boxShadow: '0 16px 36px rgba(15, 47, 85, 0.12)'
      },
      Tabs: {
        tabColor: '#eaf3ff',
        tabColorActive: '#cfe1ff',
        tabBorderColor: '#b2cef2',
        tabTextColorBar: '#4a6c91',
        tabTextColorBarHover: '#1d4d85',
        tabTextColorBarActive: '#0f2f55',
        tabTextColorCard: '#4a6c91',
        tabTextColorCardActive: '#0f2f55',
        barColor: '#8fb9ec'
      },
      Radio: {
        buttonBorderColor: '#b2cef2',
        buttonBorderColorActive: '#8fb9ec',
        buttonColor: '#eaf3ff',
        buttonColorActive: '#d2e5ff',
        buttonTextColor: '#4a6c91',
        buttonTextColorActive: '#0f2f55'
      },
      Dropdown: {
        color: '#ffffff',
        optionTextColor: '#1d4d85',
        optionTextColorHover: '#0f2f55',
        optionTextColorActive: '#0f2f55',
        optionColorHover: '#e1efff',
        optionColorActive: '#cfe1ff',
        borderColor: '#b2cef2'
      }
    }
  },

  macaron: {
    id: 'macaron',
    name: '马卡龙模式',
    naiveTheme: lightTheme,
    themeOverrides: {
      common: {
        primaryColor: '#BBEFCD',
        primaryColorHover: '#A5E7BE',
        primaryColorPressed: '#8FDFAE',
        primaryColorSuppl: '#D1F5DC',
        successColor: '#BBEFCD',
        successColorHover: '#A5E7BE',
        successColorPressed: '#8FDFAE',
        successColorSuppl: '#E8FAF0',
        warningColor: '#FDE980',
        warningColorHover: '#FCDF65',
        warningColorPressed: '#FBD54A',
        warningColorSuppl: '#FEF4C0',
        errorColor: '#FDDCC4',
        errorColorHover: '#FCD2AF',
        errorColorPressed: '#FBC89A',
        errorColorSuppl: '#FEF0E8',
        bodyColor: '#FFFCE0',
        cardColor: '#FFFEF5',
        modalColor: '#FFFEF5',
        popoverColor: '#FFFEF5',
        tableColor: '#FFFEF5',
        inputColor: '#FFFEF5',
        hoverColor: 'rgba(187, 239, 205, 0.15)',
        actionColor: '#F8FCF5',
        textColorBase: '#5F5A50',
        textColor1: '#5F5A50',
        textColor2: '#837D70',
        textColor3: '#A8A399',
        placeholderColor: '#C4BFAF',
        borderColor: '#E8E3D8',
        dividerColor: '#F0EDE5',
        scrollbarColor: 'rgba(187, 239, 205, 0.35)',
        scrollbarColorHover: 'rgba(187, 239, 205, 0.5)',
        closeIconColor: 'rgba(131, 125, 112, 0.65)',
        closeIconColorHover: '#837D70',
        closeIconColorPressed: '#5F5A50',
        clearColor: 'rgba(187, 239, 205, 0.3)',
        clearColorHover: 'rgba(187, 239, 205, 0.4)',
        clearColorPressed: 'rgba(187, 239, 205, 0.5)'
      },
      Button: {
        textColorPrimary: '#3F5A40',
        textColorHoverPrimary: '#3F5A40',
        textColorPressedPrimary: '#3F5A40',
        textColorFocusPrimary: '#3F5A40',
        textColorDisabledPrimary: 'rgba(63, 90, 64, 0.5)',
        colorPrimary: '#BBEFCD',
        colorHoverPrimary: '#A5E7BE',
        colorPressedPrimary: '#8FDFAE',
        colorFocusPrimary: '#BBEFCD',
        colorDisabledPrimary: '#E0F7E8',
        borderPrimary: '1.5px solid #BBEFCD',
        borderHoverPrimary: '1.5px solid #A5E7BE',
        borderPressedPrimary: '1.5px solid #8FDFAE',
        borderFocusPrimary: '1.5px solid #BBEFCD',
        borderDisabledPrimary: '1.5px solid #E0F7E8',
        rippleColorPrimary: 'rgba(187, 239, 205, 0.35)',
        textColor: '#5F5A50',
        textColorHover: '#3F5A40',
        textColorPressed: '#3F5A40',
        color: '#F8FCF5',
        colorHover: '#E8FAF0',
        colorPressed: '#D1F5DC',
        border: '1.5px solid #E0F7E8',
        borderHover: '1.5px solid #BBEFCD',
        borderPressed: '1.5px solid #A5E7BE',
        heightMedium: '36px',
        fontSizeMedium: '14px',
        fontWeightStrong: '500',
        borderRadius: '12px',
        paddingMedium: '0 20px'
      },
      Input: {
        color: '#FFFEF5',
        colorDisabled: '#FFF9F0',
        colorFocus: '#FFFEF5',
        textColor: '#5F5A50',
        textColorDisabled: 'rgba(95, 90, 80, 0.5)',
        placeholderColor: '#C4BFAF',
        placeholderColorDisabled: 'rgba(196, 191, 175, 0.6)',
        iconColor: '#A8A399',
        iconColorHover: '#837D70',
        iconColorPressed: '#5F5A50',
        iconColorDisabled: 'rgba(168, 163, 153, 0.5)',
        clearColor: 'rgba(187, 239, 205, 0.3)',
        clearColorHover: 'rgba(187, 239, 205, 0.4)',
        clearColorPressed: 'rgba(187, 239, 205, 0.5)',
        border: '2px solid #B8AE94',
        borderDisabled: '2px solid rgba(184, 174, 148, 0.4)',
        borderHover: '2px solid #BBEFCD',
        borderFocus: '2px solid #A5E7BE',
        boxShadowFocus: '0 0 0 3px rgba(187, 239, 205, 0.25)',
        caretColor: '#BBEFCD',
        suffixTextColor: '#A8A399',
        prefixTextColor: '#A8A399',
        heightMedium: '36px',
        fontSizeMedium: '14px',
        borderRadius: '8px',
        paddingMedium: '0 12px',
        lineHeight: '1.6'
      },
      Card: {
        color: '#FFFEF5',
        colorModal: '#FFFEF5',
        colorTarget: '#FFFEF5',
        textColor: '#5F5A50',
        titleTextColor: '#4F4A40',
        titleFontWeight: '600',
        borderColor: '#B8AE94',
        actionColor: '#FFF9F0',
        closeIconColor: '#A8A399',
        closeIconColorHover: '#837D70',
        closeIconColorPressed: '#5F5A50',
        borderRadius: '14px',
        paddingMedium: '22px',
        boxShadow: '0 0 32px rgba(0, 0, 0, 0.15), 0 0 16px rgba(0, 0, 0, 0.1), 0 0 8px rgba(0, 0, 0, 0.08), inset 0 0 0 2px #B8AE94'
      },
      Layout: {
        color: '#FFFCE0',
        headerColor: '#FDE980',
        siderColor: '#FFFEF5',
        footerColor: '#FFFEF5'
      },
      Tabs: {
        tabColor: '#FDE980',
        tabColorActive: '#FCDF65',
        tabBorderColor: '#FDE980',
        tabTextColorBar: '#837D70',
        tabTextColorBarHover: '#5F5A50',
        tabTextColorBarActive: '#5F5A50',
        tabTextColorCard: '#837D70',
        tabTextColorCardActive: '#5F5A50',
        barColor: 'transparent',
        tabBorderRadius: '8px'
      },
      Radio: {
        buttonBorderColor: '#D1F5DC',
        buttonBorderColorActive: '#BBEFCD',
        buttonColor: '#E8FAF0',
        buttonColorActive: '#BBEFCD',
        buttonTextColor: '#5F5A50',
        buttonTextColorActive: '#3F5A40',
        buttonBorderRadius: '8px'
      },
      Dropdown: {
        color: '#FFFEF5',
        optionTextColor: '#837D70',
        optionTextColorHover: '#5F5A50',
        optionTextColorActive: '#3F5A40',
        optionColorHover: '#FFF9F0',
        optionColorActive: '#BBEFCD',
        borderColor: '#B8AE94',
        border: '2px solid #B8AE94',
        borderRadius: '8px',
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1), 0 3px 8px rgba(0, 0, 0, 0.06)'
      },
      Select: {
        peers: {
          InternalSelection: {
            border: '1px solid #D4D0C0',
            borderHover: '1px solid #BBEFCD',
            borderActive: '1px solid #A5E7BE',
            borderFocus: '1px solid #A5E7BE',
            boxShadowFocus: '0 0 0 2px rgba(187, 239, 205, 0.2)'
          }
        }
      }
    }
  }
}

// 获取可用主题列表
export const availableThemes = Object.values(naiveThemeConfigs)

// 当前主题配置
export const currentThemeConfig = computed(() => 
  naiveThemeConfigs[currentThemeId.value] || naiveThemeConfigs.light
)

// 当前 Naive UI 主题
export const currentNaiveTheme = computed<GlobalTheme | null>(() => 
  currentThemeConfig.value.naiveTheme
)

// 当前主题覆盖配置
export const currentThemeOverrides = computed<GlobalThemeOverrides>(() => 
  currentThemeConfig.value.themeOverrides || {}
)

// 纯Naive UI主题切换 - 无需DOM操作
export const switchTheme = (themeId: string): boolean => {
  if (!naiveThemeConfigs[themeId]) {
    console.warn(`Theme '${themeId}' not found`)
    return false
  }

  currentThemeId.value = themeId
  
  // 仅保存到 localStorage，完全依赖Naive UI的themeOverrides
  try {
    localStorage.setItem('naive-theme-id', themeId)
  } catch (error) {
    console.warn('Failed to save theme preference:', error)
  }
  
  console.log(`Pure Naive UI theme switched to: ${themeId}`)
  return true
}

// 获取当前主题ID
export const getCurrentThemeId = (): string => currentThemeId.value

// 获取主题配置
export const getThemeConfig = (themeId: string): ThemeConfig | null => {
  return naiveThemeConfigs[themeId] || null
}

// 初始化主题系统
export const initializeNaiveTheme = (): void => {
  // 从 localStorage 获取保存的主题
  let savedTheme: string | null = null
  try {
    savedTheme = localStorage.getItem('naive-theme-id')
  } catch (error) {
    console.warn('Failed to load theme preference:', error)
  }

  // 如果没有保存的主题，使用 macaron 作为默认主题
  if (!savedTheme) {
    savedTheme = 'macaron'
  }

  // 应用主题
  switchTheme(savedTheme)
}

// 检查是否为深色主题
export const isDarkTheme = computed(() => {
  const config = currentThemeConfig.value
  return config.naiveTheme === darkTheme
})

// 为向后兼容性导出的别名
export const naiveTheme = currentNaiveTheme
export const themeOverrides = currentThemeOverrides