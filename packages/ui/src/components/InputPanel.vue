<!-- 输入面板组件 - 纯Naive UI实现 -->
<template>
    <NSpace vertical :size="20">
        <!-- 标题区域 -->
        <NFlex justify="space-between" align="flex-start" :wrap="true">
            <NFlex align="center" :size="16" style="min-width: 0; flex: 1 1 auto;">
                <NText :depth="1" style="font-size: 20px; font-weight: 600; white-space: nowrap; line-height: 1.5;">{{
                    label
                }}</NText>
                <!-- 🆕 帮助提示图标 -->
                <NPopover
                    v-if="helpText"
                    trigger="hover"
                    placement="right"
                    :show-arrow="true"
                >
                    <template #trigger>
                        <NButton
                            text
                            size="tiny"
                            :focusable="false"
                            style="cursor: help; opacity: 0.6"
                        >
                            <template #icon>
                                <NIcon :size="16">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        stroke-width="2"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </NIcon>
                            </template>
                        </NButton>
                    </template>
                    <div style="max-width: 320px; line-height: 1.6">
                        {{ helpText }}
                    </div>
                </NPopover>

                <!-- 优化模板选择器 (保留在标题右侧) -->
                <div class="inline-selectors" v-if="templateLabel">
                    <NSpace :size="8" align="center" :wrap="true">
                        <!-- 提示词模板选择 -->
                        <div v-if="templateLabel" class="inline-select-item">
                            <NText :depth="3" class="select-label">
                                {{ templateLabel }}:
                            </NText>
                            <div class="select-wrapper">
                                <slot name="template-select"></slot>
                            </div>
                        </div>
                    </NSpace>
                </div>
            </NFlex>

            <NFlex align="center" :size="8" :wrap="true" style="flex-shrink: 0;">
                <!-- 快速配置按钮 -->
                <slot name="quick-config-button"></slot>
                
                <!-- 预览按钮 -->
                <NButton
                    v-if="showPreview"
                    type="tertiary"
                    size="small"
                    @click="$emit('open-preview')"
                    :title="$t('common.preview')"
                    ghost
                    round
                >
                    <template #icon>
                        <NIcon>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                            </svg>
                        </NIcon>
                    </template>
                </NButton>
                <!-- 全屏按钮 -->
                <NButton
                    type="tertiary"
                    size="small"
                    @click="openFullscreen"
                    :title="$t('common.expand')"
                    ghost
                    round
                >
                    <template #icon>
                        <NIcon>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                                />
                            </svg>
                        </NIcon>
                    </template>
                </NButton>
            </NFlex>
        </NFlex>

        <!-- 输入框 - 使用变量感知输入框 (支持变量提取) -->
        <VariableAwareInput
            v-if="enableVariableExtraction"
            :model-value="modelValue"
            @update:model-value="$emit('update:modelValue', $event)"
            :placeholder="placeholder"
            :autosize="{ minRows: 4, maxRows: 12 }"
            :existing-global-variables="existingGlobalVariables"
            :existing-temporary-variables="existingTemporaryVariables"
            :predefined-variables="predefinedVariables"
            :global-variable-values="globalVariableValues"
            :temporary-variable-values="temporaryVariableValues"
            :predefined-variable-values="predefinedVariableValues"
            @variable-extracted="handleVariableExtracted"
            @add-missing-variable="handleAddMissingVariable"
        />

        <!-- 原生输入框 (不支持变量提取) -->
        <NInput
            v-else
            :value="modelValue"
            @update:value="$emit('update:modelValue', $event)"
            type="textarea"
            :placeholder="placeholder"
            :rows="4"
            :autosize="{ minRows: 4, maxRows: 12 }"
            clearable
            show-count
        />

        <!-- 控制面板 - 只保留提交按钮 -->
        <NFlex justify="end" align="center" :size="12" :wrap="true">
            <!-- 提供商、模型选择器和提交按钮 -->
            <NFlex align="center" :size="12" :wrap="true">
                <!-- 提供商和模型选择器 -->
                <NSpace :size="12" align="center" v-if="modelLabel || modelOverrideLabel">
                <!-- 提供商选择 -->
                <div v-if="modelLabel" class="bottom-select-item">
                    <NText :depth="3" class="select-label">
                        {{ modelLabel }}:
                    </NText>
                    <div class="select-wrapper">
                        <slot name="model-select"></slot>
                    </div>
                </div>

                <!-- 模型选择器 -->
                <div v-if="modelOverrideLabel" class="bottom-select-item">
                    <NText :depth="3" class="select-label">
                        {{ modelOverrideLabel }}:
                    </NText>
                    <div class="select-wrapper">
                        <slot name="model-override-select"></slot>
                    </div>
                </div>
                </NSpace>

                <!-- 控制按钮组 -->
                <slot name="control-buttons"></slot>

                <!-- 提交按钮 -->
                <NButton
                    type="primary"
                    size="medium"
                    @click="$emit('submit')"
                    :loading="loading"
                    :disabled="loading || disabled || !modelValue.trim()"
                    style="min-width: 120px;"
                >
                    {{ loading ? loadingText : buttonText }}
                </NButton>
            </NFlex>
        </NFlex>
    </NSpace>

    <!-- 全屏弹窗 -->
    <FullscreenDialog v-model="isFullscreen" :title="label">
        <NInput
            v-model:value="fullscreenValue"
            type="textarea"
            :placeholder="placeholder"
            :autosize="{ minRows: 20 }"
            clearable
            show-count
        />
    </FullscreenDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import {
    NInput,
    NButton,
    NText,
    NSpace,
    NFlex,
    NGrid,
    NGridItem,
    NIcon,
    NPopover,
} from "naive-ui";
import { useFullscreen } from '../composables/ui/useFullscreen';
import FullscreenDialog from "./FullscreenDialog.vue";
import { VariableAwareInput } from "./variable-extraction";

