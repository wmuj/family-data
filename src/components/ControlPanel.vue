<template>
  <aside class="control-panel">
    <!-- 上方配置区域：两栏布局 -->
    <div class="config-row">
      <!-- 参数配置 -->
      <div class="panel-section config-section">
        <h3>📊 参数配置</h3>
        <div class="control-group">
          <div class="params-grid">
            <div class="control-item">
              <label>父亲年龄范围</label>
              <div class="range-inputs">
                <input v-model.number="localConfig.fatherAgeMin" type="number" min="20" max="60" />
                <span>~</span>
                <input v-model.number="localConfig.fatherAgeMax" type="number" min="20" max="60" />
              </div>
            </div>
            <div class="control-item">
              <label>母亲年龄范围</label>
              <div class="range-inputs">
                <input v-model.number="localConfig.motherAgeMin" type="number" min="20" max="60" />
                <span>~</span>
                <input v-model.number="localConfig.motherAgeMax" type="number" min="20" max="60" />
              </div>
            </div>
            <div class="control-item">
              <label>孩子数量</label>
              <input
                v-model.number="localConfig.childrenCount"
                type="number"
                min="0"
                max="5"
                class="single-input"
              />
            </div>
            <div class="control-item">
              <label>批量数量</label>
              <input
                v-model.number="localConfig.batchCount"
                type="number"
                min="1"
                max="100"
                class="single-input"
              />
            </div>

            <!-- 额外的参数配置 -->
            <div class="control-item">
              <label>数据精度</label>
              <select class="single-input">
                <option value="high">高精度</option>
                <option value="normal" selected>标准</option>
                <option value="fast">快速</option>
              </select>
            </div>
            <div class="control-item">
              <label>地区偏好</label>
              <select class="single-input">
                <option value="random" selected>随机</option>
                <option value="north">北方城市</option>
                <option value="south">南方城市</option>
                <option value="tier1">一线城市</option>
              </select>
            </div>
            <div class="control-item">
              <label>家庭类型</label>
              <select class="single-input">
                <option value="mixed" selected>混合</option>
                <option value="traditional">传统家庭</option>
                <option value="modern">现代家庭</option>
                <option value="wealthy">富裕家庭</option>
              </select>
            </div>
            <div class="control-item">
              <label>生活细节</label>
              <select class="single-input">
                <option value="rich" selected>丰富</option>
                <option value="normal">标准</option>
                <option value="simple">简单</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- AI生成配置 -->
      <div class="panel-section config-section">
        <h3>🤖 AI生成配置</h3>
        <div class="control-group">
          <div class="control-item">
            <label>生成模式</label>
            <select v-model="aiConfig.mode" class="single-input">
              <option value="faker">Faker.js (快速)</option>
              <option value="llm">AI智能生成 (真实)</option>
            </select>
          </div>
          <div v-if="aiConfig.mode === 'llm'" class="control-item">
            <label>AI服务商</label>
            <select v-model="aiConfig.provider" class="single-input">
              <option value="qwen">通义千问</option>
              <option value="zhipu">智谱AI (GLM-4)</option>
              <option value="openai">OpenAI GPT</option>
              <option value="claude">Claude</option>
            </select>
          </div>
          <!-- API密钥已内置，无需用户输入 -->
          <div v-if="aiConfig.mode === 'llm'" class="ai-notice">
            <span class="notice-icon">💡</span>
            <span class="notice-text">AI模式会生成更真实的数据，但需要消耗API调用</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮区域 -->
    <div class="actions-row">
      <div class="generation-notice" v-if="aiConfig.mode === 'llm'">
        <span class="notice-icon">🤖</span>
        <span class="notice-text">正在使用{{ getProviderName(aiConfig.provider) }}智能生成</span>
      </div>
      <div class="action-buttons">
        <button @click="$emit('generate-single')" class="panel-btn primary">
          <span class="btn-icon">{{ aiConfig.mode === 'llm' ? '🤖' : '🔄' }}</span>
          {{ aiConfig.mode === 'llm' ? 'AI生成单个' : '生成单个' }}
        </button>
        <button @click="$emit('generate-batch')" class="panel-btn primary">
          <span class="btn-icon">{{ aiConfig.mode === 'llm' ? '🧠' : '📦' }}</span>
          {{ aiConfig.mode === 'llm' ? 'AI批量生成' : '批量生成' }}
        </button>
        <button
          @click="$emit('write-single')"
          :disabled="!familyData || isLoading"
          class="panel-btn success"
        >
          <span class="btn-icon">💾</span>
          {{ isLoading ? '写入中...' : '写入单个' }}
        </button>
        <button
          @click="$emit('write-batch')"
          :disabled="batchData.length === 0 || isLoading"
          class="panel-btn success"
        >
          <span class="btn-icon">📤</span>
          {{ isLoading ? '处理中...' : '批量写入' }}
        </button>
        <button @click="$emit('clear-data')" class="panel-btn danger">
          <span class="btn-icon">🗑️</span>
          清空数据
        </button>
      </div>
    </div>

    <!-- 缓存状态 -->
    <div class="panel-section" v-if="cacheStatus.hasData">
      <h3>💾 缓存状态</h3>
      <div class="cache-info">
        <div class="cache-indicator">
          <span class="indicator-dot"></span>
          <span class="cache-text">已缓存 {{ cacheStatus.familyCount }} 个家庭数据</span>
        </div>
        <div class="cache-actions">
          <button @click="exportCache" class="cache-btn">导出</button>
          <button @click="clearCache" class="cache-btn danger">清空</button>
        </div>
      </div>
    </div>

    <!-- 实时统计 -->
    <div class="panel-section" v-if="batchData.length > 0">
      <h3>📈 实时统计</h3>
      <div class="stats-mini">
        <div class="stat-mini">
          <span class="stat-value">{{ batchData.length }}</span>
          <span class="stat-name">家庭</span>
        </div>
        <div class="stat-mini">
          <span class="stat-value">{{ totalChildren }}</span>
          <span class="stat-name">孩子</span>
        </div>
        <div class="stat-mini">
          <span class="stat-value">{{ averageAge }}</span>
          <span class="stat-name">平均年龄</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, toRefs, reactive, watch, ref, onMounted } from 'vue'
