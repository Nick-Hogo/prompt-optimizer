<template>
    <NConfigProvider
        :theme="naiveTheme"
        :theme-overrides="themeOverrides"
        :hljs="hljsInstance"
    >
        <div v-if="isInitializing" class="loading-container">
            <div class="spinner"></div>
            <p>{{ t("log.info.initializing") }}</p>
        </div>
        <div v-else-if="!services" class="loading-container error">
            <p>{{ t("toast.error.appInitFailed") }}</p>
        </div>
        <template v-if="isReady">
            <MainLayoutUI>
                <!-- Title Slot -->
                <template #title>
                    {{ $t("promptOptimizer.title") }}
                </template>

                <!-- Core Navigation Slot -->
                <template #core-nav>
                    <NSpace :size="12" align="center">
                        <!-- 功能模式选择器 -->
                        <FunctionModeSelector
                            :modelValue="functionMode"
                            @update:modelValue="handleModeSelect"
                        />

                        <!-- 子模式选择器 - 基础模式 -->
                        <OptimizationModeSelectorUI
                            v-if="functionMode === 'basic'"
                            :modelValue="basicSubMode"
                            @change="handleBasicSubModeChange"
                        />

                        <!-- 子模式选择器 - 上下文模式 -->
                        <OptimizationModeSelectorUI
                            v-if="functionMode === 'pro'"
                            :modelValue="proSubMode"
                            :hide-system-option="true"
                            @change="handleProSubModeChange"
                        />

                        <!-- 子模式选择器 - 图像模式 -->
                        <ImageModeSelector
                            v-if="functionMode === 'image'"
                            :modelValue="imageSubMode"
                            @change="handleImageSubModeChange"
                        />
                    </NSpace>
                </template>

                <!-- Actions Slot -->
                <template #actions>
                    <!-- 核心功能区 -->
                    <ActionButtonUI
                        icon="📝"
                        :text="$t('nav.templates')"
                        @click="openTemplateManager"
                        type="default"
                        size="medium"
                        :ghost="false"
                        :round="true"
                    />
                    <ActionButtonUI
                        icon="📜"
                        :text="$t('nav.history')"
                        @click="historyManager.showHistory = true"
                        type="default"
                        size="medium"
                        :ghost="false"
                        :round="true"
                    />
                    <ActionButtonUI
                        icon="⭐"
                        :text="$t('nav.favorites')"
                        @click="showFavoriteManager = true"
                        type="default"
                        size="medium"
                        :ghost="false"
                        :round="true"
                    />
                    <ActionButtonUI
                        icon="💾"
                        :text="$t('nav.dataManager')"
                        @click="showDataManager = true"
                        type="default"
                        size="medium"
                        :ghost="false"
                        :round="true"
                    />
                    <!-- 辅助功能区 - 使用简化样式降低视觉权重 -->
                    <ThemeToggleUI />
                    <ActionButtonUI
                        icon=""
                        text=""
                        @click="openGithubRepo"
                        size="small"
                        type="quaternary"
                        :ghost="true"
                    >
                        <template #icon>
                            <svg
                                class="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path
                                    d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"
                                />
                            </svg>
                        </template>
                    </ActionButtonUI>
                    <LanguageSwitchDropdown />
                    <!-- 自动更新组件 - 仅在Electron环境中显示 -->
                    <UpdaterIcon />
                </template>
                <template #main>
                    <!-- 上下文模式：根据模式使用不同的独立组件 -->
                    <template v-if="functionMode === 'pro'">
                        <!-- 上下文-系统模式 -->
                        <ContextSystemWorkspace
                            ref="systemWorkspaceRef"
                            v-if="contextMode === 'system'"
                            :prompt="optimizer.prompt"
                            @update:prompt="optimizer.prompt = $event"
                            :optimized-prompt="optimizer.optimizedPrompt"
                            @update:optimizedPrompt="
                                optimizer.optimizedPrompt = $event
                            "
                            :optimized-reasoning="optimizer.optimizedReasoning"
                            :optimization-mode="selectedOptimizationMode"
                            :is-optimizing="optimizer.isOptimizing"
                            :is-iterating="optimizer.isIterating"
                            :is-test-running="false"
                            :versions="optimizer.currentVersions"
                            :current-version-id="optimizer.currentVersionId"
                            :selected-iterate-template="
                                optimizer.selectedIterateTemplate
                            "
                            @update:selectedIterateTemplate="
                                optimizer.selectedIterateTemplate = $event
                            "
                            :optimization-context="optimizationContext"
                            @update:optimizationContext="
                                optimizationContext = $event
                            "
                            :tool-count="optimizationContextTools.length"
                            :test-content="testContent"
                            @update:testContent="testContent = $event"
                            :is-compare-mode="isCompareMode"
                            @update:isCompareMode="isCompareMode = $event"
                            :global-variables="
                                variableManager?.customVariables?.value || {}
                            "
                            :predefined-variables="predefinedVariables"
                            :available-variables="
                                variableManager?.variableManager.value?.resolveAllVariables() ||
                                {}
                            "
                            :scan-variables="
                                (content) =>
                                    variableManager?.variableManager.value?.scanVariablesInContent(
                                        content,
                                    ) || []
                            "
                            :input-mode="
                                responsiveLayout.recommendedInputMode.value
                            "
                            :control-bar-layout="
                                responsiveLayout.recommendedControlBarLayout
                                    .value
                            "
                            :button-size="
                                responsiveLayout.smartButtonSize.value
                            "
                            :conversation-max-height="
                                responsiveLayout.responsiveHeights.value
                                    .conversationMax
                            "
                            :result-vertical-layout="
                                responsiveLayout.isMobile.value
                            "
                            @optimize="handleOptimizePrompt"
                            @iterate="handleIteratePrompt"
                            @test="handleTestAreaTest"
                            @compare-toggle="handleTestAreaCompareToggle"
                            @switch-version="handleSwitchVersion"
                            @save-favorite="handleSaveFavorite"
                            @open-global-variables="openVariableManager()"
                            @open-variable-manager="handleOpenVariableManager"
                            @open-context-editor="handleOpenContextEditor()"
                            @open-template-manager="openTemplateManager"
                            @config-model="modelManager.showConfig = true"
                            @open-input-preview="handleOpenInputPreview"
                            @open-prompt-preview="handleOpenPromptPreview"
                        >
                            <!-- 优化模型选择插槽 -->
                            <template #optimize-model-select>
                                <SelectWithConfig
                                    v-model="modelManager.selectedOptimizeModel"
                                    :options="textModelOptions"
                                    :getPrimary="OptionAccessors.getPrimary"
                                    :getSecondary="OptionAccessors.getSecondary"
                                    :getValue="OptionAccessors.getValue"
                                    :placeholder="t('model.select.placeholder')"
                                    size="medium"
                                    :disabled="optimizer.isOptimizing"
                                    filterable
                                    :show-config-action="true"
                                    :show-empty-config-c-t-a="true"
                                    @focus="refreshTextModels"
                                    @config="modelManager.showConfig = true"
                                />
                            </template>

                            <!-- 模板选择插槽 -->
                            <template #template-select>
                                <template
                                    v-if="services && services.templateManager"
                                >
                                    <SelectWithConfig
                                        v-model="selectedTemplateIdForSelect"
                                        :options="templateOptions"
                                        :getPrimary="OptionAccessors.getPrimary"
                                        :getSecondary="
                                            OptionAccessors.getSecondary
                                        "
                                        :getValue="OptionAccessors.getValue"
                                        :placeholder="t('template.select')"
                                        size="medium"
                                        :disabled="optimizer.isOptimizing"
                                        filterable
                                        :show-config-action="true"
                                        :show-empty-config-c-t-a="true"
                                        @focus="refreshOptimizeTemplates"
                                        @config="
                                            handleOpenOptimizeTemplateManager
                                        "
                                    />
                                </template>
                                <NText v-else depth="3" class="p-2 text-sm">
                                    {{ t("template.loading") || "加载中..." }}
                                </NText>
                            </template>

                            <!-- 测试模型选择插槽 -->
                            <template #test-model-select>
                                <SelectWithConfig
                                    v-model="modelManager.selectedTestModel"
                                    :options="textModelOptions"
                                    :getPrimary="OptionAccessors.getPrimary"
                                    :getSecondary="OptionAccessors.getSecondary"
                                    :getValue="OptionAccessors.getValue"
                                    :placeholder="t('model.select.placeholder')"
                                    size="medium"
                                    filterable
                                    :show-config-action="true"
                                    :show-empty-config-c-t-a="true"
                                    @focus="refreshTextModels"
                                    @config="modelManager.showConfig = true"
                                />
                            </template>

                            <!-- 测试结果插槽 -->
                            <template #original-result>
                                <OutputDisplay
                                    :content="testResults.originalResult"
                                    :reasoning="testResults.originalReasoning"
                                    :streaming="testResults.isTestingOriginal"
                                    :enableDiff="false"
                                    mode="readonly"
                                    :style="{ height: '100%', minHeight: '0' }"
                                />
                            </template>

                            <template #optimized-result>
                                <OutputDisplay
                                    :content="testResults.optimizedResult"
                                    :reasoning="testResults.optimizedReasoning"
                                    :streaming="testResults.isTestingOptimized"
                                    :enableDiff="false"
                                    mode="readonly"
                                    :style="{ height: '100%', minHeight: '0' }"
                                />
                            </template>

                            <template #single-result>
                                <OutputDisplay
                                    :content="testResults.optimizedResult"
                                    :reasoning="testResults.optimizedReasoning"
                                    :streaming="testResults.isTestingOptimized"
                                    :enableDiff="false"
                                    mode="readonly"
                                    :style="{ height: '100%', minHeight: '0' }"
                                />
                            </template>
                        </ContextSystemWorkspace>

                        <!-- 上下文-用户模式 -->
                        <ContextUserWorkspace
                            ref="userWorkspaceRef"
                            v-else-if="contextMode === 'user'"
                            :prompt="optimizer.prompt"
                            @update:prompt="optimizer.prompt = $event"
                            :optimized-prompt="optimizer.optimizedPrompt"
                            @update:optimizedPrompt="
                                optimizer.optimizedPrompt = $event
                            "
                            :optimized-reasoning="optimizer.optimizedReasoning"
                            :optimization-mode="selectedOptimizationMode"
                            :is-optimizing="optimizer.isOptimizing"
                            :is-iterating="optimizer.isIterating"
                            :is-test-running="false"
                            :versions="optimizer.currentVersions"
                            :current-version-id="optimizer.currentVersionId"
                            :selected-iterate-template="
                                optimizer.selectedIterateTemplate
                            "
                            @update:selectedIterateTemplate="
                                optimizer.selectedIterateTemplate = $event
                            "
                            :test-content="testContent"
                            @update:testContent="testContent = $event"
                            :is-compare-mode="isCompareMode"
                            @update:isCompareMode="isCompareMode = $event"
                            :global-variables="
                                variableManager?.customVariables?.value || {}
                            "
                            :predefined-variables="predefinedVariables"
                            @variable-change="handleTestPanelVariableChange"
                            @save-to-global="handleSaveToGlobal"
                            :input-mode="
                                responsiveLayout.recommendedInputMode.value
                            "
                            :control-bar-layout="
                                responsiveLayout.recommendedControlBarLayout
                                    .value
                            "
                            :button-size="
                                responsiveLayout.smartButtonSize.value
                            "
                            :conversation-max-height="
                                responsiveLayout.responsiveHeights.value
                                    .conversationMax
                            "
                            :result-vertical-layout="
                                responsiveLayout.isMobile.value
                            "
                            @optimize="handleOptimizePrompt"
                            @iterate="handleIteratePrompt"
                            @test="handleTestAreaTest"
                            @compare-toggle="handleTestAreaCompareToggle"
                            @switch-version="handleSwitchVersion"
                            @save-favorite="handleSaveFavorite"
                            @open-global-variables="openVariableManager()"
                            @open-tool-manager="
                                openContextEditorWithTab('tools');
                                handleOpenContextEditor('tools')
                            "
                            @open-variable-manager="handleOpenVariableManager"
                            @open-template-manager="openTemplateManager"
                            @config-model="modelManager.showConfig = true"
                            @open-input-preview="handleOpenInputPreview"
                            @open-prompt-preview="handleOpenPromptPreview"
                        >
                            <!-- 优化模型选择插槽 -->
                            <template #optimize-model-select>
                                <SelectWithConfig
                                    v-model="modelManager.selectedOptimizeModel"
                                    :options="textModelOptions"
                                    :getPrimary="OptionAccessors.getPrimary"
                                    :getSecondary="OptionAccessors.getSecondary"
                                    :getValue="OptionAccessors.getValue"
                                    :placeholder="t('model.select.placeholder')"
                                    size="medium"
                                    :disabled="optimizer.isOptimizing"
                                    filterable
                                    :show-config-action="true"
                                    :show-empty-config-c-t-a="true"
                                    @focus="refreshTextModels"
                                    @config="modelManager.showConfig = true"
                                />
                            </template>

                            <!-- 模板选择插槽 -->
                            <template #template-select>
                                <template
                                    v-if="services && services.templateManager"
                                >
                                    <SelectWithConfig
                                        v-model="selectedTemplateIdForSelect"
                                        :options="templateOptions"
                                        :getPrimary="OptionAccessors.getPrimary"
                                        :getSecondary="
                                            OptionAccessors.getSecondary
                                        "
                                        :getValue="OptionAccessors.getValue"
                                        :placeholder="t('template.select')"
                                        size="medium"
                                        :disabled="optimizer.isOptimizing"
                                        filterable
                                        :show-config-action="true"
                                        :show-empty-config-c-t-a="true"
                                        @focus="refreshOptimizeTemplates"
                                        @config="
                                            handleOpenOptimizeTemplateManager
                                        "
                                    />
                                </template>
                                <NText v-else depth="3" class="p-2 text-sm">
                                    {{ t("template.loading") || "加载中..." }}
                                </NText>
                            </template>

                            <!-- 测试模型选择插槽 -->
                            <template #test-model-select>
                                <SelectWithConfig
                                    v-model="modelManager.selectedTestModel"
                                    :options="textModelOptions"
                                    :getPrimary="OptionAccessors.getPrimary"
                                    :getSecondary="OptionAccessors.getSecondary"
                                    :getValue="OptionAccessors.getValue"
                                    :placeholder="t('model.select.placeholder')"
                                    size="medium"
                                    filterable
                                    :show-config-action="true"
                                    :show-empty-config-c-t-a="true"
                                    @focus="refreshTextModels"
                                    @config="modelManager.showConfig = true"
                                />
                            </template>

                            <!-- 测试结果插槽 -->
                            <template #original-result>
                                <OutputDisplay
                                    :content="testResults.originalResult"
                                    :reasoning="testResults.originalReasoning"
                                    :streaming="testResults.isTestingOriginal"
                                    :enableDiff="false"
                                    mode="readonly"
                                    :style="{ height: '100%', minHeight: '0' }"
                                />
                            </template>

                            <template #optimized-result>
                                <OutputDisplay
                                    :content="testResults.optimizedResult"
                                    :reasoning="testResults.optimizedReasoning"
                                    :streaming="testResults.isTestingOptimized"
                                    :enableDiff="false"
                                    mode="readonly"
                                    :style="{ height: '100%', minHeight: '0' }"
                                />
                            </template>

                            <template #single-result>
                                <OutputDisplay
                                    :content="testResults.optimizedResult"
                                    :reasoning="testResults.optimizedReasoning"
                                    :streaming="testResults.isTestingOptimized"
                                    :enableDiff="false"
                                    mode="readonly"
                                    :style="{ height: '100%', minHeight: '0' }"
                                />
                            </template>
                        </ContextUserWorkspace>
                    </template>

                    <!-- 基础模式：保持原有布局 -->
                    <template v-else-if="functionMode === 'basic'">
                        <!-- Main Content - 使用 Naive UI NGrid 实现响应式水平左右布局 class="h-full min-h-0 overflow-hidden max-height=100%" -->
                        <NFlex
                            justify="space-between"
                            :style="{
                                display: 'flex',
                                flexDirection: 'row',
                                width: '100%',
                                'max-height': '100%',
                                gap: '20px',
                            }"
                        >
                            <!-- 左侧：优化区域 -->
                            <NFlex
                                vertical
                                :style="{
                                    flex: 1,
                                    overflow: 'auto',
                                    height: '100%',
                                }"
                            >
                                <!-- 组件 A: InputPanelUI -->
                                <NCard
                                    :bordered="false"
                                    :style="{
                                        flexShrink: 0,
                                        minHeight: '200px',
                                        borderRadius: 'var(--po-radius-lg)',
                                        boxShadow: 'var(--po-shadow-md)',
                                        transition: 'all var(--po-transition-base)',
                                    }"
                                >
                                    <InputPanelUI
                                        v-model="optimizer.prompt"
                                        v-model:selectedModel="
                                            modelManager.selectedOptimizeModel
                                        "
                                        :label="promptInputLabel"
                                        :placeholder="promptInputPlaceholder"
                                        :model-label="
                                            $t('promptOptimizer.optimizeModel')
                                        "
                                        :model-override-label="
                                            $t('promptOptimizer.modelOverride')
                                        "
                                        :template-label="
                                            $t('promptOptimizer.templateLabel')
                                        "
                                        :button-text="
                                            $t('promptOptimizer.optimize')
                                        "
                                        :loading-text="$t('common.loading')"
                                        :loading="optimizer.isOptimizing"
                                        :disabled="optimizer.isOptimizing"
                                        :show-preview="false"
                                        @submit="handleOptimizePrompt"
                                        @configModel="
                                            modelManager.showConfig = true
                                        "
                                        @open-preview="handleOpenInputPreview"
                                    >
                                        <template #quick-config-button>
                                            <NButton
                                                @click="showQuickModelConfig = true"
                                                type="primary"
                                                size="medium"
                                                ghost
                                            >
                                                <template #icon>
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                                                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                                                        <circle cx="12" cy="12" r="3"/>
                                                    </svg>
                                                </template>
                                                {{ $t('modelManager.quickConfig') }}
                                            </NButton>
                                        </template>
                                        <template #model-select>
                                            <SelectWithConfig
                                                v-model="
                                                    modelManager.selectedOptimizeModel
                                                "
                                                :options="textModelOptions"
                                                :getPrimary="
                                                    OptionAccessors.getPrimary
                                                "
                                                :getSecondary="
                                                    OptionAccessors.getSecondary
                                                "
                                                :getValue="
                                                    OptionAccessors.getValue
                                                "
                                                :placeholder="
                                                    t(
                                                        'model.select.placeholder',
                                                    )
                                                "
                                                size="medium"
                                                :disabled="
                                                    optimizer.isOptimizing
                                                "
                                                filterable
                                                :show-config-action="true"
                                                :show-empty-config-c-t-a="true"
                                                @focus="refreshTextModels"
                                                @config="
                                                    modelManager.showConfig = true
                                                "
                                            />
                                        </template>
                                        <template #model-override-select>
                                            <ModelOverrideSelector
                                                v-model="modelOverrideValue"
                                                :options="modelOverrideOptions"
                                                :loading="isLoadingModelList"
                                                :disabled="optimizer.isOptimizing"
                                                :placeholder="t('promptOptimizer.modelOverridePlaceholder')"
                                                size="medium"
                                                @refresh="handleRefreshModelOverrideList"
                                            />
                                        </template>
                                        <template #template-select>
                                            <template
                                                v-if="
                                                    services &&
                                                    services.templateManager
                                                "
                                            >
                                                <SelectWithConfig
                                                    v-model="
                                                        selectedTemplateIdForSelect
                                                    "
                                                    :options="templateOptions"
                                                    :getPrimary="
                                                        OptionAccessors.getPrimary
                                                    "
                                                    :getSecondary="
                                                        OptionAccessors.getSecondary
                                                    "
                                                    :getValue="
                                                        OptionAccessors.getValue
                                                    "
                                                    :placeholder="
                                                        t('template.select')
                                                    "
                                                    size="medium"
                                                    :disabled="
                                                        optimizer.isOptimizing
                                                    "
                                                    filterable
                                                    :show-config-action="true"
                                                    :show-empty-config-c-t-a="
                                                        true
                                                    "
                                                    @focus="
                                                        refreshOptimizeTemplates
                                                    "
                                                    @config="
                                                        handleOpenOptimizeTemplateManager
                                                    "
                                                />
                                            </template>
                                            <NText
                                                v-else
                                                depth="3"
                                                class="p-2 text-sm"
                                            >
                                                {{
                                                    t("template.loading") ||
                                                    "加载中..."
                                                }}
                                            </NText>
                                        </template>
                                    </InputPanelUI>
                                </NCard>

                                <!-- 组件 B: PromptPanelUI -->
                                <NCard
                                    :bordered="false"
                                    :style="{
                                        flex: 1,
                                        minHeight: '200px',
                                        overflow: 'hidden',
                                        borderRadius: 'var(--po-radius-lg)',
                                        boxShadow: 'var(--po-shadow-md)',
                                        transition: 'all var(--po-transition-base)',
                                    }"
                                    content-style="height: 100%; max-height: 100%; overflow: hidden;"
                                >
                                    <PromptPanelUI
                                        v-if="
                                            services && services.templateManager
                                        "
                                        ref="promptPanelRef"
                                        v-model:optimized-prompt="
                                            optimizer.optimizedPrompt
                                        "
                                        :reasoning="
                                            optimizer.optimizedReasoning
                                        "
                                        :original-prompt="optimizer.prompt"
                                        :is-optimizing="optimizer.isOptimizing"
                                        :is-iterating="optimizer.isIterating"
                                        v-model:selected-iterate-template="
                                            optimizer.selectedIterateTemplate
                                        "
                                        :versions="optimizer.currentVersions"
                                        :current-version-id="
                                            optimizer.currentVersionId
                                        "
                                        :optimization-mode="
                                            selectedOptimizationMode
                                        "
                                        :advanced-mode-enabled="
                                            advancedModeEnabled
                                        "
                                        :show-preview="false"
                                        @iterate="handleIteratePrompt"
                                        @openTemplateManager="
                                            openTemplateManager
                                        "
                                        @switchVersion="handleSwitchVersion"
                                        @save-favorite="handleSaveFavorite"
                                        @open-preview="handleOpenPromptPreview"
                                    />
                                </NCard>
                            </NFlex>

                            <!-- 右侧：测试区域 -->
                            <NCard
                                :bordered="false"
                                :style="{
                                    flex: 1,
                                    overflow: 'auto',
                                    height: '100%',
                                    borderRadius: 'var(--po-radius-lg)',
                                    boxShadow: 'var(--po-shadow-md)',
                                    transition: 'all var(--po-transition-base)',
                                }"
                                content-style="height: 100%; max-height: 100%; overflow: hidden;"
                            >
                                <!-- 使用新的统一TestAreaPanel组件 -->
                                <TestAreaPanel
                                    ref="testPanelRef"
                                    :optimization-mode="
                                        selectedOptimizationMode
                                    "
                                    :context-mode="contextMode"
                                    :optimized-prompt="
                                        optimizer.optimizedPrompt
                                    "
                                    :is-test-running="false"
                                    :global-variables="
                                        variableManager?.customVariables?.value ||
                                        {}
                                    "
                                    :predefined-variables="predefinedVariables"
                                    v-model:test-content="testContent"
                                    v-model:is-compare-mode="isCompareMode"
                                    :enable-compare-mode="true"
                                    :enable-fullscreen="true"
                                    :show-model-override="true"
                                    :input-mode="
                                        responsiveLayout.recommendedInputMode
                                            .value
                                    "
                                    :control-bar-layout="
                                        responsiveLayout
                                            .recommendedControlBarLayout.value
                                    "
                                    :button-size="
                                        responsiveLayout.smartButtonSize.value
                                    "
                                    :conversation-max-height="
                                        responsiveLayout.responsiveHeights.value
                                            .conversationMax
                                    "
                                    :show-original-result="true"
                                    :result-vertical-layout="
                                        responsiveLayout.isMobile.value
                                    "
                                    @test="handleTestAreaTest"
                                    @compare-toggle="
                                        handleTestAreaCompareToggle
                                    "
                                    @open-variable-manager="
                                        handleOpenVariableManager
                                    "
                                >
                                    <!-- 模型选择插槽 -->
                                    <template #model-select>
                                        <SelectWithConfig
                                            v-model="
                                                modelManager.selectedTestModel
                                            "
                                            :options="textModelOptions"
                                            :getPrimary="
                                                OptionAccessors.getPrimary
                                            "
                                            :getSecondary="
                                                OptionAccessors.getSecondary
                                            "
                                            :getValue="OptionAccessors.getValue"
                                            :placeholder="
                                                t('model.select.placeholder')
                                            "
                                            size="medium"
                                            filterable
                                            :show-config-action="true"
                                            :show-empty-config-c-t-a="true"
                                            @focus="refreshTextModels"
                                            @config="
                                                modelManager.showConfig = true
                                            "
                                        />
                                    </template>

                                    <!-- 模型覆盖选择插槽 -->
                                    <template #model-override-select>
                                        <ModelOverrideSelector
                                            v-model="modelOverrideValue"
                                            :options="modelOverrideOptions"
                                            :loading="isLoadingModelList"
                                            :placeholder="t('promptOptimizer.modelOverridePlaceholder')"
                                            size="medium"
                                            @refresh="handleRefreshModelOverrideList"
                                        />
                                    </template>

                                    <!-- 原始结果插槽 -->
                                    <template #original-result>
                                        <OutputDisplay
                                            :content="
                                                testResults.originalResult
                                            "
                                            :reasoning="
                                                testResults.originalReasoning
                                            "
                                            :streaming="
                                                testResults.isTestingOriginal
                                            "
                                            :enableDiff="false"
                                            mode="readonly"
                                            :style="{
                                                height: '100%',
                                                minHeight: '0',
                                            }"
                                        />
                                    </template>

                                    <!-- 优化结果插槽 -->
                                    <template #optimized-result>
                                        <OutputDisplay
                                            :content="
                                                testResults.optimizedResult
                                            "
                                            :reasoning="
                                                testResults.optimizedReasoning
                                            "
                                            :streaming="
                                                testResults.isTestingOptimized
                                            "
                                            :enableDiff="false"
                                            mode="readonly"
                                            :style="{
                                                height: '100%',
                                                minHeight: '0',
                                            }"
                                        />
                                    </template>

                                    <!-- 单一结果插槽 -->
                                    <template #single-result>
                                        <OutputDisplay
                                            :content="
                                                testResults.optimizedResult
                                            "
                                            :reasoning="
                                                testResults.optimizedReasoning
                                            "
                                            :streaming="
                                                testResults.isTestingOptimized
                                            "
                                            :enableDiff="false"
                                            mode="readonly"
                                            :style="{
                                                height: '100%',
                                                minHeight: '0',
                                            }"
                                        />
                                    </template>
                                </TestAreaPanel>
                            </NCard>
                        </NFlex>
                    </template>
                    <!-- 图像模式：渲染新的工作区组件，不破坏现有结构 -->
                    <template v-else>
                        <ImageWorkspace />
                    </template>
                </template>
            </MainLayoutUI>

            <!-- Modals and Drawers that are conditionally rendered -->
            <ModelManagerUI
                v-if="isReady"
                v-model:show="modelManager.showConfig"
                @update:show="
                    (v: boolean) => {
                        if (!v) handleModelManagerClosed();
                    }
                "
            />
            <TemplateManagerUI
                v-if="isReady"
                v-model:show="templateManagerState.showTemplates"
                :templateType="templateManagerState.currentType"
                @close="handleTemplateManagerClosed"
                @languageChanged="handleTemplateLanguageChanged"
            />
            <HistoryDrawerUI
                v-if="isReady"
                v-model:show="historyManager.showHistory"
                :history="promptHistory.history"
                @reuse="handleHistoryReuse"
                @clear="promptHistory.handleClearHistory"
                @deleteChain="promptHistory.handleDeleteChain"
            />
            <DataManagerUI
                v-if="isReady"
                v-model:show="showDataManager"
                @imported="handleDataImported"
            />

            <!-- 收藏管理对话框 -->
            <FavoriteManagerUI
                v-if="isReady"
                :show="showFavoriteManager"
                @update:show="
                    (v: boolean) => {
                        if (!v) showFavoriteManager = false;
                    }
                "
                @optimize-prompt="handleFavoriteOptimizePrompt"
                @use-favorite="handleUseFavorite"
            />

            <!-- 保存收藏对话框 -->
            <SaveFavoriteDialog
                v-if="isReady"
                v-model:show="showSaveFavoriteDialog"
                :content="saveFavoriteData?.content || ''"
                :original-content="saveFavoriteData?.originalContent || ''"
                :current-function-mode="functionMode"
                :current-optimization-mode="selectedOptimizationMode"
                @saved="handleSaveFavoriteComplete"
            />

            <!-- 变量管理弹窗 -->
            <VariableManagerModal
                v-if="isReady"
                v-model:visible="showVariableManager"
                :variable-manager="variableManager"
                :focus-variable="focusVariableName"
            />

            <!-- 上下文编辑器弹窗 -->
            <ContextEditor
                v-if="isReady"
                v-model:visible="showContextEditor"
                :state="contextEditorState"
                :services="servicesForContextEditor"
                :variable-manager="variableManager"
                :optimization-mode="selectedOptimizationMode"
                :context-mode="contextMode"
                :scan-variables="
                    (content) =>
                        variableManager?.variableManager.value?.scanVariablesInContent(
                            content,
                        ) || []
                "
                :replace-variables="
                    (content, vars) =>
                        variableManager?.variableManager.value?.replaceVariables(
                            content,
                            vars,
                        ) || content
                "
                :defaultTab="contextEditorDefaultTab"
                :only-show-tab="contextEditorOnlyShowTab"
                :title="contextEditorTitle"
                @update:state="handleContextEditorStateUpdate"
                @save="handleContextEditorSave"
                @cancel="handleContextEditorCancel"
                @open-variable-manager="handleOpenVariableManager"
            />

            <!-- 🆕 提示词预览面板 -->
            <PromptPreviewPanel
                v-if="isReady"
                :show="showPreviewPanel"
                @update:show="showPreviewPanel = $event"
                :previewContent="promptPreview.previewContent.value"
                :missingVariables="promptPreview.missingVariables.value"
                :hasMissingVariables="promptPreview.hasMissingVariables.value"
                :variableStats="promptPreview.variableStats.value"
                :contextMode="contextMode"
                :renderPhase="renderPhase"
            />

            <!-- API Key 设置弹窗 -->
            <ApiKeySetupModal
                v-model:show="showApiKeySetup"
                @submit="handleApiKeySetupSubmit"
                @error="toast.error"
            />

            <!-- 快速模型配置弹窗 -->
            <QuickModelConfig
                v-if="isReady"
                v-model:show="showQuickModelConfig"
                :services="services"
                @model-saved="refreshTextModels"
            />

            <!-- 关键:使用NGlobalStyle同步全局样式到body,消除CSS依赖 -->
            <NGlobalStyle />

            <!-- ToastUI已在MainLayoutUI中包含，无需重复渲染 -->
        </template>
    </NConfigProvider>