/**
 * 输入面板组件
 *
 * 功能：
 * 1. 提供输入框用于用户输入内容
 * 2. 支持全屏编辑模式
 * 3. 支持变量提取功能 (可选)
 * 4. 提供模型选择、模板选择等控制面板
 */

interface Props {
    /** 输入框的值 */
    modelValue: string;
    /** 选中的模型 */
    selectedModel: string;
    /** 面板标题 */
    label: string;
    /** 占位符文本 */
    placeholder?: string;
    /** 模型选择标签 */
    modelLabel: string;
    /** 模型覆盖选择标签 (新增) */
    modelOverrideLabel?: string;
    /** 模板选择标签 */
    templateLabel?: string;
    /** 提交按钮文本 */
    buttonText: string;
    /** 加载中文本 */
    loadingText: string;
    /** 是否正在加载 */
    loading?: boolean;
    /** 是否禁用 */
    disabled?: boolean;
    /** 是否显示预览按钮 */
    showPreview?: boolean;
    /** 🆕 帮助提示文本（显示在标题旁边的问号图标，悬浮时显示） */
    helpText?: string;

    /** 🆕 是否启用变量提取功能 */
    enableVariableExtraction?: boolean;
    /** 🆕 已存在的全局变量名列表 */
    existingGlobalVariables?: string[];
    /** 🆕 已存在的临时变量名列表 */
    existingTemporaryVariables?: string[];
    /** 🆕 系统预定义变量名列表 */
    predefinedVariables?: string[];
    /** 🆕 全局变量名到变量值的映射 */
    globalVariableValues?: Record<string, string>;
    /** 🆕 临时变量名到变量值的映射 */
    temporaryVariableValues?: Record<string, string>;
    /** 🆕 预定义变量名到变量值的映射 */
    predefinedVariableValues?: Record<string, string>;
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: "",
    templateLabel: "",
    loading: false,
    disabled: false,
    showPreview: false,
    helpText: "",
    enableVariableExtraction: false,
    existingGlobalVariables: () => [],
    existingTemporaryVariables: () => [],
    predefinedVariables: () => [],
    globalVariableValues: () => ({}),
    temporaryVariableValues: () => ({}),
    predefinedVariableValues: () => ({}),
});

const emit = defineEmits<{
    "update:modelValue": [value: string];
    "update:selectedModel": [value: string];
    submit: [];
    configModel: [];
    "open-preview": [];
    /** 🆕 变量提取事件 */
    "variable-extracted": [
        data: {
            variableName: string;
            variableValue: string;
            variableType: "global" | "temporary";
        },
    ];
    /** 🆕 添加缺失变量事件 */
    "add-missing-variable": [varName: string];
}>();

// 使用全屏组合函数
const { isFullscreen, fullscreenValue, openFullscreen } = useFullscreen(
    computed(() => props.modelValue),
    (value) => emit("update:modelValue", value),
);

// 处理变量提取事件
const handleVariableExtracted = (data: {
    variableName: string;
    variableValue: string;
    variableType: "global" | "temporary";
}) => {
    emit("variable-extracted", data);
};

// 处理添加缺失变量事件
const handleAddMissingVariable = (varName: string) => {
    emit("add-missing-variable", varName);
};
</script>

<style scoped>
.inline-selectors {
  display: flex;
  align-items: center;
  margin-left: 16px;
  padding-left: 16px;
  border-left: 1px solid var(--n-border-color);
  flex-shrink: 1;
  min-width: 0;
}

.inline-select-item {
  display: flex;
  align-items: center;
  flex-shrink: 1;
  gap: 0;
  min-width: 0;
}

.select-label {
  font-size: 14px;
  white-space: nowrap;
  line-height: 36px;
  margin-right: 8px;
  display: flex;
  align-items: center;
}

.select-wrapper {
  max-width: 160px;
  min-width: 120px;
  flex: 1;
  display: flex;
  align-items: center;
}

.bottom-select-item {
  display: flex;
  align-items: center;
  gap: 0;
}

.bottom-select-item .select-wrapper {
  min-width: 180px;
  max-width: 250px;
}

@media (max-width: 1400px) {
  .inline-selectors {
    display: none;
  }
}
</style>
