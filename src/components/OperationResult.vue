<template>
  <div class="content-panel">
    <div class="panel-header">
      <h3>📄 操作结果</h3>
    </div>
    <div class="result-display" :class="{ success: results.success, error: !results.success }">
      <div class="result-icon">
        {{ results.success ? '✅' : '❌' }}
      </div>
      <div class="result-details">
        <div class="result-title">
          {{ results.success ? '操作成功' : '操作失败' }}
        </div>
        <div class="result-info" v-if="results.total">
          总数: {{ results.total }} | 成功: {{ results.success }} | 失败: {{ results.failed }}
        </div>
        <div class="result-error" v-if="!results.success">
          {{ results.error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  results: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.content-panel {
  background: rgba(255, 255, 255, 0.95); /* 半透明白色 */
  backdrop-filter: blur(10px); /* 毛玻璃效果 */
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.panel-header {
  padding: 20px 25px;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

/* 操作结果显示 */
.result-display {
  padding: 25px;
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.result-icon {
  font-size: 24px;
  margin-top: 2px;
}

.result-details {
  flex: 1;
}

.result-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.result-info {
  font-size: 14px;
  margin-bottom: 5px;
  opacity: 0.8;
}

.result-error {
  font-size: 14px;
  opacity: 0.9;
}

.result-display.success {
  background: linear-gradient(145deg, #f0fff4, #e6fffa);
  color: #22543d;
  border-left: 4px solid #48bb78;
}

.result-display.error {
  background: linear-gradient(145deg, #fff5f5, #fed7d7);
  color: #742a2a;
  border-left: 4px solid #f56565;
}
</style>
