<template>
  <NModal
    :show="show"
    preset="card"
    :style="{ width: '90vw', maxWidth: '500px' }"
    :title="$t('dataManager.title')"
    size="large"
    :bordered="false"
    :segmented="true"
    @update:show="(value: boolean) => !value && close()"
  >
    <NSpace vertical :size="24">
      <!-- 导出功能 -->
      <div>
        <NText tag="h3" :depth="1" strong style="font-size: 18px; margin-bottom: 12px;">
          {{ $t('dataManager.export.title') }}
        </NText>
        <NText :depth="3" style="display: block; margin-bottom: 16px;">
          {{ $t('dataManager.export.description') }}
        </NText>
        <NButton
          @click="handleExport"
          :disabled="isExporting"
          type="primary"
          :loading="isExporting"
          block
        >
          <template #icon>
            <NIcon><Download /></NIcon>
          </template>
          {{ isExporting ? $t('common.exporting') : $t('dataManager.export.button') }}
        </NButton>
      </div>

      <!-- 导入功能 -->
      <div>
        <NText tag="h3" :depth="1" strong style="font-size: 18px; margin-bottom: 12px;">
          {{ $t('dataManager.import.title') }}
        </NText>
        <NText :depth="3" style="display: block; margin-bottom: 16px;">
          {{ $t('dataManager.import.description') }}
        </NText>
        
        <!-- 文件选择区域 -->
        <NUpload
          :file-list="selectedFile ? [selectedFile] : []"
          accept=".json"
          :show-file-list="false"
          @change="handleFileChange"
          :custom-request="() => {}"
        >
          <NUploadDragger>
            <div v-if="!selectedFile" style="padding: 24px;">
              <div style="margin-bottom: 12px;">
                <NIcon size="48" :depth="3">
                  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </NIcon>
              </div>
              <NText :depth="3">
                {{ $t('dataManager.import.selectFile') }}
              </NText>
            </div>
            
            <div v-else style="padding: 24px;">
              <NText strong style="display: block; margin-bottom: 8px;">
                {{ selectedFile.name }}
              </NText>
              <NText :depth="3" style="display: block; margin-bottom: 12px;">
                {{ formatFileSize(selectedFile.size) }}
              </NText>
              <NSpace>
                <NButton text @click.stop="clearSelectedFile">
                  {{ $t('common.clear') }}
                </NButton>
              </NSpace>
            </div>
          </NUploadDragger>
        </NUpload>

        <!-- 导入按钮 -->
        <NButton
          @click="handleImport"
          :disabled="!selectedFile || isImporting"
          type="success"
          :loading="isImporting"
          block
          style="margin-top: 16px;"
        >
          <template #icon>
            <NIcon><Upload /></NIcon>
          </template>
          {{ isImporting ? $t('common.importing') : $t('dataManager.import.button') }}
        </NButton>
      </div>

      <!-- 上下文导入导出功能 -->
      <div>
        <NText tag="h3" :depth="1" strong style="font-size: 18px; margin-bottom: 12px;">
          {{ $t('dataManager.contexts.title') }}
        </NText>
        <NText :depth="3" style="display: block; margin-bottom: 16px;">
          {{ $t('dataManager.contexts.description') }}
        </NText>
        
        <NSpace vertical :size="12">
          <!-- 上下文导出 -->
          <NButton
            @click="handleContextExportToFile"
            :disabled="isContextExporting"
            type="default"
            :loading="isContextExporting"
            block
          >
            <template #icon>
              <NIcon><FileExport /></NIcon>
            </template>
            {{ isContextExporting ? $t('common.exporting') : $t('dataManager.contexts.exportFile') }}
          </NButton>

          <NButton
            @click="handleContextExportToClipboard"
            :disabled="isContextExporting"
            type="default"
            :loading="isContextExporting"
            block
          >
            <template #icon>
              <NIcon><Clipboard /></NIcon>
            </template>
            {{ isContextExporting ? $t('common.exporting') : $t('dataManager.contexts.exportClipboard') }}
          </NButton>
          
          <!-- 上下文导入 -->
          <!-- 文件导入 -->
          <NUpload
            :file-list="[]"
            accept=".json"
            :show-file-list="false"
            @change="handleContextFileChange"
            :custom-request="() => {}"
            :disabled="isContextImporting"
          >
            <NButton
              :disabled="isContextImporting"
              type="default"
              :loading="isContextImporting && isContextImportingFromFile"
              block
            >
              <template #icon>
                <NIcon><Folder /></NIcon>
              </template>
              {{ (isContextImporting && isContextImportingFromFile) ? $t('common.importing') : $t('dataManager.contexts.importFile') }}
            </NButton>
          </NUpload>

          <!-- 剪贴板导入 -->
          <NButton
            @click="handleContextImportFromClipboard"
            :disabled="isContextImporting"
            type="default"
            :loading="isContextImporting && !isContextImportingFromFile"
            block
          >
            <template #icon>
              <NIcon><ClipboardCheck /></NIcon>
            </template>
            {{ (isContextImporting && !isContextImportingFromFile) ? $t('common.importing') : $t('dataManager.contexts.importClipboard') }}
          </NButton>
        </NSpace>
      </div>

      <!-- 警告信息 -->
      <NAlert type="warning" :show-icon="true">
        {{ $t('dataManager.warning') }}
      </NAlert>
    </NSpace>
  </NModal>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, onUnmounted, type Ref } from 'vue'

