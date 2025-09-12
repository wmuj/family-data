<template>
  <header class="dashboard-header">
    <div class="header-content">
      <div class="logo-section">
        <div class="logo-icon">🏠</div>
        <div class="title-group">
          <h1>家庭数据生成器</h1>
          <span class="subtitle">Family Data Generator v1.0</span>
        </div>
      </div>
      <div class="status-indicator">
        <div class="status-dot" :class="{ active: isLoading }"></div>
        <span>{{ isLoading ? '运行中' : '就绪' }}</span>
        <div class="mode-indicator" v-if="currentMode">
          <span class="mode-icon">{{ currentMode === 'llm' ? '🤖' : '⚡' }}</span>
          <span class="mode-text">{{ currentMode === 'llm' ? 'AI模式' : '快速模式' }}</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  currentMode: {
    type: String,
    default: 'faker' // 'faker' 或 'llm'
  }
})
</script>

<style scoped>
/* 顶部标题栏 */
.dashboard-header {
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  color: white;
  padding: 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 15px 25px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-icon {
  font-size: 32px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px;
  backdrop-filter: blur(10px);
}

.title-group h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: white;
}

.subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.mode-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.mode-icon {
  font-size: 16px;
}

.mode-text {
  font-size: 12px;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #48bb78;
  transition: all 0.3s ease;
}

.status-dot.active {
  background: #f6ad55;
  animation: pulse-dot 1.5s infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.2); }
}

/* 响应式 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 15px;
    padding: 15px 20px;
  }
  
  .logo-section .title-group h1 {
    font-size: 20px;
  }
}
</style>
