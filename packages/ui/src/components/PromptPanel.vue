<template>
    <NFlex
        vertical
        :style="{
            height: '100%',
            maxHeight: '100%',
            overflow: 'hidden',
        }"
    >
        <!-- 标题和按钮区域 -->
        <NFlex justify="space-between" align="flex-start" :wrap="false" class="flex-none mb-3">
            <!-- 左侧：标题和版本 -->
            <NSpace vertical :size="8" class="flex-1 min-w-0">
                <NSpace align="center" :size="12">
                    <!-- 标题容器（包含折叠按钮） -->
                    <NFlex align="center" :size="8">
                        <NText class="text-lg font-semibold">{{
                            t("prompt.optimized")
                        }}</NText>
                        <!-- 🆕 折叠按钮（所有端都显示） -->
                        <NButton
                            text
                            size="tiny"
                            class="collapse-trigger"
                            :aria-expanded="!isContentCollapsed"
                            :aria-label="isContentCollapsed ? t('common.expand') : t('common.collapse')"
                            :title="isContentCollapsed ? t('common.expand') : t('common.collapse')"
                            @click="handleToggleCollapse"
                        >
                            <NIcon
                                :size="18"
                                :class="['collapse-trigger-icon', { 'is-collapsed': isContentCollapsed }]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
                                </svg>
                            </NIcon>
                        </NButton>
                    </NFlex>
                    <NSpace
                        v-if="versions && versions.length > 0 && !isContentCollapsed"
                        :size="4"
                        class="version-tags"
                    >
                        <NTag
                            v-for="version in versions.slice().reverse()"
                            :key="version.id"
                            :type="
                                currentVersionId === version.id
                                    ? 'success'
                                    : 'default'
                            "
                            size="small"
                            @click="switchVersion(version)"
                            :cursor="'pointer'"
                            :bordered="currentVersionId !== version.id"
                        >
                            V{{ version.version }}
                        </NTag>
                    </NSpace>
                </NSpace>
            </NSpace>

            <!-- 右侧：操作按钮（折叠时隐藏） -->
            <NSpace v-if="!isContentCollapsed" align="center" :size="8" class="flex-shrink-0">
                <!-- 预览按钮 -->
                <NButton
                    v-if="showPreview && optimizedPrompt"
                    @click="$emit('open-preview')"
                    type="tertiary"
                    size="small"
                    ghost
                    round
                    :title="t('common.preview')"
                >
                    <template #icon>
                        <NIcon>
                            <svg
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                        </svg>
                        </NIcon>
                    </template>
                </NButton>
                <!-- 继续优化按钮 -->
                <NButton
                    v-if="optimizedPrompt"
                    @click="handleIterate"
                    :disabled="isIterating"
                    :loading="isIterating"
                    type="primary"
                    size="small"
                    class="min-w-[100px]"
                >
                    <template #icon>
                        <svg
                            v-if="!isIterating"
                            class="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            ></path>
                        </svg>
                    </template>
                    {{
                        isIterating
                            ? t("prompt.optimizing")
                            : t("prompt.continueOptimize")
                    }}
                </NButton>
            </NSpace>
        </NFlex>

        <!-- 🆕 可折叠内容区域 -->
        <NCollapseTransition :style="{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex' }">
            <div v-show="!isContentCollapsed" :style="{ flex: 1, minHeight: 0, height: '100%', display: 'flex', flexDirection: 'column' }">
                <!-- 内容区域：使用 OutputDisplay 组件 -->
                <OutputDisplay
            ref="outputDisplayRef"
            :content="optimizedPrompt"
            :original-content="previousVersionText"
            :reasoning="reasoning"
            mode="editable"
            :streaming="isOptimizing || isIterating"
            :enable-diff="true"
            :enable-copy="true"
            :enable-fullscreen="true"
            :enable-edit="true"
            :placeholder="t('prompt.optimizedPlaceholder')"
            :style="{
                height: '100%',
                maxHeight: '100%',
                flex: 1,
                minHeight: 0,
                overflow: 'hidden',
            }"
            @update:content="$emit('update:optimizedPrompt', $event)"
            @save-favorite="$emit('save-favorite', $event)"
        />
            </div>
        </NCollapseTransition>
    </NFlex>
    <!-- 迭代优化弹窗 -->
    <Modal v-model="showIterateInput" @confirm="submitIterate">
        <template #title>
            {{ templateTitleText }}
        </template>

        <div class="space-y-4">
            <div>
                <NText class="text-sm font-medium mb-2">{{
                    templateSelectText
                }}</NText>
                <TemplateSelect
                    ref="iterateTemplateSelectRef"
                    :modelValue="selectedIterateTemplate"
                    @update:modelValue="
                        $emit('update:selectedIterateTemplate', $event)
                    "
                    :type="templateType"
                    :optimization-mode="optimizationMode"
                    @manage="$emit('openTemplateManager', templateType)"
                />
            </div>

            <div>
                <NText class="text-sm font-medium mb-2">{{
                    t("prompt.iterateDirection")
                }}</NText>
                <NInput
                    v-model:value="iterateInput"
                    type="textarea"
                    :placeholder="t('prompt.iteratePlaceholder')"
                    :rows="3"
                    :autosize="{ minRows: 3, maxRows: 6 }"
                />
            </div>
        </div>

        <template #footer>
            <NButton @click="cancelIterate" type="default" size="medium">
                {{ t("common.cancel") }}
            </NButton>
            <NButton
                @click="submitIterate"
                :disabled="!iterateInput.trim() || isIterating"
                :loading="isIterating"
                type="primary"
                size="medium"
            >
                {{
                    isIterating
                        ? t("prompt.optimizing")
                        : t("prompt.confirmOptimize")
                }}
            </NButton>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from "vue";