import { useI18n } from 'vue-i18n'
import {
  NModal, NSpace, NText, NButton, NUpload, NUploadDragger,
  NIcon, NAlert, type UploadFileInfo
} from 'naive-ui'
import {
  Download,
  Upload,
  FileExport,
  Clipboard,
  Folder,
  ClipboardCheck
} from '@vicons/tabler'
import { useToast } from '../composables/ui/useToast'
import type { AppServices } from '../types/services'

interface Props {
  show: boolean;
  // dataManager现在通过inject获取，不再需要props
}

interface Emits {
  (e: 'close'): void
  (e: 'imported'): void
  (e: 'update:show', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const toast = useToast()

// 统一使用inject获取services
const services = inject<Ref<AppServices | null>>('services')
if (!services) {
  throw new Error('[DataManager] services未正确注入，请确保在App组件中正确provide了services')
}

const getDataManager = computed(() => {
  const servicesValue = services.value
  if (!servicesValue) {
    throw new Error('[DataManager] services未初始化，请确保应用已正确启动')
  }

  const manager = servicesValue.dataManager
  if (!manager) {
    throw new Error('[DataManager] dataManager未初始化，请确保服务已正确配置')
  }

  return manager
})

const isExporting = ref(false)
const isImporting = ref(false)
const selectedFile = ref<File | null>(null)

// 上下文导入导出状态
const isContextExporting = ref(false)
const isContextImporting = ref(false)
const isContextImportingFromFile = ref(false) // 区分文件和剪贴板导入

// 处理文件变化
const handleFileChange = (options: { fileList: UploadFileInfo[] }) => {
  if (options.fileList.length > 0 && options.fileList[0].file) {
    selectedFile.value = options.fileList[0].file as File
  }
}

// --- Close Logic ---
const close = () => {
  emit('update:show', false)
  emit('close')
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.show) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

// 处理导出
const handleExport = async () => {
  try {
    const dataManager = getDataManager.value
    if (!dataManager) {
      toast.error(t('toast.error.dataManagerNotAvailable'))
      return
    }

    isExporting.value = true
    
    const data = await dataManager.exportAllData()
    
    // 创建下载链接
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `prompt-optimizer-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.success(t('dataManager.export.success'))
  } catch (error) {
    console.error('导出失败:', error)
    toast.error(t('dataManager.export.failed'))
  } finally {
    isExporting.value = false
  }
}

// 处理文件选择 - 已移除，使用 handleFileChange 代替

// 清除选中的文件
const clearSelectedFile = () => {
  selectedFile.value = null
}

// 处理导入
const handleImport = async () => {
  if (!selectedFile.value) return
  
  try {
    isImporting.value = true
    
    const content = await selectedFile.value.text()
    const dataManager = getDataManager.value
    if (!dataManager) {
      toast.error(t('toast.error.dataManagerNotAvailable'))
      return
    }
    await dataManager.importAllData(content)
    
    toast.success(t('dataManager.import.success'))
    emit('imported')
    emit('close')
    clearSelectedFile()
  } catch (error) {
    console.error('导入失败:', error)
    toast.error(t('dataManager.import.failed') + ': ' + (error as Error).message)
  } finally {
    isImporting.value = false
  }
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 处理上下文导出到文件
const handleContextExportToFile = async () => {
  try {
    const servicesValue = services.value
    if (!servicesValue) {
      toast.error('服务不可用，请稍后重试')
      return
    }

    const contextRepo = servicesValue.contextRepo
    if (!contextRepo) {
      toast.error('上下文服务不可用，请稍后重试')
      return
    }

    isContextExporting.value = true
    
    // 使用 exportAll 获取 ContextBundle 格式
    const contextBundle = await contextRepo.exportAll()
    const exportContent = JSON.stringify(contextBundle, null, 2)
    
    // 创建下载链接
    const blob = new Blob([exportContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `contexts-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.success(`已导出 ${contextBundle.contexts.length} 个上下文集合到文件`)
  } catch (error) {
    console.error('上下文文件导出失败:', error)
    toast.error('上下文导出失败: ' + (error as Error).message)
  } finally {
    isContextExporting.value = false
  }
}

// 处理上下文导出到剪贴板
const handleContextExportToClipboard = async () => {
  try {
    const servicesValue = services.value
    if (!servicesValue) {
      toast.error('服务不可用，请稍后重试')
      return
    }

    const contextRepo = servicesValue.contextRepo
    if (!contextRepo) {
      toast.error('上下文服务不可用，请稍后重试')
      return
    }

    isContextExporting.value = true
    
    // 使用 exportAll 获取 ContextBundle 格式
    const contextBundle = await contextRepo.exportAll()
    const exportContent = JSON.stringify(contextBundle, null, 2)
    
    // 复制到剪贴板
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(exportContent)
    } else {
      // 降级方案
      const textarea = document.createElement('textarea')
      textarea.value = exportContent
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    
    toast.success(`已导出 ${contextBundle.contexts.length} 个上下文集合到剪贴板`)
  } catch (error) {
    console.error('上下文剪贴板导出失败:', error)
    toast.error('上下文导出失败: ' + (error as Error).message)
  } finally {
    isContextExporting.value = false
  }
}

// 处理上下文文件选择和导入
const handleContextFileChange = async (options: { fileList: UploadFileInfo[] }) => {
  if (options.fileList.length === 0 || !options.fileList[0].file) return
  
  const file = options.fileList[0].file as File
  await handleContextImportFromFile(file)
}

// 处理从文件导入上下文
const handleContextImportFromFile = async (file: File) => {
  try {
    const servicesValue = services.value
    if (!servicesValue) {
      toast.error('服务不可用，请稍后重试')
      return
    }

    const contextRepo = servicesValue.contextRepo
    if (!contextRepo) {
      toast.error('上下文服务不可用，请稍后重试')
      return
    }

    isContextImporting.value = true
    isContextImportingFromFile.value = true
    
    // 读取文件内容
    const content = await file.text()
    
    // 解析JSON数据
    let importData: unknown
    try {
      importData = JSON.parse(content)
    } catch (parseError) {
      toast.error('无效的JSON格式，请检查文件内容')
      return
    }
    
    // 使用 importAll 并获取详细统计
    const result = await contextRepo.importAll(importData, 'replace')
    
    // 显示详细的导入统计
    const stats = []
    if (result.imported > 0) stats.push(`导入 ${result.imported} 个上下文`)
    if (result.skipped > 0) stats.push(`跳过 ${result.skipped} 个`)
    if (result.predefinedVariablesRemoved > 0) stats.push(`剔除 ${result.predefinedVariablesRemoved} 个预定义变量覆盖`)
    
    const message = stats.length > 0 ? `成功：${stats.join('，')}` : '导入完成'
    toast.success(message)
    emit('imported') // 触发父组件的导入成功事件
  } catch (error) {
    console.error('上下文文件导入失败:', error)
    toast.error('上下文导入失败: ' + (error as Error).message)
  } finally {
    isContextImporting.value = false
    isContextImportingFromFile.value = false
  }
}

// 处理从剪贴板导入上下文（修正版本）
const handleContextImportFromClipboard = async () => {
  try {
    const servicesValue = services.value
    if (!servicesValue) {
      toast.error('服务不可用，请稍后重试')
      return
    }

    const contextRepo = servicesValue.contextRepo
    if (!contextRepo) {
      toast.error('上下文服务不可用，请稍后重试')
      return
    }

    isContextImporting.value = true
    isContextImportingFromFile.value = false
    
    // 从剪贴板读取内容
    let clipboardContent = ''
    if (navigator.clipboard) {
      clipboardContent = await navigator.clipboard.readText()
    } else {
      // 如果无法访问剪贴板，提示用户手动粘贴
      clipboardContent = prompt('请粘贴要导入的上下文数据:') || ''
    }
    
    if (!clipboardContent.trim()) {
      toast.warning('剪贴板内容为空，请先复制要导入的数据')
      return
    }
    
    // 解析JSON数据
    let importData: unknown
    try {
      importData = JSON.parse(clipboardContent)
    } catch (parseError) {
      toast.error('无效的JSON格式，请检查数据格式')
      return
    }
    
    // 使用 importAll 并获取详细统计
    const result = await contextRepo.importAll(importData, 'replace')
    
    // 显示详细的导入统计
    const stats = []
    if (result.imported > 0) stats.push(`导入 ${result.imported} 个上下文`)
    if (result.skipped > 0) stats.push(`跳过 ${result.skipped} 个`)
    if (result.predefinedVariablesRemoved > 0) stats.push(`剔除 ${result.predefinedVariablesRemoved} 个预定义变量覆盖`)
    
    const message = stats.length > 0 ? `成功：${stats.join('，')}` : '导入完成'
    toast.success(message)
    emit('imported') // 触发父组件的导入成功事件
  } catch (error) {
    console.error('上下文剪贴板导入失败:', error)
    toast.error('上下文导入失败: ' + (error as Error).message)
  } finally {
    isContextImporting.value = false
    isContextImportingFromFile.value = false
  }
}
</script> 