import { hasUnsavedData, clearAllCache } from '../utils/cacheManager.js'
import { exportCachedData } from '../utils/api.js'

const props = defineProps({
  config: {
    type: Object,
    required: true,
  },
  batchData: {
    type: Array,
    default: () => [],
  },
  familyData: {
    type: Object,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'generate-single',
  'generate-batch',
  'write-single',
  'write-batch',
  'clear-data',
  'ai-config-change',
])

const { config: localConfig, batchData } = toRefs(props)

// AI配置
const aiConfig = reactive({
  mode: 'llm', // 'faker' 或 'llm'
  provider: 'qwen', // 'zhipu', 'openai', 'qwen', 'claude'
  apiKey: 'sk-6827be63cff64aecbd0cfc9905b18b23', // 默认设置通义千问API密钥
})

// 监听AI配置变化，通知父组件
watch(
  aiConfig,
  (newConfig) => {
    emit('ai-config-change', { ...newConfig })
  },
  { deep: true, immediate: true },
)

// 计算统计数据
const totalChildren = computed(() => {
  return batchData.value.reduce((sum, family) => sum + family.children.length, 0)
})

const averageAge = computed(() => {
  if (batchData.value.length === 0) return 0
  return Math.round(
    batchData.value.reduce((sum, family) => sum + family.father.age, 0) / batchData.value.length,
  )
})

// 缓存状态
const cacheStatus = ref({
  hasData: false,
  familyCount: 0,
})

// 检查缓存状态
function checkCacheStatus() {
  try {
    const unsavedData = hasUnsavedData()
    cacheStatus.value = {
      hasData: unsavedData.hasFamilies,
      familyCount: unsavedData.familyCount,
    }
  } catch (error) {
    console.error('检查缓存状态失败:', error)
  }
}

// 导出缓存数据
function exportCache() {
  try {
    const result = exportCachedData('json')
    if (result.success) {
      alert(result.message)
    } else {
      alert(result.message || '导出失败')
    }
  } catch (error) {
    console.error('导出缓存数据失败:', error)
    alert('导出失败')
  }
}

// 清空缓存
function clearCache() {
  if (confirm('确定要清空所有缓存数据吗？此操作不可恢复。')) {
    try {
      clearAllCache()
      checkCacheStatus()
      alert('缓存已清空')
    } catch (error) {
      console.error('清空缓存失败:', error)
      alert('清空缓存失败')
    }
  }
}

// 页面加载时检查缓存状态
onMounted(() => {
  checkCacheStatus()
})

// 监听数据变化，更新缓存状态
watch(
  [batchData, () => props.familyData],
  () => {
    checkCacheStatus()
  },
  { deep: true },
)

// 获取AI提供商名称
function getProviderName(provider) {
  const names = {
    zhipu: '智谱AI',
    openai: 'OpenAI',
    qwen: '通义千问',
    claude: 'Claude',
  }
  return names[provider] || provider
}
</script>

<style scoped>
/* 控制面板 */
.control-panel {
  width: 100%;
  background: rgba(255, 255, 255, 0.95); /* 半透明白色，更好看 */
  backdrop-filter: blur(10px); /* 毛玻璃效果 */
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: visible; /* 改为可见，不需要滚动 */
}

/* 配置区域两栏布局 */
.config-row {
  display: flex;
  gap: 20px;
}

.config-section {
  flex: 1;
  border-bottom: none !important;
}

/* 操作按钮区域样式 */
.actions-row {
  padding: 16px;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 8px;
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-section {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.panel-section:last-child {
  border-bottom: none;
}

.panel-section h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 参数网格布局 */
.params-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-item label {
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-inputs span {
  color: #a0aec0;
  font-weight: 500;
}

.control-item input,
.single-input {
  padding: 10px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: all 0.2s ease;
  width: 70px;
}

.single-input {
  width: 100%;
}

.control-item input:focus,
.single-input:focus,
.single-input select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* AI配置相关样式 */
.control-item select {
  padding: 10px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: all 0.2s ease;
  width: 100%;
  cursor: pointer;
}

.control-item select:hover {
  border-color: #cbd5e0;
}

.ai-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(145deg, #fef5e7, #fff8e1);
  border: 1px solid #fbd38d;
  border-radius: 8px;
  margin-top: 10px;
}

.notice-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.notice-text {
  font-size: 12px;
  color: #744210;
  line-height: 1.4;
}

/* 操作按钮组 */
.action-buttons {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.panel-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 8px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f8fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  white-space: nowrap;
}

.panel-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.panel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.panel-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.panel-btn.success {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  border-color: transparent;
}

.panel-btn.danger {
  background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
  color: white;
  border-color: transparent;
}

.btn-icon {
  font-size: 16px;
}

/* 实时统计小部件 */
.stats-mini {
  display: flex;
  gap: 15px;
}

.stat-mini {
  flex: 1;
  text-align: center;
  padding: 15px 10px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 4px;
}

.stat-name {
  font-size: 12px;
  color: #718096;
  font-weight: 500;
}

/* 缓存状态样式 */
.cache-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cache-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #28a745;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

.cache-text {
  font-size: 14px;
  color: #495057;
  font-weight: 500;
}

.cache-actions {
  display: flex;
  gap: 8px;
}

.cache-btn {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: #f8fafc;
  color: #4a5568;
}

.cache-btn:hover {
  background: #e2e8f0;
}

.cache-btn.danger {
  background: #fed7d7;
  color: #c53030;
  border-color: #feb2b2;
}

.cache-btn.danger:hover {
  background: #feb2b2;
}

/* 响应式 */
@media (max-width: 1024px) {
  .control-panel {
    width: 100%;
    order: 2;
  }

  .config-row {
    flex-direction: column;
    gap: 0;
  }

  .config-section {
    border-bottom: 1px solid #f1f5f9 !important;
  }

  .params-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats-mini {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