import { useI18n } from "vue-i18n";
import { NButton, NText, NInput, NFlex, NSpace, NTag, NIcon, NCollapseTransition } from "naive-ui";
import { useToast } from '../composables/ui/useToast';
import TemplateSelect from "./TemplateSelect.vue";
import Modal from "./Modal.vue";
import OutputDisplay from "./OutputDisplay.vue";
import type { Template, PromptRecord } from "@prompt-optimizer/core";

const { t } = useI18n();
const toast = useToast();

interface IteratePayload {
    originalPrompt: string;
    optimizedPrompt: string;
    iterateInput: string;
}

const props = defineProps({
    optimizedPrompt: {
        type: String,
        default: "",
    },
    reasoning: {
        type: String,
        default: "",
    },
    isOptimizing: {
        type: Boolean,
        default: false,
    },
    isIterating: {
        type: Boolean,
        default: false,
    },
    selectedIterateTemplate: {
        type: Object as () => Template | null,
        default: null,
    },
    versions: {
        type: Array as () => PromptRecord[],
        default: () => [],
    },
    currentVersionId: {
        type: String,
        default: "",
    },
    originalPrompt: {
        type: String,
        default: "",
    },
    optimizationMode: {
        type: String as () => import("@prompt-optimizer/core").OptimizationMode,
        required: true,
    },
    advancedModeEnabled: {
        type: Boolean,
        default: false,
    },
    // 🆕 允许外部指定迭代模板类型（基础/上下文/图像），默认保持原行为
    iterateTemplateType: {
        type: String as () => "iterate" | "contextIterate" | "imageIterate",
        default: undefined,
    },
    // 是否显示预览按钮
    showPreview: {
        type: Boolean,
        default: false,
    },
    // 🆕 是否允许折叠（移动端专用）
    collapsible: {
        type: Boolean,
        default: false,
    },
    // 🆕 折叠状态
    collapsed: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits<{
    "update:optimizedPrompt": [value: string];
    iterate: [payload: IteratePayload];
    openTemplateManager: [
        type:
            | "optimize"
            | "userOptimize"
            | "iterate"
            | "imageIterate"
            | "contextIterate",
    ];
    "update:selectedIterateTemplate": [template: Template | null];
    switchVersion: [version: PromptRecord];
    templateSelect: [template: Template];
    "save-favorite": [data: { content: string; originalContent?: string }];
    "open-preview": [];
    /** 🆕 折叠切换事件 */
    "toggle-collapse": [];
}>();

const showIterateInput = ref(false);
const iterateInput = ref("");
const templateType = computed<"iterate" | "contextIterate" | "imageIterate">(
    () => {
        return (
            (props.iterateTemplateType as
                | "iterate"
                | "contextIterate"
                | "imageIterate") ||
            (props.advancedModeEnabled ? "contextIterate" : "iterate")
        );
    },
);

const outputDisplayRef = ref<InstanceType<typeof OutputDisplay> | null>(null);
const iterateTemplateSelectRef = ref<{ refresh?: () => void } | null>(null);

// 计算标题文本
const templateTitleText = computed(() => {
    return t("prompt.iterateTitle");
});

// 计算模板选择标题
const templateSelectText = computed(() => {
    return t("prompt.selectIterateTemplate");
});

// 计算上一版本的文本用于显示
const previousVersionText = computed(() => {
    if (!props.versions || props.versions.length === 0) {
        return props.originalPrompt || "";
    }

    const currentIndex = props.versions.findIndex(
        (v) => v.id === props.currentVersionId,
    );

    if (currentIndex > 0) {
        // 当前版本有上一版本
        return props.versions[currentIndex - 1].optimizedPrompt;
    } else if (currentIndex === 0) {
        // 当前是V1，使用原始提示词
        return props.originalPrompt || "";
    } else {
        // 找不到当前版本，使用原始提示词
        return props.originalPrompt || "";
    }
});

// 🆕 计算属性：当前内容是否折叠（所有端都支持折叠）
const isContentCollapsed = computed(() => props.collapsed);

// 🆕 处理折叠切换
const handleToggleCollapse = () => {
    emit("toggle-collapse");
};

// 获取当前版本号（保留用于未来功能）
// const getCurrentVersionNumber = () => {
//   if (!props.versions || props.versions.length === 0) return 0
//   const currentVersion = props.versions.find(v => v.id === props.currentVersionId)
//   return currentVersion ? currentVersion.version : 1
// }

const handleIterate = () => {
    if (!props.selectedIterateTemplate) {
        toast.error(t("prompt.error.noTemplate"));
        return;
    }
    showIterateInput.value = true;
};

const cancelIterate = () => {
    showIterateInput.value = false;
    iterateInput.value = "";
};

const submitIterate = () => {
    if (!iterateInput.value.trim()) return;
    if (!props.selectedIterateTemplate) {
        toast.error(t("prompt.error.noTemplate"));
        return;
    }

    emit("iterate", {
        originalPrompt: props.originalPrompt,
        optimizedPrompt: props.optimizedPrompt,
        iterateInput: iterateInput.value.trim(),
    });

    // 重置输入
    iterateInput.value = "";
    showIterateInput.value = false;
};

// 添加版本切换函数
const switchVersion = async (version: PromptRecord) => {
    if (version.id === props.currentVersionId) return;

    // 发出版本切换事件
    emit("switchVersion", version);

    // 等待父组件更新内容
    await nextTick();

    // 强制刷新OutputDisplay的内容
    if (outputDisplayRef.value) {
        outputDisplayRef.value.forceRefreshContent();
    }

    console.log("[PromptPanel] 版本切换完成，强制刷新内容:", {
        versionId: version.id,
        version: version.version,
    });
};

// 监听流式状态变化，强制退出编辑状态
watch(
    [() => props.isOptimizing, () => props.isIterating],
    ([newOptimizing, newIterating], [oldOptimizing, oldIterating]) => {
        // 当开始优化或迭代时（从false变为true），强制退出编辑状态
        if (
            (!oldOptimizing && newOptimizing) ||
            (!oldIterating && newIterating)
        ) {
            if (outputDisplayRef.value) {
                outputDisplayRef.value.forceExitEditing();
                console.log(
                    "[PromptPanel] 检测到开始优化/迭代，强制退出编辑状态",
                );
            }
        }
    },
    { immediate: false },
);

// 暴露刷新迭代模板选择的方法
const refreshIterateTemplateSelect = () => {
    if (iterateTemplateSelectRef.value?.refresh) {
        iterateTemplateSelectRef.value.refresh();
    }
};

defineExpose({
    refreshIterateTemplateSelect,
});
</script>

<style scoped>
/* 🆕 折叠触发按钮 */
.collapse-trigger {
  padding: 0;
  width: 32px;
  height: 32px;
  min-width: 32px;
  color: var(--n-text-color);
}

/* 🆕 折叠图标动画 */
.collapse-trigger-icon {
  transition: transform 0.2s ease;
}

.collapse-trigger-icon.is-collapsed {
  transform: rotate(-90deg);
}

/* 版本容器样式 */
.version-container {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

@media (max-width: 640px) {
    .version-container {
        margin-top: 4px;
    }
}
</style>
