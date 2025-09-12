<template>
  <div class="empty-state">
    <div class="empty-icon">📊</div>
    <h3>开始生成数据</h3>
    <p>使用左侧控制面板配置参数并生成家庭数据</p>
  </div>
</template>

<style scoped>
/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  text-align: center;
  background: rgba(255, 255, 255, 0.95); /* 半透明白色 */
  backdrop-filter: blur(10px); /* 毛玻璃效果 */
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-state h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
  font-weight: 600;
  color: #4a5568;
}

.empty-state p {
  margin: 0;
  color: #718096;
  font-size: 14px;
  line-height: 1.5;
}
</style>
