<template>
  <div class="content-panel">
    <div class="panel-header">
      <h3>📋 批量数据列表</h3>
      <span class="panel-count">共 {{ batchData.length }} 条记录</span>
    </div>
    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>序号</th>
            <th>父亲</th>
            <th>母亲</th>
            <th>孩子数</th>
            <th>地址</th>
            <th>ID</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(family, index) in displayData"
            :key="family.family_id"
            @click="selectFamily(family)"
            :class="{ selected: selectedFamily?.family_id === family.family_id }"
            class="clickable-row"
          >
            <td>{{ index + 1 }}</td>
            <td>{{ family.father.name }} ({{ family.father.age }})</td>
            <td>{{ family.mother.name }} ({{ family.mother.age }})</td>
            <td>{{ family.children.length }}</td>
            <td>{{ family.family_info.detailed_address.slice(0, 20) }}...</td>
            <td class="id-cell">{{ family.family_id.slice(0, 8) }}...</td>
          </tr>
        </tbody>
      </table>
      <div v-if="batchData.length > 10" class="table-footer">
        仅显示前10条，共{{ batchData.length }}条数据
      </div>
    </div>

    <!-- 选中家庭的详细信息 -->
    <div v-if="selectedFamily" class="family-detail-section">
      <div class="detail-header">
        <h4>📋 {{ selectedFamily.father.name }}家庭详细信息</h4>
        <button @click="selectedFamily = null" class="close-btn">✕</button>
      </div>
      <FamilyDataCard :familyData="selectedFamily" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import FamilyDataCard from './FamilyDataCard.vue'

const props = defineProps({
  batchData: {
    type: Array,
    required: true,
  },
})

// 选中的家庭
const selectedFamily = ref(null)

// 只显示前10条数据
const displayData = computed(() => {
  return props.batchData.slice(0, 10)
})

// 选择家庭查看详情
function selectFamily(family) {
  selectedFamily.value = family
}
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

.panel-count {
  font-size: 13px;
  color: #718096;
  background: #e2e8f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
}

/* 数据表格 */
.data-table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th {
  background: #f8fafc;
  padding: 15px 20px;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 15px 20px;
  border-bottom: 1px solid #f1f5f9;
  color: #2d3748;
}

.data-table tr:hover {
  background: #f8fafc;
}

.id-cell {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  color: #718096;
}

/* 可点击行样式 */
.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.clickable-row:hover {
  background-color: rgba(103, 126, 234, 0.1);
}

.clickable-row.selected {
  background-color: rgba(103, 126, 234, 0.2);
}

/* 详细信息区域 */
.family-detail-section {
  margin-top: 20px;
  border-top: 2px solid #e2e8f0;
  padding-top: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.detail-header h4 {
  margin: 0;
  color: #2d3748;
  font-size: 18px;
}

.close-btn {
  background: #f56565;
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e53e3e;
  transform: scale(1.1);
}

.table-footer {
  padding: 15px 25px;
  text-align: center;
  color: #718096;
  font-size: 13px;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
}

/* 响应式 */
@media (max-width: 768px) {
  .panel-header {
    padding: 15px 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .data-table {
    font-size: 12px;
  }

  .data-table th,
  .data-table td {
    padding: 10px 15px;
  }
}
</style>