</template>

<script setup lang="ts">
import {
    ref,
    watch,
    provide,
    computed,
    shallowRef,
    toRef,
    nextTick,
    onMounted,
    type Ref,
} from "vue";
import { useI18n } from "vue-i18n";
import {
    NConfigProvider,
    NGlobalStyle,
    NButton,
    NText,
    NGrid,
    NGridItem,
    NCard,
    NFlex,
    NModal,
    NScrollbar,
    NSpace,
    useMessage,
} from "naive-ui";
import hljs from "highlight.js/lib/core";
import jsonLang from "highlight.js/lib/languages/json";
hljs.registerLanguage("json", jsonLang);
import {
    // UI Components
    MainLayoutUI,
    ThemeToggleUI,
    ActionButtonUI,
    ModelManagerUI,
    TemplateManagerUI,
    HistoryDrawerUI,
    LanguageSwitchDropdown,
    DataManagerUI,
    InputPanelUI,
    PromptPanelUI,
    OptimizationModeSelectorUI,
    SelectWithConfig,
    TestAreaPanel,
    UpdaterIcon,
    VariableManagerModal,
    ImageWorkspace,
    ImageModeSelector,
    FunctionModeSelector,
    ConversationManager,
    OutputDisplay,
    ContextEditor,
    FavoriteManagerUI,
    QuickModelConfig,
    ApiKeySetupModal,
    SaveFavoriteDialog,
    ContextModeActions,
    PromptPreviewPanel,
    ContextSystemWorkspace,
    ContextUserWorkspace,
    ModelOverrideSelector,

    // Composables
    usePromptOptimizer,
    useToast,
    useHistoryManager,
    useModelManager,
    useTemplateManager,
    useAppInitializer,
    usePromptHistory,
    useModelSelectRefs,
    useVariableManager,
    useNaiveTheme,
    useResponsiveTestLayout,
    useTestModeConfig,
    useFunctionMode,
    useBasicSubMode,
    useProSubMode,
    useImageSubMode,
    usePromptPreview,
    usePromptTester,
    useContextManagement,
    useAggregatedVariables,
    useContextEditorUIState,

    // i18n functions
    initializeI18nWithStorage,
    setI18nServices,

    // Types from UI package
    type OptimizationMode,
    type ConversationMessage,

    // Quick Template Manager
    quickTemplateManager,

    // Data Transformation
    DataTransformer,
    OptionAccessors,
} from "@prompt-optimizer/ui";
import type {
    IPromptService,
    Template,
    ModelConfig,
} from "@prompt-optimizer/core";
import type {
    ModelSelectOption,
    TemplateSelectOption,
    TestAreaPanelInstance,
} from "@prompt-optimizer/ui";

