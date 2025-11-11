<template>
  <NModal
    :show="show"
    :closable="false"
    :mask-closable="false"
    preset="card"
    title="欢迎使用提示词优化器"
    style="width: 90%; max-width: 500px;"
  >
    <NSpace vertical :size="16">
      <NAlert type="info" :bordered="false">
        为了开始使用，请先配置您的 API 密钥（推荐使用 OpenAI 或 DeepSeek）
      </NAlert>

      <NForm
        ref="formRef"
        :model="formValue"
        :rules="rules"
        label-placement="top"
        label-width="auto"
        require-mark-placement="right-hanging"
      >
        <NFormItem label="API密钥" path="apiKey">
          <NInput
            v-model:value="formValue.apiKey"
            type="password"
            placeholder="输入您的 API 密钥（支持 OpenAI、DeepSeek 等）"
            show-password-on="click"
          />
        </NFormItem>
      </NForm>

      <NText depth="3" style="font-size: 12px;">
        提示：密钥将保存在本地浏览器中，不会上传到任何服务器
      </NText>
    </NSpace>

    <template #action>
      <NSpace justify="end">
        <NButton @click="handleSkip" secondary>
          跳过
        </NButton>
        <NButton
          @click="handleSubmit"
          type="primary"
          :loading="isSubmitting"
        >
          确认并开始使用
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  NModal,
  NSpace,
  NAlert,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NButton,
  type FormInst,
  type FormRules
} from 'naive-ui'

interface Props {
  show: boolean
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'submit', value: { apiKey: string }): void
  (e: 'error', message: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInst | null>(null)
const isSubmitting = ref(false)

const formValue = reactive({
  apiKey: ''
})

const rules: FormRules = {
  apiKey: {
    required: true,
    message: '请输入API密钥',
    trigger: ['input', 'blur']
  }
}

const handleSkip = () => {
  emit('update:show', false)
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    isSubmitting.value = true
    
    emit('submit', {
      apiKey: formValue.apiKey
    })
    
    emit('update:show', false)
  } catch (error) {
    emit('error', '请输入API密钥')
  } finally {
    isSubmitting.value = false
  }
}
</script>
