import { defineStore } from 'pinia';
import { computed, ref, watch, nextTick } from 'vue';
import { useAppInitializer, useNaiveTheme } from '@prompt-optimizer/ui';
import type { IPromptService } from '@prompt-optimizer/core';

export const useAppStore = defineStore('app', () => {
    // 初始化服务
    const { services, isInitializing } = useAppInitializer();
    const promptService = ref<IPromptService | null>(null);
    
    // 主题管理
    const { naiveTheme, themeOverrides, initTheme } = useNaiveTheme();
    
    // API Key 设置状态
    const showApiKeySetup = ref(false);
    
    // 计算属性
    const isReady = computed(() => !!services.value && !isInitializing.value);
    const servicesForContextEditor = computed(() => services.value ?? null);
    
    // 检查 API Key 配置
    const checkApiKeySetup = async () => {
        if (!services.value?.modelManager) return;
        
        try {
            const models = await services.value.modelManager.getAllModels();
            const hasValidApiKey = models.some((model: any) => 
                model.enabled && model.connectionConfig?.apiKey
            );
            
            if (!hasValidApiKey) {
                await nextTick();
                setTimeout(() => {
                    showApiKeySetup.value = true;
                }, 500);
            }
        } catch (error) {
            console.error('[AppStore] Failed to check API key setup:', error);
        }
    };
    
    // 初始化应用
    const initApp = async () => {
        if (typeof window !== 'undefined') {
            initTheme();
        }
    };
    
    // 监听服务变化
    watch(services, async (newServices) => {
        if (newServices) {
            promptService.value = newServices.promptService;
            await checkApiKeySetup();
        }
    }, { immediate: true });
    
    return {
        // 状态
        services,
        promptService,
        isInitializing,
        isReady,
        servicesForContextEditor,
        naiveTheme,
        themeOverrides,
        showApiKeySetup,
        
        // 方法
        initApp,
        checkApiKeySetup,
    };
});