// 1. 基础 composables
// highlight.js for Naive NCode
const hljsInstance = hljs;
const { t } = useI18n();
const toast = useToast();

// 2. 初始化应用服务
const { services, isInitializing } = useAppInitializer();

// 3. Initialize i18n with storage when services are ready
watch(
    services,
    async (newServices) => {
        if (newServices) {
            // 首先设置服务引用
            setI18nServices(newServices);
            // 然后初始化语言设置
            await initializeI18nWithStorage();
            console.log("[Web] i18n initialized");

            // 检查是否有配置的 API Key
            await checkApiKeySetup(newServices);

            // 移除：高级模式设置的独立加载（改为 useFunctionMode 管理）
        }
    },
    { immediate: true },
);

// 检查 API Key 配置
const checkApiKeySetup = async (services: any) => {
    try {
        const models = await services.modelManager.getAllModels();
        const hasValidApiKey = models.some((model: any) => 
            model.enabled && model.connectionConfig?.apiKey
        );
        
        if (!hasValidApiKey) {
            // 延迟显示弹窗，确保 UI 已完全加载
            await nextTick();
            setTimeout(() => {
                showApiKeySetup.value = true;
            }, 500);
        }
    } catch (error) {
        console.error('[Web] Failed to check API key setup:', error);
    }
};

