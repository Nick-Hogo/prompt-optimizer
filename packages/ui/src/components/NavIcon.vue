<template>
  <component :is="iconComponent" :size="iconSize" :stroke-width="strokeWidth" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Template as TemplateIcon,
  History as HistoryIcon,
  Star as StarIcon,
  Database as DatabaseIcon,
  FileText as FileTextIcon,
  Bookmark as BookmarkIcon,
  ClipboardList as ClipboardListIcon,
} from '@vicons/tabler'

interface Props {
  name: 'template' | 'history' | 'star' | 'database' | 'file' | 'bookmark' | 'clipboard'
  size?: number | string
  strokeWidth?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 20,
  strokeWidth: 1.5
})

const iconMap = {
  template: TemplateIcon,
  history: HistoryIcon,
  star: StarIcon,
  database: DatabaseIcon,
  file: FileTextIcon,
  bookmark: BookmarkIcon,
  clipboard: ClipboardListIcon,
}

const iconComponent = computed(() => iconMap[props.name])
const iconSize = computed(() => typeof props.size === 'number' ? props.size : parseInt(props.size))
</script>

<style scoped>
/* 图标继承父元素颜色 */
svg {
  display: block;
  vertical-align: middle;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
