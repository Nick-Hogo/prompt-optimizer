# UI布局最佳实践

本文档记录UI布局开发中的常见问题和最佳实践，避免重复犯错。

## 问题记录

### 问题1：固定宽度导致卡片无法响应式调整

**日期**: 2025-01-13

**问题描述**:
在优化InputPanel组件时，为选择器设置了固定的`width`，导致卡片无法根据页面大小自适应调整。

**错误示例**:
```vue
<div style="width: 150px; flex-shrink: 0;">
  <slot name="model-select"></slot>
</div>
```

**问题原因**:
1. 使用固定`width`而不是`max-width`，元素无法缩小
2. 设置`flex-shrink: 0`进一步阻止了元素收缩
3. 父容器虽然设置了`flex: 1`，但子元素的固定宽度限制了整体的弹性

**正确做法**:
```vue
<div style="max-width: 150px; min-width: 120px; flex: 1;">
  <slot name="model-select"></slot>
</div>
```

**关键点**:
- ✅ 使用`max-width`而不是`width`，允许元素在需要时缩小
- ✅ 设置`min-width`确保元素不会过小影响可用性
- ✅ 使用`flex: 1`让元素在可用空间内自适应
- ❌ 避免同时使用固定`width`和`flex-shrink: 0`

---

### 问题2：内联样式覆盖主题配置

**日期**: 2025-01-13

**问题描述**:
在按钮上直接使用内联样式设置`height: 36px`等属性，覆盖了Naive UI主题配置，导致组件行为不一致。

**错误示例**:
```vue
<NButton
  type="primary"
  size="medium"
  style="min-width: 120px; height: 36px; font-size: 14px; font-weight: 500;"
>
  按钮文字
</NButton>
```

**问题原因**:
1. 内联样式优先级高于主题配置
2. 破坏了统一的主题系统
3. 难以维护，修改需要在多处同步

**正确做法**:
```vue
<!-- 组件中只设置必要的内联样式 -->
<NButton
  type="primary"
  size="medium"
  style="min-width: 120px;"
>
  按钮文字
</NButton>
```

```typescript
// 在主题配置中统一设置
Button: {
  heightMedium: '36px',
  fontSizeMedium: '14px',
  fontWeightStrong: '500',
  borderRadius: '6px',
  paddingMedium: '0 16px'
}
```

**关键点**:
- ✅ 优先使用主题配置系统
- ✅ 内联样式只用于特定、非通用的样式
- ✅ 保持主题配置的一致性
- ❌ 避免用内联样式覆盖主题配置

---

## 响应式布局最佳实践

### 1. Flex布局基本原则

```css
/* 父容器 */
.parent {
  display: flex;
  flex: 1;              /* 占据可用空间 */
  min-width: 0;         /* 允许flex子元素收缩到内容以下 */
}

/* 可伸缩子元素 */
.flexible-child {
  flex: 1;              /* 自适应占据空间 */
  max-width: 200px;     /* 最大宽度 */
  min-width: 100px;     /* 最小宽度 */
}

/* 固定子元素 */
.fixed-child {
  flex-shrink: 0;       /* 不收缩 */
  width: 150px;         /* 固定宽度 */
}
```

### 2. 选择器容器布局模式

对于包含多个选择器的水平布局：

```vue
<NFlex align="center" :size="12" style="min-width: 0; flex: 1;">
  <!-- 标题 - 不收缩 -->
  <NText style="white-space: nowrap;">标题</NText>
  
  <!-- 选择器组 - 可收缩但有最小宽度 -->
  <div class="selector-group">
    <div class="selector-item">
      <NText style="white-space: nowrap;">标签:</NText>
      <div style="max-width: 150px; min-width: 120px; flex: 1;">
        <NSelect />
      </div>
    </div>
  </div>
  
  <!-- 按钮组 - 不收缩 -->
  <NFlex style="flex-shrink: 0;">
    <NButton />
  </NFlex>
</NFlex>
```

**关键CSS**:
```css
.selector-group {
  display: flex;
  flex-shrink: 1;      /* 允许收缩 */
  min-width: 0;        /* 允许收缩到内容以下 */
}

.selector-item {
  display: flex;
  align-items: center;
  flex-shrink: 0;      /* 单个选择器不收缩 */
  gap: 8px;
}
```

### 3. 响应式断点策略

```css
/* 大屏 - 显示所有内容 */
@media (min-width: 1400px) {
  .inline-selectors {
    display: flex;
  }
}

/* 中小屏 - 隐藏内联选择器，移到下拉菜单 */
@media (max-width: 1399px) {
  .inline-selectors {
    display: none;
  }
}
```

### 4. 卡片布局

```vue
<!-- 左右分栏 -->
<NFlex style="gap: 20px;">
  <!-- 左侧 - 自适应 -->
  <NFlex vertical style="flex: 1; overflow: auto;">
    <NCard>内容</NCard>
  </NFlex>
  
  <!-- 右侧 - 自适应 -->
  <NCard style="flex: 1; overflow: auto;">
    内容
  </NCard>
</NFlex>
```

---

## 设计系统数值参考

基于Material Design 3、Apple HIG、Ant Design的最佳实践：

### 字体系统
```typescript
{
  title: {
    fontSize: '20px',
    fontWeight: '600',
    lineHeight: '1.5'
  },
  body: {
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '1.6'
  },
  label: {
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '1.5'
  },
  helper: {
    fontSize: '12px',
    fontWeight: '400',
    lineHeight: '1.5'
  }
}
```

### 间距系统（8px基准）
```typescript
{
  componentSpacing: '20px',      // 组件之间
  elementSpacing: '16px',        // 元素之间
  labelSpacing: '8px',           // 标签与输入框
  tightSpacing: '12px'           // 紧凑间距
}
```

### 圆角规范
```typescript
{
  card: '8px',
  button: '6px',
  input: '6px',
  small: '4px'
}
```

### 组件尺寸
```typescript
{
  button: {
    height: '36px',
    minWidth: '64px',
    padding: '0 16px'
  },
  input: {
    height: '36px',
    padding: '0 12px'
  },
  select: {
    height: '36px',
    minWidth: '120px',
    maxWidth: '200px'
  }
}
```

---

## 检查清单

在完成UI布局修改后，请检查：

- [ ] 是否使用了固定`width`？考虑改用`max-width` + `min-width`
- [ ] 是否设置了`flex-shrink: 0`？确认是否真的需要
- [ ] 父容器是否设置了`min-width: 0`以允许flex子元素收缩
- [ ] 是否用内联样式覆盖了主题配置？考虑移到主题配置中
- [ ] 是否测试了不同屏幕尺寸下的显示效果？
- [ ] 是否设置了合适的响应式断点？
- [ ] 卡片/容器是否能根据窗口大小自适应？
- [ ] 文本是否会溢出？考虑添加`white-space: nowrap`或省略号
- [ ] 按钮和输入框高度是否一致（通常36px）？
- [ ] 间距是否遵循8px基准？

---

## 相关文档

- [Naive UI 主题配置](/root/prompt-optimizer/packages/ui/src/config/naive-theme.ts)
- [InputPanel组件](/root/prompt-optimizer/packages/ui/src/components/InputPanel.vue)
- [主题系统文档](/root/prompt-optimizer/docs/archives/109-theme-system/)
- [布局系统文档](/root/prompt-optimizer/docs/archives/108-layout-system/)

---

## 更新日志

- **2025-01-13**: 创建文档，记录固定宽度和内联样式问题