// 处理 API Key 设置提交
const handleApiKeySetupSubmit = async (data: { apiKey: string }) => {
    if (!services.value?.modelManager) return;
    
    try {
        // 获取所有模型配置
        const allModels = await services.value.modelManager.getAllModels();
        
        // 更新所有模型的 API Key
        const modelKeysToUpdate = ['claude', 'openai', 'gemini', 'grok'];
        
        for (const key of modelKeysToUpdate) {
            const existingModel = allModels.find((m: any) => m.id === key);
            
            if (existingModel) {
                // 更新现有模型的 API Key
                await services.value.modelManager.updateModel(key, {
                    connectionConfig: {
                        ...existingModel.connectionConfig,
                        apiKey: data.apiKey
                    }
                });
            }
        }
        
        await refreshTextModels();
        toast.success('API Key 已配置到所有模型');
    } catch (error: any) {
        console.error('配置 API Key 失败:', error);
        toast.error(`配置失败: ${error.message || '未知错误'}`);
    }
};

// 4. 向子组件提供服务
provide("services", services);

// 5. 控制主UI渲染的标志
const isReady = computed(() => !!services.value && !isInitializing.value);

// 创建 ContextEditor 使用的 services 引用
const servicesForContextEditor = computed(() => services?.value || null);

// 6. 创建所有必要的引用
const promptService = shallowRef<IPromptService | null>(null);
const selectedOptimizationMode = ref<OptimizationMode>("user");
const showDataManager = ref(false);
const showFavoriteManager = ref(false);
const showSaveFavoriteDialog = ref(false);
const showApiKeySetup = ref(false);
const showQuickModelConfig = ref(false);
const saveFavoriteData = ref<{
    content: string;
    originalContent?: string;
} | null>(null);
const optimizeModelSelect = ref(null);

// 模型覆盖选择器状态
const modelOverrideValue = ref<string | undefined>(undefined);
const modelOverrideOptions = ref<Array<{ label: string; value: string }>>([]);
const isLoadingModelList = ref(false);

