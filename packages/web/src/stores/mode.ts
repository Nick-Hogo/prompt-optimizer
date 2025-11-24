import { defineStore, storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import {
    useFunctionMode,
    useBasicSubMode,
    useProSubMode,
    useImageSubMode,
    type OptimizationMode,
} from '@prompt-optimizer/ui';
import type { ContextMode } from '@prompt-optimizer/core';
import { useAppStore } from './app';

export const useModeStore = defineStore('mode', () => {
    const appStore = useAppStore();
    const { services } = storeToRefs(appStore);
    
    // 功能模式管理
    const { functionMode, setFunctionMode } = useFunctionMode(services as any);
    const { basicSubMode, setBasicSubMode, ensureInitialized: ensureBasicInit } = useBasicSubMode(services as any);
    const { proSubMode, setProSubMode, ensureInitialized: ensureProInit } = useProSubMode(services as any);
    const { imageSubMode, setImageSubMode, ensureInitialized: ensureImageInit } = useImageSubMode(services as any);
    
    // 优化模式与上下文模式
    const selectedOptimizationMode = ref<OptimizationMode>('user');
    const contextMode = ref<ContextMode>('system');
    
    // 高级模式开关
    const advancedModeEnabled = computed({
        get: () => functionMode.value === 'pro',
        set: (val: boolean) => {
            setFunctionMode(val ? 'pro' : 'basic');
        },
    });
    
    // 处理功能模式切换
    const handleModeSelect = async (mode: 'basic' | 'pro' | 'image') => {
        await setFunctionMode(mode);
        
        if (mode === 'basic') {
            await ensureBasicInit();
            selectedOptimizationMode.value = basicSubMode.value as OptimizationMode;
            contextMode.value = basicSubMode.value as ContextMode;
        } else if (mode === 'pro') {
            await ensureProInit();
            selectedOptimizationMode.value = proSubMode.value as OptimizationMode;
            contextMode.value = proSubMode.value as ContextMode;
        } else if (mode === 'image') {
            await ensureImageInit();
        }
    };
    
    // 基础模式子模式变更
    const handleBasicSubModeChange = async (mode: OptimizationMode) => {
        await setBasicSubMode(mode as any);
        selectedOptimizationMode.value = mode;
        contextMode.value = mode as ContextMode;
    };
    
    // 专业模式子模式变更
    const handleProSubModeChange = async (mode: OptimizationMode) => {
        await setProSubMode(mode as any);
        selectedOptimizationMode.value = mode;
        contextMode.value = mode as ContextMode;
    };
    
    // 图像模式子模式变更
    const handleImageSubModeChange = async (mode: any) => {
        await setImageSubMode(mode);
        
        if (typeof window !== 'undefined') {
            window.dispatchEvent(
                new CustomEvent('image-submode-changed', {
                    detail: { mode },
                })
            );
        }
    };
    
    // 初始化模式
    const initModes = async () => {
        if (functionMode.value === 'basic') {
            await ensureBasicInit();
            selectedOptimizationMode.value = basicSubMode.value as OptimizationMode;
            contextMode.value = basicSubMode.value as ContextMode;
        } else if (functionMode.value === 'pro') {
            await ensureProInit();
            selectedOptimizationMode.value = proSubMode.value as OptimizationMode;
            contextMode.value = proSubMode.value as ContextMode;
        } else if (functionMode.value === 'image') {
            await ensureImageInit();
        }
    };
    
    return {
        // 状态
        functionMode,
        selectedOptimizationMode,
        contextMode,
        advancedModeEnabled,
        basicSubMode,
        proSubMode,
        imageSubMode,
        
        // 方法
        handleModeSelect,
        handleBasicSubModeChange,
        handleProSubModeChange,
        handleImageSubModeChange,
        setFunctionMode,
        setBasicSubMode,
        setProSubMode,
        setImageSubMode,
        initModes,
    };
});
