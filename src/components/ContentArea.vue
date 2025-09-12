<template>
  <main class="content-area">
    <!-- 加载状态 -->
    <LoadingState v-if="isLoading" />

    <!-- 单个数据预览 -->
    <FamilyDataCard v-else-if="familyData" :familyData="familyData" />

    <!-- 批量数据表格 -->
    <BatchDataTable v-else-if="batchData.length > 0" :batchData="batchData" />

    <!-- 操作结果 -->
    <OperationResult v-else-if="results" :results="results" />

    <!-- 空状态 -->
    <EmptyState v-else />
  </main>
</template>

<script setup>
import FamilyDataCard from './FamilyDataCard.vue'
import BatchDataTable from './BatchDataTable.vue'
import OperationResult from './OperationResult.vue'
import EmptyState from './EmptyState.vue'
import LoadingState from './LoadingState.vue'

defineProps({
  familyData: {
    type: Object,
    default: null,
  },
  batchData: {
    type: Array,
    default: () => [],
  },
  results: {
    type: Object,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped>
/* 右侧内容区域 */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: visible; /* 改为可见，让父容器处理滚动 */
}

@media (max-width: 1024px) {
  .content-area {
    order: 1;
    height: auto; /* 移动端自动高度 */
    max-height: none; /* 移除高度限制 */
    overflow-y: visible; /* 移动端让父容器处理滚动 */
  }
}
</style>