type ContextWorkspaceExpose = {
    testAreaPanelRef?: Ref<TestAreaPanelInstance | null>;
};

const testPanelRef = ref<TestAreaPanelInstance | null>(null);
const systemWorkspaceRef = ref<ContextWorkspaceExpose | null>(null);
const userWorkspaceRef = ref<ContextWorkspaceExpose | null>(null);
const promptPanelRef = ref<{
    refreshIterateTemplateSelect?: () => void;
} | null>(null);

// 高级模式状态
const { functionMode, setFunctionMode } = useFunctionMode(services as any);

// 三种功能模式的子模式持久化（独立存储）
const { basicSubMode, setBasicSubMode } = useBasicSubMode(services as any);
const { proSubMode, setProSubMode } = useProSubMode(services as any);
const { imageSubMode, setImageSubMode } = useImageSubMode(services as any);

const advancedModeEnabled = computed({
    get: () => functionMode.value === "pro",
    set: (val: boolean) => {
        setFunctionMode(val ? "pro" : "basic");
    },
});

// 处理功能模式变化
const handleModeSelect = async (mode: "basic" | "pro" | "image") => {
    await setFunctionMode(mode);

    // 恢复各功能模式独立的子模式状态
    if (mode === "basic") {
        const { ensureInitialized } = useBasicSubMode(services as any);
        await ensureInitialized();
        selectedOptimizationMode.value = basicSubMode.value as OptimizationMode;
        // 同步 contextMode，确保测试输入框正确显示
        contextMode.value = basicSubMode.value as import("@prompt-optimizer/core").ContextMode;
    } else if (mode === "pro") {
        const { ensureInitialized } = useProSubMode(services as any);
        await ensureInitialized();
        selectedOptimizationMode.value = proSubMode.value as OptimizationMode;
        // 同步到 contextMode（关键！否则界面不会切换）
        await handleContextModeChange(
            proSubMode.value as import("@prompt-optimizer/core").ContextMode,
        );
    } else if (mode === "image") {
        const { ensureInitialized } = useImageSubMode(services as any);
        await ensureInitialized();
    }
};

// 测试内容状态 - 新增
const testContent = ref("");
const isCompareMode = ref(true);

// 响应式布局和模式配置 - 新增
const responsiveLayout = useResponsiveTestLayout();
const testModeConfig = useTestModeConfig(selectedOptimizationMode);

// Naive UI 主题配置 - 使用新的主题系统
const { naiveTheme, themeOverrides, initTheme } = useNaiveTheme();

// 初始化主题系统
if (typeof window !== "undefined") {
    initTheme();
}

// 取消独立的高级模式偏好读写，改由 useFunctionMode 统一管理（默认 basic）

// 变量管理状态
const showVariableManager = ref(false);
const focusVariableName = ref<string | undefined>(undefined);

// 上下文模式 - 需要在模板中使用,所以提前声明
const contextMode = ref<import("@prompt-optimizer/core").ContextMode>("system");

// 上下文编辑器状态
const showContextEditor = ref(false);
const contextEditorDefaultTab = ref<"messages" | "variables" | "tools">(
    "messages",
);

// 使用 composable 管理编辑器 UI 状态
const {
    onlyShowTab: contextEditorOnlyShowTab,
    title: contextEditorTitle,
    handleCancel: handleContextEditorCancel,
    openWithTab: openContextEditorWithTab,
} = useContextEditorUIState(showContextEditor, t);

const contextEditorState = ref({
    messages: [] as ConversationMessage[],
    // variables 已移除 - 临时变量由 useTemporaryVariables() 全局管理
    tools: [] as any[],
    showVariablePreview: true,
    showToolManager: false,
    mode: "edit" as "edit" | "preview",
});

// 🆕 提示词预览面板状态
const showPreviewPanel = ref(false);

// 变量管理器实例（必须在使用前声明）
const variableManager = useVariableManager(services as any);

// 使用聚合变量管理器（自动合并预定义 + 全局 + 临时变量）
const aggregatedVariables = useAggregatedVariables(variableManager);
// 🆕 使用 usePromptPreview composable 实时预览提示词
const promptPreviewContent = ref(""); // 改为 ref，动态设置内容
const promptPreviewVariables = computed(() => {
    // 🆕 aggregatedVariables 已自动聚合所有变量（预定义 + 全局 + 临时）
    // 临时变量由 useTemporaryVariables() 全局管理，无需从 contextEditorState 获取
    return aggregatedVariables.allVariables.value;
});

// 渲染阶段（用于预览）
const renderPhase = ref<"optimize" | "test">("optimize");

const promptPreview = usePromptPreview(
    promptPreviewContent,
    promptPreviewVariables,
    contextMode,
    renderPhase,
);

// 预览处理函数
const handleOpenInputPreview = () => {
    promptPreviewContent.value = optimizer.prompt || "";
    renderPhase.value = "test"; // 使用 test 模式，替换所有变量
    showPreviewPanel.value = true;
};

const handleOpenPromptPreview = () => {
    promptPreviewContent.value = optimizer.optimizedPrompt || "";
    renderPhase.value = "test"; // 使用 test 模式，替换所有变量
    showPreviewPanel.value = true;
};

// 变量管理器实例

const templateSelectType = computed<
    | "optimize"
    | "userOptimize"
    | "iterate"
    | "contextSystemOptimize"
    | "contextUserOptimize"
>(() => {
    const isPro = advancedModeEnabled.value;
    if (selectedOptimizationMode.value === "system") {
        return isPro ? "contextSystemOptimize" : "optimize";
    }
    return isPro ? "contextUserOptimize" : "userOptimize";
});

// 变量管理处理函数
const handleCreateVariable = (name: string, defaultValue?: string) => {
    // 创建新变量并打开变量管理器
    if (variableManager?.variableManager.value) {
        variableManager.variableManager.value.setVariable(
            name,
            defaultValue || "",
        );
    }
    focusVariableName.value = name;
    showVariableManager.value = true;
};

const handleOpenVariableManager = (variableName?: string) => {
    // 打开变量管理器并聚焦到指定变量
    if (variableName) {
        focusVariableName.value = variableName;
    }
    showVariableManager.value = true;
};

// 上下文管理将在初始化 optimizer 后通过 useContextManagement 提供

// 6. 在顶层调用所有 Composables
// 模型选择器引用管理
const modelSelectRefs = useModelSelectRefs();

// 使用类型断言解决类型不匹配问题
// 模型管理器
const modelManager = useModelManager(services as any, modelSelectRefs);

// 提示词优化器
const optimizer = usePromptOptimizer(
    services as any,
    selectedOptimizationMode,
    toRef(modelManager, "selectedOptimizeModel"),
    toRef(modelManager, "selectedTestModel"),
    contextMode, // 使用提前声明的 contextMode
);

// 上下文管理
const contextManagement = useContextManagement({
    services,
    selectedOptimizationMode,
    advancedModeEnabled,
    showContextEditor,
    contextEditorDefaultTab,
    contextEditorState,
    variableManager,
    optimizer,
});

// 从 contextManagement 提取其他状态和方法 (contextMode 除外,已在前面声明)
const optimizationContext = contextManagement.optimizationContext;
const optimizationContextTools = contextManagement.optimizationContextTools;
const predefinedVariables = contextManagement.predefinedVariables;
const initializeContextPersistence =
    contextManagement.initializeContextPersistence;
const handleOpenContextEditor = contextManagement.handleOpenContextEditor;
const handleContextEditorSave = contextManagement.handleContextEditorSave;
const handleContextEditorStateUpdate =
    contextManagement.handleContextEditorStateUpdate;
const handleContextModeChange = contextManagement.handleContextModeChange;

// 🆕 提示词测试管理（支持变量注入、上下文、工具调用）
const promptTester = usePromptTester(
    services as any,
    toRef(modelManager, 'selectedTestModel'),
    selectedOptimizationMode,
    advancedModeEnabled,
    optimizationContext,
    optimizationContextTools,
    variableManager
);

// 测试结果引用（从 promptTester 获取）
const testResults = computed(() => promptTester.testResults);

// 处理测试面板的变量变化（现在测试变量由TestAreaPanel自己管理，不需要同步到会话）
const handleTestPanelVariableChange = async (name: string, value: string) => {
    // 测试变量现在只在TestAreaPanel内部管理，不需要外部同步
};

// 🆕 处理保存测试变量到全局
const handleSaveToGlobal = async (name: string, value: string) => {
    if (!variableManager) {
        console.warn("[App] variableManager not ready");
        return;
    }

    try {
        variableManager.updateVariable(name, value);
        toast.success(t('test.variables.savedToGlobal', { name }));
    } catch (error) {
        console.error("[App] Failed to save variable to global:", error);
        toast.error(t('test.error.saveToGlobalFailed', { name }));
    }
};

// 同步 contextManagement 中的 contextMode 到我们的 contextMode ref
watch(
    contextManagement.contextMode,
    async (newMode) => {
        contextMode.value = newMode;

        // Phase 1: 当 contextMode 变化时，如果在上下文模式下，持久化子模式
        if (functionMode.value === "pro") {
            await setProSubMode(
                newMode as import("@prompt-optimizer/core").ProSubMode,
            );
            selectedOptimizationMode.value = newMode as OptimizationMode;
        }
    },
    { immediate: true },
);

