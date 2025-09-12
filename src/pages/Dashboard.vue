<template>
  <div class="dashboard">
    <!-- 顶部标题栏 -->
    <DashboardHeader :isLoading="isLoading" :current-mode="aiConfig.mode" />

    <!-- 主面板区域 -->
    <div class="dashboard-body">
      <!-- 左侧控制面板 -->
      <ControlPanel
        :config="config"
        :batchData="batchData"
        :familyData="familyData"
        :isLoading="isLoading"
        @generate-single="handleGenerateSingle"
        @generate-batch="handleGenerateBatch"
        @write-single="handleWriteSingle"
        @write-batch="handleWriteBatch"
        @clear-data="handleClearData"
        @ai-config-change="handleAiConfigChange"
      />

      <!-- 右侧数据展示区域 -->
      <ContentArea
        :familyData="familyData"
        :batchData="batchData"
        :results="results"
        :isLoading="isLoading"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { generateFamilyData, generateBatchFamilyData } from '../utils/dataGenerator.js'
import {
  generateFamilyDataWithLLM,
  generateBatchFamilyDataWithLLM,
  mockLLMGenerate,
} from '../utils/llmGenerator.js'
import { mockApiWrite, writeBatchFamilyData, restoreFromCache } from '../utils/api.js'
import { getCachedFamilies, hasUnsavedData } from '../utils/cacheManager.js'
import DashboardHeader from '../components/DashboardHeader.vue'
import ControlPanel from '../components/ControlPanel.vue'
import ContentArea from '../components/ContentArea.vue'

// 配置参数
const config = reactive({
  fatherAgeMin: 30,
  fatherAgeMax: 50,
  motherAgeMin: 28,
  motherAgeMax: 48,
  childrenCount: 2,
  batchCount: 10,
})

// AI配置
const aiConfig = ref({
  mode: 'faker', // 'faker' 或 'llm'
  provider: 'qwen', // 'zhipu', 'openai', 'qwen', 'claude'
  apiKey: 'sk-6827be63cff64aecbd0cfc9905b18b23',
})

// 生成的数据
const familyData = ref(null)
const batchData = ref([])
const isLoading = ref(false)
const results = ref(null)

// 生成单个家庭数据
async function handleGenerateSingle() {
  isLoading.value = true
  results.value = null

  try {
    if (aiConfig.value.mode === 'llm') {
      console.log('🤖 使用AI生成单个家庭数据...')
      familyData.value = await generateFamilyDataWithLLM(
        config,
        aiConfig.value.provider,
        aiConfig.value.apiKey,
      )
    } else {
      console.log('⚡ 使用Faker.js生成单个家庭数据...')
      familyData.value = generateFamilyData(config)
    }
    console.log('✅ 单个家庭数据生成成功!')
  } catch (error) {
    console.error('❌ 生成失败:', error)
    let errorMessage = error.message

    // 特殊处理各种API错误
    if (error.message.includes('429')) {
      errorMessage = 'AI服务请求频率过高，请稍后重试或切换到快速模式'
    } else if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
      errorMessage = '无法连接到后端服务。请确保后端服务已启动（运行 npm run server）'
    } else if (error.message.includes('TypeError: Failed to fetch')) {
      errorMessage = '网络请求失败，请检查后端服务是否运行在 http://localhost:3001'
    } else if (error.message.includes('ECONNREFUSED')) {
      errorMessage = '后端服务未启动，请先运行: npm run server'
    }

    results.value = {
      success: false,
      error: `生成失败: ${errorMessage}`,
      suggestion: error.message.includes('429') ? '建议切换到快速模式继续使用' : '请先启动后端服务',
    }
  } finally {
    isLoading.value = false
  }
}

