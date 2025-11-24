import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUiStore = defineStore('ui', () => {
    // Modal/Dialog 显示状态
    const showDataManager = ref(false);
    const showFavoriteManager = ref(false);
    const showSaveFavoriteDialog = ref(false);
    const showQuickModelConfig = ref(false);
    const showApiKeySetup = ref(false);
    const showVariableManager = ref(false);
    const showContextEditor = ref(false);
    const showPreviewPanel = ref(false);
    
    // 焦点变量名
    const focusVariableName = ref<string | undefined>(undefined);
    
    // 上下文编辑器状态
    const contextEditorDefaultTab = ref<'messages' | 'variables' | 'tools'>('messages');
    const contextEditorOnlyShowTab = ref<'messages' | 'variables' | 'tools' | null>(null);
    const contextEditorTitle = ref<string>('');
    
    // 工具方法
    const openVariableManager = (variableName?: string) => {
        if (variableName) {
            focusVariableName.value = variableName;
        }
        showVariableManager.value = true;
    };
    
    const closeVariableManager = () => {
        showVariableManager.value = false;
        focusVariableName.value = undefined;
    };
    
    const openContextEditor = (tab?: 'messages' | 'variables' | 'tools') => {
        if (tab) {
            contextEditorDefaultTab.value = tab;
        }
        showContextEditor.value = true;
    };
    
    const closeContextEditor = () => {
        showContextEditor.value = false;
        contextEditorOnlyShowTab.value = null;
        contextEditorTitle.value = '';
    };
    
    const openPreviewPanel = () => {
        showPreviewPanel.value = true;
    };
    
    const closePreviewPanel = () => {
        showPreviewPanel.value = false;
    };
    
    return {
        // 状态
        showDataManager,
        showFavoriteManager,
        showSaveFavoriteDialog,
        showQuickModelConfig,
        showApiKeySetup,
        showVariableManager,
        showContextEditor,
        showPreviewPanel,
        focusVariableName,
        contextEditorDefaultTab,
        contextEditorOnlyShowTab,
        contextEditorTitle,
        
        // 方法
        openVariableManager,
        closeVariableManager,
        openContextEditor,
        closeContextEditor,
        openPreviewPanel,
        closePreviewPanel,
    };
});