// 提示词历史
const promptHistory = usePromptHistory(
    services as any,
    toRef(optimizer, "prompt") as any,
    toRef(optimizer, "optimizedPrompt") as any,
    toRef(optimizer, "currentChainId") as any,
    toRef(optimizer, "currentVersions") as any,
    toRef(optimizer, "currentVersionId") as any,
);

// 提供全局历史实例给子组件复用
provide("promptHistory", promptHistory);

// 历史管理器
const historyManager = useHistoryManager(
    services as any,
    optimizer.prompt as any,
    optimizer.optimizedPrompt as any,
    optimizer.currentChainId as any,
    optimizer.currentVersions as any,
    optimizer.currentVersionId as any,
    promptHistory.handleSelectHistory,
    promptHistory.handleClearHistory,
    promptHistory.handleDeleteChain as any,
);

// 模板管理器
const templateManagerState = useTemplateManager(services as any, {
    selectedOptimizeTemplate: toRef(optimizer, "selectedOptimizeTemplate"),
    selectedUserOptimizeTemplate: toRef(
        optimizer,
        "selectedUserOptimizeTemplate",
    ),
    selectedIterateTemplate: toRef(optimizer, "selectedIterateTemplate"),
});

const currentSelectedTemplate = computed({
    get() {
        return selectedOptimizationMode.value === "system"
            ? optimizer.selectedOptimizeTemplate
            : optimizer.selectedUserOptimizeTemplate;
    },
    set(newValue) {
        if (!newValue) return;
        if (selectedOptimizationMode.value === "system") {
            optimizer.selectedOptimizeTemplate = newValue;
        } else {
            optimizer.selectedUserOptimizeTemplate = newValue;
        }
    },
});

const templateOptions = ref<TemplateSelectOption[]>([]);
const textModelOptions = ref<ModelSelectOption[]>([]);

const handleOpenOptimizeTemplateManager = () => {
    const type = templateSelectType.value;
    openTemplateManager(type as any);
};

const clearCurrentTemplateSelection = () => {
    if (selectedOptimizationMode.value === "system") {
        optimizer.selectedOptimizeTemplate = null;
    } else {
        optimizer.selectedUserOptimizeTemplate = null;
    }
};

const ensureTemplateSelection = () => {
    const current = currentSelectedTemplate.value;
    const available = templateOptions.value;

    if (current) {
        const matched = available.find((t) => t.raw.id === current.id);
        if (matched) {
            if (matched.raw !== current) {
                currentSelectedTemplate.value = matched.raw;
            }
            return;
        }
    }

    if (available.length > 0) {
        currentSelectedTemplate.value = available[0].raw;
    } else {
        clearCurrentTemplateSelection();
    }
};

const refreshOptimizeTemplates = async () => {
    if (!services.value?.templateManager) {
        templateOptions.value = [];
        clearCurrentTemplateSelection();
        return;
    }

    try {
        const list = await services.value.templateManager.listTemplatesByType(
            templateSelectType.value as any,
        );
        templateOptions.value = DataTransformer.templatesToSelectOptions(
            list || [],
        );
    } catch (error) {
        console.warn("[App] Failed to refresh optimize templates:", error);
        templateOptions.value = [];
    }

    ensureTemplateSelection();
};

const refreshTextModels = async () => {
    if (!services.value?.modelManager) {
        textModelOptions.value = [];
        return;
    }

    try {
        const manager = services.value.modelManager;
        if (typeof (manager as any).ensureInitialized === "function") {
            await (manager as any).ensureInitialized();
        }
        const enabledModels = await manager.getEnabledModels();
        textModelOptions.value =
            DataTransformer.modelsToSelectOptions(enabledModels);

        const availableKeys = new Set(
            textModelOptions.value.map((opt) => opt.value),
        );
        const fallbackValue = textModelOptions.value[0]?.value || "";
        const selectionReady = modelManager.isModelSelectionReady;

        if (fallbackValue && selectionReady) {
            if (!availableKeys.has(modelManager.selectedOptimizeModel)) {
                modelManager.selectedOptimizeModel = fallbackValue;
            }
            if (!availableKeys.has(modelManager.selectedTestModel)) {
                modelManager.selectedTestModel = fallbackValue;
            }
        }
    } catch (error) {
        console.warn("[App] Failed to refresh text models:", error);
        textModelOptions.value = [];
    }
};

// 获取可用模型列表（用于模型覆盖选择器）
const handleRefreshModelOverrideList = async () => {
    if (!services.value?.llmService || !modelManager.selectedOptimizeModel) {
        toast.error(t('toast.error.noModelSelected'));
        return;
    }

    try {
        isLoadingModelList.value = true;
        const provider = modelManager.selectedOptimizeModel;
        const models = await services.value.llmService.fetchModelList(provider);
        modelOverrideOptions.value = models;
        
        if (models.length > 0) {
            toast.success(t('toast.success.modelListFetched', { count: models.length }));
        } else {
            toast.warning(t('toast.warning.noModelsAvailable'));
        }
    } catch (error: any) {
        console.error('[App] Failed to fetch model list:', error);
        toast.error(t('toast.error.fetchModelListFailed') + ': ' + error.message);
        modelOverrideOptions.value = [];
    } finally {
        isLoadingModelList.value = false;
    }
};

const selectedTemplateIdForSelect = computed<string>({
    get() {
        const current = currentSelectedTemplate.value;
        if (!current) return "";
        return templateOptions.value.some((t) => t.raw.id === current.id)
            ? current.id
            : "";
    },
    set(id: string) {
        if (!id) {
            clearCurrentTemplateSelection();
            return;
        }
        const tpl = templateOptions.value.find((t) => t.raw.id === id);
        if (tpl) {
            currentSelectedTemplate.value = tpl.raw;
        }
    },
});

watch(
    () => services.value?.templateManager,
    async (manager) => {
        if (manager) {
            await refreshOptimizeTemplates();
        } else {
            templateOptions.value = [];
            clearCurrentTemplateSelection();
        }
    },
    { immediate: true },
);

watch(
    () => services.value?.modelManager,
    async (manager) => {
        if (manager) {
            await refreshTextModels();
        } else {
            textModelOptions.value = [];
        }
    },
    { immediate: true },
);

watch(
    () => modelManager.selectedOptimizeModel,
    async (newModel) => {
        if (newModel && services.value?.llmService) {
            modelOverrideValue.value = undefined;
            await handleRefreshModelOverrideList();
            if (modelOverrideOptions.value.length > 0) {
                modelOverrideValue.value = modelOverrideOptions.value[0].value;
            }
        }
    },
);

watch(
    () => templateSelectType.value,
    async () => {
        await refreshOptimizeTemplates();
    },
);

// 7. 监听服务初始化
watch(services, async (newServices) => {
    if (!newServices) return;

    // 设置服务引用
    promptService.value = newServices.promptService;

    // 初始化上下文持久化
    await initializeContextPersistence();

    // 确保功能模式已初始化（默认 basic）
    // useFunctionMode 内部已处理默认值与持久化

    // Phase 1: 初始化各功能模式的子模式持久化
    // 根据当前功能模式，从存储恢复对应的子模式选择
    if (functionMode.value === "basic") {
        const { ensureInitialized } = useBasicSubMode(services as any);
        await ensureInitialized();
        // 同步到 selectedOptimizationMode 以保持兼容性
        selectedOptimizationMode.value = basicSubMode.value as OptimizationMode;
    } else if (functionMode.value === "pro") {
        const { ensureInitialized } = useProSubMode(services as any);
        await ensureInitialized();
        // 同步到 selectedOptimizationMode 以保持兼容性
        selectedOptimizationMode.value = proSubMode.value as OptimizationMode;
        // 同步到 contextMode（关键！否则界面不会切换）
        await handleContextModeChange(
            proSubMode.value as import("@prompt-optimizer/core").ContextMode,
        );
    } else if (functionMode.value === "image") {
        const { ensureInitialized } = useImageSubMode(services as any);
        await ensureInitialized();
    }

    // 监听全局历史刷新事件（来自图像模式）
    const handleGlobalHistoryRefresh = () => {
        promptHistory.initHistory();
    };
    window.addEventListener(
        "prompt-optimizer:history-refresh",
        handleGlobalHistoryRefresh,
    );
});

// 8. 处理数据导入成功后的刷新
const handleDataImported = () => {
    // 显示成功提示，然后刷新页面
    useToast().success(t("dataManager.import.successWithRefresh"));

    // 延迟一点时间让用户看到成功提示，然后刷新页面
    setTimeout(() => {
        window.location.reload();
    }, 1500);
};

// 处理优化提示词
const handleOptimizePrompt = () => {
    // 检查是否需要传递高级上下文
    if (advancedModeEnabled.value) {
        // 构建高级上下文
        const advancedContext = {
            variables:
                variableManager?.variableManager.value?.resolveAllVariables() ||
                {},
            messages:
                optimizationContext.value.length > 0
                    ? optimizationContext.value
                    : undefined,
            tools:
                optimizationContextTools.value.length > 0
                    ? optimizationContextTools.value
                    : undefined, // 🆕 添加工具传递
        };

        // 使用带上下文的优化，传递 modelOverride
        optimizer.handleOptimizePromptWithContext(advancedContext, modelOverrideValue.value);
    } else {
        // 使用基础优化，传递 modelOverride
        optimizer.handleOptimizePrompt(modelOverrideValue.value);
    }
};

// 处理迭代提示词
const handleIteratePrompt = (payload: any) => {
    optimizer.handleIteratePrompt(payload);
};

