<template>
  <div class="cache-status">
    <!-- 缓存状态指示器 -->
    <div class="cache-indicator" :class="{ 'has-data': hasCachedData }">
      <div class="indicator-dot"></div>
      <span class="indicator-text">
        {{ hasCachedData ? `已缓存 ${cachedFamilyCount} 个家庭数据` : '暂无缓存数据' }}
      </span>
    </div>

    <!-- 缓存操作按钮 -->
    <div class="cache-actions" v-if="hasCachedData">
      <button @click="showCacheDetails = !showCacheDetails" class="btn-secondary">
        {{ showCacheDetails ? '隐藏详情' : '查看详情' }}
      </button>
      <button @click="restoreData" class="btn-primary">
        恢复数据
      </button>
      <button @click="exportData" class="btn-secondary">
        导出数据
      </button>
      <button @click="clearCache" class="btn-danger">
        清空缓存
      </button>
    </div>

    <!-- 缓存详情面板 -->
    <div v-if="showCacheDetails && hasCachedData" class="cache-details">
      <h4>缓存详情</h4>
      <div class="detail-item">
        <span class="label">家庭数量:</span>
        <span class="value">{{ cachedFamilyCount }}</span>
      </div>
      <div class="detail-item">
        <span class="label">最后活动:</span>
        <span class="value">{{ formatLastActivity }}</span>
      </div>
      <div class="detail-item">
        <span class="label">缓存大小:</span>
        <span class="value">{{ formatCacheSize }}</span>
      </div>
      <div class="detail-item" v-if="lastSessionInfo">
        <span class="label">最后操作:</span>
        <span class="value">{{ formatLastAction }}</span>
      </div>
    </div>

    <!-- 恢复确认对话框 -->
    <div v-if="showRestoreDialog" class="modal-overlay" @click="showRestoreDialog = false">
      <div class="modal-content" @click.stop>
        <h3>恢复缓存数据</h3>
        <p>检测到 {{ cachedFamilyCount }} 个家庭数据，是否要恢复到当前会话？</p>
        <div class="modal-actions">
          <button @click="confirmRestore" class="btn-primary">确认恢复</button>
          <button @click="showRestoreDialog = false" class="btn-secondary">取消</button>
        </div>
      </div>
    </div>

    <!-- 操作结果提示 -->
    <div v-if="operationResult" class="operation-result" :class="operationResult.type">
      {{ operationResult.message }}
    </div>
  </div>
</template>

<script>
import { 
  getCachedFamilies, 
  getSessionInfo, 
  getCacheStats,
  clearAllCache,
  exportCachedData
} from '../utils/cacheManager.js'

export default {
  name: 'CacheStatus',
  props: {
    // 是否自动检查缓存
    autoCheck: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      cachedFamilies: [],
      sessionInfo: null,
      cacheStats: {},
      showCacheDetails: false,
      showRestoreDialog: false,
      operationResult: null
    }
  },
  computed: {
    hasCachedData() {
      return this.cachedFamilies.length > 0
    },
    cachedFamilyCount() {
      return this.cachedFamilies.length
    },
    lastSessionInfo() {
      return this.sessionInfo
    },
    formatLastActivity() {
      if (!this.sessionInfo?.timestamp) return '未知'
      const date = new Date(this.sessionInfo.timestamp)
      return date.toLocaleString('zh-CN')
    },
    formatCacheSize() {
      const size = this.cacheStats.cacheSize || 0
      if (size < 1024) return `${size} B`
      if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
      return `${(size / (1024 * 1024)).toFixed(1)} MB`
    },
    formatLastAction() {
      if (!this.sessionInfo?.lastAction) return '未知'
      const actionMap = {
        'generate_single': '生成单个家庭',
        'generate_batch': '批量生成家庭',
        'write_single': '写入单个家庭',
        'write_batch': '批量写入家庭'
      }
      return actionMap[this.sessionInfo.lastAction] || this.sessionInfo.lastAction
    }
  },
  mounted() {
    if (this.autoCheck) {
      this.checkCache()
    }
  },
  methods: {
    /**
     * 检查缓存状态
     */
    checkCache() {
      try {
        this.cachedFamilies = getCachedFamilies()
        this.sessionInfo = getSessionInfo()
        this.cacheStats = getCacheStats()
        
        console.log('缓存状态检查完成:', {
          families: this.cachedFamilies.length,
          hasSession: !!this.sessionInfo
        })
      } catch (error) {
        console.error('检查缓存状态失败:', error)
        this.showResult('检查缓存状态失败', 'error')
      }
    },

    /**
     * 恢复数据
     */
    restoreData() {
      if (!this.hasCachedData) {
        this.showResult('没有可恢复的数据', 'warning')
        return
      }
      
      this.showRestoreDialog = true
    },

    /**
     * 确认恢复数据
     */
    confirmRestore() {
      try {
        // 发出恢复数据事件
        this.$emit('restore-data', {
          families: this.cachedFamilies,
          sessionInfo: this.sessionInfo
        })
        
        this.showRestoreDialog = false
        this.showResult(`已恢复 ${this.cachedFamilyCount} 个家庭数据`, 'success')
      } catch (error) {
        console.error('恢复数据失败:', error)
        this.showResult('恢复数据失败', 'error')
      }
    },

    /**
     * 导出数据
     */
    exportData() {
      try {
        const result = exportCachedData('json')
        if (result.success) {
          this.showResult(result.message, 'success')
        } else {
          this.showResult(result.message || '导出失败', 'error')
        }
      } catch (error) {
        console.error('导出数据失败:', error)
        this.showResult('导出数据失败', 'error')
      }
    },

    /**
     * 清空缓存
     */
    clearCache() {
      if (confirm('确定要清空所有缓存数据吗？此操作不可恢复。')) {
        try {
          clearAllCache()
          this.cachedFamilies = []
          this.sessionInfo = null
          this.cacheStats = {}
          this.showCacheDetails = false
          this.showResult('缓存已清空', 'success')
          
          // 发出缓存清空事件
          this.$emit('cache-cleared')
        } catch (error) {
          console.error('清空缓存失败:', error)
          this.showResult('清空缓存失败', 'error')
        }
      }
    },

    /**
     * 显示操作结果
     */
    showResult(message, type = 'info') {
      this.operationResult = { message, type }
      setTimeout(() => {
        this.operationResult = null
      }, 3000)
    },

    /**
     * 刷新缓存状态
     */
    refresh() {
      this.checkCache()
    }
  }
}
</script>

<style scoped>
.cache-status {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}

.cache-indicator {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6c757d;
  margin-right: 8px;
  transition: background-color 0.3s;
}

.cache-indicator.has-data .indicator-dot {
  background: #28a745;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.indicator-text {
  font-size: 14px;
  color: #495057;
  font-weight: 500;
}

.cache-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.btn-primary, .btn-secondary, .btn-danger {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.cache-details {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 12px;
  margin-top: 12px;
}

.cache-details h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #495057;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.label {
  color: #6c757d;
  font-weight: 500;
}

.value {
  color: #495057;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-content h3 {
  margin: 0 0 16px 0;
  color: #495057;
}

.modal-content p {
  margin: 0 0 20px 0;
  color: #6c757d;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.operation-result {
  margin-top: 12px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
}

.operation-result.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.operation-result.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.operation-result.warning {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.operation-result.info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}
</style>
