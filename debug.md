消息发送调用逻辑
  | 层级            | 文件                                                        | 关键函数/行号                                                          |
  |---------------|-----------------------------------------------------------|------------------------------------------------------------------|
  | UI触发          | packages/web/src/App.vue                                  | handleOptimizePrompt() :1766                                     |
  | Composable    | packages/ui/src/composables/prompt/usePromptOptimizer.ts  | handleOptimizePrompt() :91handleOptimizePromptWithContext() :200 |
  | PromptService | packages/core/src/services/prompt/service.ts              | optimizePromptStream() :370                                      |
  | LLMService    | packages/core/src/services/llm/service.ts                 | sendMessageStream() :118                                         |
  | Adapter       | packages/core/src/services/llm/adapters/openai-adapter.ts | doSendMessageStream() :464                                       |