// 处理切换版本
const handleSwitchVersion = (versionId: any) => {
    optimizer.handleSwitchVersion(versionId);
};

// 处理高级模式变化
const handleAdvancedModeChange = (enabled: boolean) => {
    advancedModeEnabled.value = enabled;
};

// 切换高级模式（导航菜单使用）
const toggleAdvancedMode = async () => {
    const next = !advancedModeEnabled.value;
    advancedModeEnabled.value = next;
    console.log(
        `[App] Advanced mode ${next ? "enabled" : "disabled"} (toggled from navigation)`,
    );
};

// 打开变量管理器
const openVariableManager = (variableName?: string) => {
    // 强制刷新变量管理器数据
    if (variableManager?.refresh) {
        variableManager.refresh();
    }
    // 设置要聚焦的变量名
    focusVariableName.value = variableName;
    showVariableManager.value = true;
};

// 监听变量管理器关闭，清理聚焦变量
watch(showVariableManager, (newValue) => {
    if (!newValue) {
        focusVariableName.value = undefined;
    }
});

// 监听高级模式和优化模式变化，自动加载默认快速模板
watch(
    [advancedModeEnabled, selectedOptimizationMode],
    ([newAdvancedMode, newOptimizationMode]) => {
        // 当启用高级模式时，根据优化模式自动加载默认快速模板
        if (newAdvancedMode) {
            // 如果当前没有优化上下文或者是空的，则设置默认模板
            if (
                !optimizationContext.value ||
                optimizationContext.value.length === 0
            ) {
                try {
                    // 根据优化模式获取默认模板
                    const defaultTemplate = quickTemplateManager.getTemplate(
                        newOptimizationMode,
                        "default",
                    );

                    if (defaultTemplate && defaultTemplate.messages) {
                        optimizationContext.value = [
                            ...defaultTemplate.messages,
                        ];
                        console.log(
                            `[App] Auto-loaded default ${newOptimizationMode} template: ${defaultTemplate.name}`,
                        );
                    } else {
                        // 如果获取模板失败，回退到硬编码逻辑
                        console.warn(
                            `[App] Failed to load default ${newOptimizationMode} template, using fallback`,
                        );
                        if (newOptimizationMode === "system") {
                            optimizationContext.value = [
                                {
                                    role: "system",
                                    content: "{{currentPrompt}}",
                                },
                                { role: "user", content: "{{userQuestion}}" },
                            ];
                        } else if (newOptimizationMode === "user") {
                            optimizationContext.value = [
                                { role: "user", content: "{{currentPrompt}}" },
                            ];
                        }
                    }
                } catch (error) {
                    // 如果获取模板失败，回退到硬编码逻辑
                    console.warn(
                        "[App] Failed to load default template, using fallback logic:",
                        error,
                    );
                    if (newOptimizationMode === "system") {
                        optimizationContext.value = [
                            { role: "system", content: "{{currentPrompt}}" },
                            { role: "user", content: "{{userQuestion}}" },
                        ];
                        console.log(
                            "[App] Auto-loaded fallback template for system prompt optimization",
                        );
                    } else if (newOptimizationMode === "user") {
                        optimizationContext.value = [
                            { role: "user", content: "{{currentPrompt}}" },
                        ];
                        console.log(
                            "[App] Auto-loaded fallback template for user prompt optimization",
                        );
                    }
                }
            }
        }
    },
    { immediate: false }, // 不立即执行，只在变化时执行
);

// 打开GitHub仓库
const openGithubRepo = async () => {
    const url = "https://github.com/guanhuhao/prompt-optimizer";

    // 检查是否在Electron环境中
    if (typeof window !== "undefined" && (window as any).electronAPI) {
        try {
            await (window as any).electronAPI.shell.openExternal(url);
        } catch (error) {
            console.error("Failed to open external URL in Electron:", error);
            // 如果Electron API失败，回退到window.open
            window.open(url, "_blank");
        }
    } else {
        // Web环境中使用window.open
        window.open(url, "_blank");
    }
};

// 打开模板管理器
const openTemplateManager = (
    templateType?:
        | "optimize"
        | "userOptimize"
        | "iterate"
        | "text2imageOptimize"
        | "image2imageOptimize"
        | "imageIterate",
) => {
    // 如果传入了模板类型，直接使用；否则根据当前优化模式判断（向后兼容）
    templateManagerState.currentType =
        (templateType as any) ||
        (selectedOptimizationMode.value === "system"
            ? "optimize"
            : "userOptimize");
    templateManagerState.showTemplates = true;
};

// 处理优化模式变更
// 基础模式子模式变更处理器
const handleBasicSubModeChange = async (mode: OptimizationMode) => {
    await setBasicSubMode(
        mode as import("@prompt-optimizer/core").BasicSubMode,
    );
    selectedOptimizationMode.value = mode; // 保持兼容性
    // 同步 contextMode，确保测试输入框正确显示
    contextMode.value = mode as import("@prompt-optimizer/core").ContextMode;
};

// 上下文模式子模式变更处理器
const handleProSubModeChange = async (mode: OptimizationMode) => {
    await setProSubMode(mode as import("@prompt-optimizer/core").ProSubMode);
    selectedOptimizationMode.value = mode; // 保持兼容性

    // 同步更新 contextMode，确保两者一致（避免重复调用）
    if (services.value?.contextMode.value !== mode) {
        await handleContextModeChange(
            mode as import("@prompt-optimizer/core").ContextMode,
        );
    }
};

// 图像模式子模式变更处理器
const handleImageSubModeChange = async (
    mode: import("@prompt-optimizer/core").ImageSubMode,
) => {
    await setImageSubMode(mode);

    // 通知 ImageWorkspace 更新
    if (typeof window !== "undefined") {
        window.dispatchEvent(
            new CustomEvent("image-submode-changed", {
                detail: { mode },
            }),
        );
    }
};

// 🗑️ 废弃的统一处理器（保留兼容性）
const handleOptimizationModeChange = async (mode: OptimizationMode) => {
    console.warn(
        "[App] handleOptimizationModeChange 已废弃，请使用各模式独立的处理器",
    );
    if (functionMode.value === "basic") {
        await handleBasicSubModeChange(mode);
    } else if (functionMode.value === "pro") {
        await handleProSubModeChange(mode);
    }
};

// 处理模板语言变化
const handleTemplateLanguageChanged = (newLanguage: string) => {
    // 刷新主界面的模板选择组件
    refreshOptimizeTemplates();

    // 刷新迭代页面的模板选择组件
    if (promptPanelRef.value?.refreshIterateTemplateSelect) {
        promptPanelRef.value.refreshIterateTemplateSelect();
    }

    // 通知图像模式工作区刷新迭代模板选择
    if (typeof window !== "undefined") {
        window.dispatchEvent(
            new Event("image-workspace-refresh-iterate-select"),
        );
    }
};

// 向子组件提供统一的 openTemplateManager 接口（图像模式复用）
provide("openTemplateManager", openTemplateManager);

// 模板管理器关闭回调：刷新基础模式选择,同时通知图像模式刷新模板列表
const handleTemplateManagerClosed = () => {
    try {
        templateManagerState.handleTemplateManagerClose(() => {
            refreshOptimizeTemplates();
        });
    } catch (e) {
        console.warn("[App] Failed to run template manager close handler:", e);
    }
    refreshOptimizeTemplates();
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("image-workspace-refresh-templates"));
    }
};

// 提供 openModelManager 接口，支持直接定位到文本/图像页签
const openModelManager = (tab: "text" | "image" = "text") => {
    modelManager.showConfig = true;
    // 等模态渲染后再切换页签
    setTimeout(() => {
        if (typeof window !== "undefined") {
            window.dispatchEvent(
                new CustomEvent("model-manager:set-tab", { detail: tab }),
            );
        }
    }, 0);
};
provide("openModelManager", openModelManager);

// 模型管理器关闭回调：同步刷新基础模式下拉，并通知图像模式刷新图像模型
const handleModelManagerClosed = async () => {
    try {
        // 基础模式：复用现有逻辑刷新文本模型与下拉
        modelManager.handleModelManagerClose();
    } catch (e) {
        console.warn(
            "[App] Failed to refresh text models after manager close:",
            e,
        );
    }
    await refreshTextModels();
    // 图像模式：广播刷新图像模型事件（ImageWorkspace 监听并执行刷新）
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("image-workspace-refresh-text-models"));
        window.dispatchEvent(new Event("image-workspace-refresh-image-models"));
    }
};