// 生成批量数据
async function handleGenerateBatch() {
  isLoading.value = true
  results.value = null

  try {
    if (aiConfig.value.mode === 'llm') {
      console.log('🤖 使用AI批量生成家庭数据...')
      const result = await generateBatchFamilyDataWithLLM(
        config.batchCount,
        config,
        aiConfig.value.provider,
        aiConfig.value.apiKey,
      )
      batchData.value = result.success

      if (result.errors.length > 0) {
        results.value = {
          success: true,
          total: result.total,
          success: result.successCount,
          failed: result.errorCount,
          message: `批量生成完成：成功 ${result.successCount} 个，失败 ${result.errorCount} 个`,
        }
      }
    } else {
      console.log('⚡ 使用Faker.js批量生成家庭数据...')
      batchData.value = generateBatchFamilyData(config.batchCount, config)
    }
    console.log('✅ 批量家庭数据生成成功!')
  } catch (error) {
    console.error('❌ 批量生成失败:', error)
    let errorMessage = error.message

    // 特殊处理各种API错误
    if (error.message.includes('429')) {
      errorMessage = 'AI服务请求频率过高，请稍后重试或切换到快速模式'
    } else if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
      errorMessage = '无法连接到后端服务。请确保后端服务已启动（运行 npm run server）'
    } else if (error.message.includes('TypeError: Failed to fetch')) {
      errorMessage = '网络请求失败，请检查后端服务是否运行在 http://localhost:3001'
    } else if (error.message.includes('ECONNREFUSED')) {
      errorMessage = '后端服务未启动，请先运行: npm run server'
    }

    results.value = {
      success: false,
      error: `批量生成失败: ${errorMessage}`,
    }
  } finally {
    isLoading.value = false
  }
}

// 写入单个数据
async function handleWriteSingle() {
  if (!familyData.value) return

  isLoading.value = true
  const result = await mockApiWrite(familyData.value)
  results.value = result
  isLoading.value = false
}

// 批量写入数据
async function handleWriteBatch() {
  if (batchData.value.length === 0) return

  isLoading.value = true
  const result = await writeBatchFamilyData(batchData.value)
  results.value = result
  isLoading.value = false
}

// 清空数据
function handleClearData() {
  familyData.value = null
  batchData.value = []
  results.value = null
}

// 处理AI配置变化
function handleAiConfigChange(newConfig) {
  aiConfig.value = { ...newConfig }
  console.log('📝 AI配置已更新:', aiConfig.value)
}

// 页面加载时检查缓存
onMounted(() => {
  checkAndRestoreCache()
})

// 检查并恢复缓存数据
function checkAndRestoreCache() {
  try {
    const unsavedData = hasUnsavedData()
    if (unsavedData.hasFamilies) {
      const shouldRestore = confirm(`检测到 ${unsavedData.familyCount} 个家庭数据，是否要恢复？`)

      if (shouldRestore) {
        const result = restoreFromCache()
        if (result.success && result.families.length > 0) {
          // 恢复数据到当前会话
          if (result.families.length === 1) {
            familyData.value = result.families[0]
          } else {
            batchData.value = result.families
          }

          results.value = {
            success: true,
            message: `已恢复 ${result.families.length} 个家庭数据`,
          }

          console.log('✅ 缓存数据恢复成功')
        }
      }
    }
  } catch (error) {
    console.error('❌ 缓存恢复失败:', error)
  }
}
</script>

<style scoped>
/* Dashboard 整体布局 */
.dashboard {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  overflow: hidden;
}

/* 主面板区域 */
.dashboard-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  gap: 20px;
  padding: 20px 25px;
  overflow-y: auto;
  min-height: calc(100vh - 80px); /* 确保有足够高度 */
  background: transparent; /* 保持透明，显示渐变背景 */
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .dashboard-body {
    flex-direction: column;
    padding: 15px;
    overflow-y: auto;
    min-height: 0;
  }

  .dashboard-body::-webkit-scrollbar {
    width: 4px;
  }

  .dashboard-body::-webkit-scrollbar-track {
    background: transparent;
  }

  .dashboard-body::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }
}
</style>