// 处理历史记录使用 - 智能模式切换
const handleHistoryReuse = async (context: {
    record: any;
    chainId: string;
    rootPrompt: string;
    chain: any;
}) => {
    const { record, chain } = context;
    const rt = chain.rootRecord.type;

    // 🆕 扩展模式切换逻辑 - 支持图像模式
    if (
        rt === "imageOptimize" ||
        rt === "contextImageOptimize" ||
        rt === "imageIterate" ||
        rt === "text2imageOptimize" ||
        rt === "image2imageOptimize"
    ) {
        // 图像模式:只在不是图像模式时才切换
        const needsSwitch = functionMode.value !== "image";
        if (needsSwitch) {
            await setFunctionMode("image");
            useToast().info("已自动切换到图像模式");
        }

        // 🆕 图像模式专用数据回填逻辑
        // 等待模式切换完成后再回填数据
        await nextTick();

        // 根据记录类型设置正确的图像子模式
        const imageMode =
            rt === "text2imageOptimize"
                ? "text2image"
                : rt === "image2imageOptimize"
                  ? "image2image"
                  : "text2image"; // 默认为文生图模式

        // 通过全局事件或直接访问ImageWorkspace的数据来回填
        // 由于ImageWorkspace是独立组件，我们需要通过provide/inject或事件系统来传递数据
        const imageHistoryData = {
            originalPrompt:
                record.originalPrompt || chain.rootRecord.originalPrompt,
            optimizedPrompt: record.optimizedPrompt,
            metadata: record.metadata || chain.rootRecord.metadata,
            chainId: chain.chainId,
            versions: chain.versions,
            currentVersionId: record.id,
            imageMode: imageMode, // 添加图像模式信息
            templateId: record.templateId || chain.rootRecord.templateId, // 添加模板ID以便恢复模板选择
        };

        // 触发图像工作区数据恢复事件
        if (typeof window !== "undefined") {
            window.dispatchEvent(
                new CustomEvent("image-workspace-restore", {
                    detail: imageHistoryData,
                }),
            );
        }

        useToast().success("图像历史记录已恢复");
        return; // 图像模式不需要调用原有的历史记录处理逻辑
    } else {
        // 根据链条的根记录类型确定应该切换到的优化模式
        let targetMode: OptimizationMode;
        if (rt === "optimize" || rt === "contextSystemOptimize") {
            targetMode = "system";
        } else if (rt === "userOptimize" || rt === "contextUserOptimize") {
            targetMode = "user";
        } else {
            // 兜底：从根记录的 metadata 中获取优化模式
            targetMode =
                chain.rootRecord.metadata?.optimizationMode || "system";
        }

        // 如果目标模式与当前模式不同，自动切换
        if (targetMode !== selectedOptimizationMode.value) {
            selectedOptimizationMode.value = targetMode;

            // 根据功能模式分别处理子模式的持久化
            if (functionMode.value === "basic") {
                // 基础模式：持久化子模式选择
                await setBasicSubMode(
                    targetMode as import("@prompt-optimizer/core").BasicSubMode,
                );
            } else if (functionMode.value === "pro") {
                // 上下文模式：持久化子模式并同步 contextMode
                await setProSubMode(
                    targetMode as import("@prompt-optimizer/core").ProSubMode,
                );
                await handleContextModeChange(
                    targetMode as import("@prompt-optimizer/core").ContextMode,
                );
            }

            useToast().info(
                t("toast.info.optimizationModeAutoSwitched", {
                    mode:
                        targetMode === "system"
                            ? t("common.system")
                            : t("common.user"),
                }),
            );
        }

        // 根据根记录类型自动切换功能模式
        const isContext =
            rt === "contextSystemOptimize" ||
            rt === "contextUserOptimize" ||
            rt === "contextIterate";
        await setFunctionMode(isContext ? "pro" : "basic");

        // 调用原有的历史记录处理逻辑
        await promptHistory.handleSelectHistory(context);
    }
};

// 提示词输入标签
const promptInputLabel = computed(() => {
    return selectedOptimizationMode.value === "system"
        ? t("promptOptimizer.originalPrompt")
        : t("promptOptimizer.userPromptInput");
});

// 提示词输入占位符
const promptInputPlaceholder = computed(() => {
    return selectedOptimizationMode.value === "system"
        ? t("promptOptimizer.originalPromptPlaceholder")
        : t("promptOptimizer.userPromptPlaceholder");
});

const getActiveTestPanelInstance = (): TestAreaPanelInstance | null => {
    if (functionMode.value === "pro") {
        if (contextMode.value === "system") {
            return (
                systemWorkspaceRef.value?.testAreaPanelRef?.value ?? null
            );
        }
        return userWorkspaceRef.value?.testAreaPanelRef?.value ?? null;
    }

    if (functionMode.value === "basic") {
        return testPanelRef.value;
    }

    return null;
};

// 真实测试处理函数
const handleTestAreaTest = async (testVariables?: Record<string, string>) => {
    // 调用 promptTester 的 executeTest 方法
    await promptTester.executeTest(
        optimizer.prompt,
        optimizer.optimizedPrompt,
        testContent.value,
        isCompareMode.value,
        testVariables,
        getActiveTestPanelInstance()
    );
};

const handleTestAreaCompareToggle = () => {
    // Compare mode toggle handler
};

// 处理收藏保存请求
const handleSaveFavorite = (data: {
    content: string;
    originalContent?: string;
}) => {
    // 保存数据用于对话框预填充
    saveFavoriteData.value = data;

    // 打开保存对话框
    showSaveFavoriteDialog.value = true;
};

// 处理保存完成
const handleSaveFavoriteComplete = () => {
    // 关闭对话框已由组件内部处理
    // 可选:刷新收藏列表或显示额外提示
};

// 向子组件提供统一的 handleSaveFavorite 接口（图像模式复用）
provide("handleSaveFavorite", handleSaveFavorite);

const handleFavoriteOptimizePrompt = () => {
    // 关闭收藏管理对话框
    showFavoriteManager.value = false;
    // 滚动到优化区域
    nextTick(() => {
        const inputPanel = document.querySelector("[data-input-panel]");
        if (inputPanel) {
            inputPanel.scrollIntoView({ behavior: "smooth" });
        }
    });
};

const handleUseFavorite = async (favorite: any) => {
    // 智能模式切换逻辑,参考 handleHistoryReuse 的实现
    const {
        functionMode: favFunctionMode,
        optimizationMode: favOptimizationMode,
        imageSubMode: favImageSubMode,
    } = favorite;

    // 1. 切换功能模式
    if (favFunctionMode === "image") {
        // 图像模式:只在不是图像模式时才切换
        const needsSwitch = functionMode.value !== "image";
        if (needsSwitch) {
            await setFunctionMode("image");
            useToast().info("已自动切换到图像模式");
        }

        // 图像模式的数据回填逻辑
        await nextTick();

        // 触发图像工作区数据回填事件
        if (typeof window !== "undefined") {
            window.dispatchEvent(
                new CustomEvent("image-workspace-restore-favorite", {
                    detail: {
                        content: favorite.content,
                        imageSubMode: favImageSubMode || "text2image",
                        metadata: favorite.metadata,
                    },
                }),
            );
        }

        useToast().success("收藏的图像提示词已加载");
    } else {
        // 基础模式或上下文模式

        // 2. 切换优化模式
        if (
            favOptimizationMode &&
            favOptimizationMode !== selectedOptimizationMode.value
        ) {
            selectedOptimizationMode.value = favOptimizationMode;

            // 根据功能模式分别处理子模式的持久化
            if (functionMode.value === "basic") {
                // 基础模式：持久化子模式选择
                await setBasicSubMode(
                    favOptimizationMode as import("@prompt-optimizer/core").BasicSubMode,
                );
            } else if (functionMode.value === "pro") {
                // 上下文模式：持久化子模式并同步 contextMode
                await setProSubMode(
                    favOptimizationMode as import("@prompt-optimizer/core").ProSubMode,
                );
                await handleContextModeChange(
                    favOptimizationMode as import("@prompt-optimizer/core").ContextMode,
                );
            }

            useToast().info(
                t("toast.info.optimizationModeAutoSwitched", {
                    mode:
                        favOptimizationMode === "system"
                            ? t("common.system")
                            : t("common.user"),
                }),
            );
        }

        // 3. 切换功能模式(basic vs context)
        const targetFunctionMode =
            favFunctionMode === "context" ? "pro" : "basic";
        if (targetFunctionMode !== functionMode.value) {
            await setFunctionMode(targetFunctionMode);
            useToast().info(
                `已自动切换到${targetFunctionMode === "pro" ? "上下文" : "基础"}模式`,
            );

            // 功能模式切换后，如果有优化模式信息，确保同步各自的子模式持久化
            if (favOptimizationMode) {
                if (targetFunctionMode === "basic") {
                    // 基础模式：持久化子模式选择
                    await setBasicSubMode(
                        favOptimizationMode as import("@prompt-optimizer/core").BasicSubMode,
                    );
                } else if (targetFunctionMode === "pro") {
                    // 上下文模式：持久化子模式并同步 contextMode
                    await setProSubMode(
                        favOptimizationMode as import("@prompt-optimizer/core").ProSubMode,
                    );
                    await handleContextModeChange(
                        favOptimizationMode as import("@prompt-optimizer/core").ContextMode,
                    );
                }
            }
        }

        // 4. 将收藏的提示词内容设置到输入框
        optimizer.prompt = favorite.content;
    }

    // 关闭收藏管理对话框
    showFavoriteManager.value = false;

    // 显示成功提示
    useToast().success("已将提示词加载到输入框");
};
</script>

<style scoped>
/* 高级模式按钮激活状态 */
.active-button {
    background-color: var(--primary-color, #3b82f6) !important;
    color: white !important;
    border-color: var(--primary-color, #3b82f6) !important;
}

.active-button:hover {
    background-color: var(--primary-hover-color, #2563eb) !important;
    border-color: var(--primary-hover-color, #2563eb) !important;
}

.loading-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 1.2rem;
    color: var(--text-color);
    background-color: var(--background-color);
}

.loading-container.error {
    color: #f56c6c;
}

.spinner {
    border: 4px solid rgba(128, 128, 128, 0.2);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border-left-color: var(--primary-color);
    animation: spin 1s ease infinite;
    margin-bottom: 20px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
