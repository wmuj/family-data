<template>
  <div class="content-panel">
    <div class="panel-header">
      <h3>👨‍👩‍👧‍👦 家庭数据预览</h3>
      <span class="panel-id">ID: {{ familyData.family_id.slice(0, 8) }}...</span>
    </div>
    <div class="family-info">
      <!-- 基础信息 -->
      <div class="section">
        <h4>👨‍👩‍👧‍👦 家庭成员</h4>
        <div class="member-grid">
          <!-- 父亲信息 -->
          <div class="member-card father">
            <div class="member-header">
              <span class="member-title">👨 父亲</span>
              <span class="member-name">{{ familyData.father.name }}</span>
            </div>
            <div class="member-details">
              <div class="detail-item">
                <span class="label">年龄:</span>
                <span>{{ familyData.father.age }}岁</span>
              </div>
              <div class="detail-item">
                <span class="label">学历:</span>
                <span>{{ familyData.father.education }}</span>
              </div>
              <div class="detail-item">
                <span class="label">职业:</span>
                <span>{{ familyData.father.job }}</span>
              </div>
              <div class="detail-item" v-if="familyData.father.salary > 0">
                <span class="label">收入:</span>
                <span>{{ familyData.father.salary.toLocaleString() }}元/月</span>
              </div>
              <div class="detail-item">
                <span class="label">爱好:</span>
                <span>{{ familyData.father.hobbies.join('、') }}</span>
              </div>
              <div class="detail-item">
                <span class="label">性格:</span>
                <span>{{ familyData.father.personality.join('、') }}</span>
              </div>
            </div>
          </div>

          <!-- 母亲信息 -->
          <div class="member-card mother">
            <div class="member-header">
              <span class="member-title">👩 母亲</span>
              <span class="member-name">{{ familyData.mother.name }}</span>
            </div>
            <div class="member-details">
              <div class="detail-item">
                <span class="label">年龄:</span>
                <span>{{ familyData.mother.age }}岁</span>
              </div>
              <div class="detail-item">
                <span class="label">学历:</span>
                <span>{{ familyData.mother.education }}</span>
              </div>
              <div class="detail-item">
                <span class="label">职业:</span>
                <span>{{ familyData.mother.job }}</span>
              </div>
              <div class="detail-item" v-if="familyData.mother.salary > 0">
                <span class="label">收入:</span>
                <span>{{ familyData.mother.salary.toLocaleString() }}元/月</span>
              </div>
              <div class="detail-item">
                <span class="label">爱好:</span>
                <span>{{ familyData.mother.hobbies.join('、') }}</span>
              </div>
              <div class="detail-item">
                <span class="label">性格:</span>
                <span>{{ familyData.mother.personality.join('、') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 孩子信息 -->
      <div v-if="familyData.children.length > 0" class="section">
        <h4>👶 孩子信息</h4>
        <div class="children-grid">
          <div v-for="child in familyData.children" :key="child.name" class="child-card">
            <div class="child-header">
              <span class="child-title"
                >{{ child.gender === '男' ? '👦' : '👧' }} {{ child.name }}</span
              >
              <span class="child-age">{{ child.age }}岁</span>
            </div>
            <div class="child-details">
              <div class="detail-item">
                <span class="label">年级:</span>
                <span>{{ child.school_grade }}</span>
              </div>
              <div class="detail-item" v-if="child.job !== '无'">
                <span class="label">状态:</span>
                <span>{{ child.job }}</span>
              </div>
              <div class="detail-item">
                <span class="label">爱好:</span>
                <span>{{ child.hobbies.join('、') }}</span>
              </div>
              <div class="detail-item">
                <span class="label">性格:</span>
                <span>{{ child.personality.join('、') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 家庭信息 -->
      <div class="section">
        <h4>🏠 家庭信息</h4>
        <div class="info-grid">
          <div class="info-item">
            <label>居住城市</label>
            <span>{{ familyData.family_info.city }}</span>
          </div>
          <div class="info-item">
            <label>详细地址</label>
            <span>{{ familyData.family_info.detailed_address }}</span>
          </div>
          <div class="info-item">
            <label>住房类型</label>
            <span>{{ familyData.family_info.housing_type }}</span>
          </div>
          <div class="info-item">
            <label>住房面积</label>
            <span>{{ familyData.family_info.housing_area }}平方米</span>
          </div>
          <div class="info-item">
            <label>家庭收入</label>
            <span>{{ familyData.family_info.family_income.toLocaleString() }}元/月</span>
          </div>
          <div class="info-item">
            <label>汽车数量</label>
            <span>{{ familyData.family_info.car_count }}辆</span>
          </div>
          <div class="info-item" v-if="familyData.family_info.pets.length > 0">
            <label>宠物</label>
            <span>{{ familyData.family_info.pets.join('、') }}</span>
          </div>
          <div class="info-item">
            <label>家庭理念</label>
            <span>{{ familyData.family_info.family_motto }}</span>
          </div>
        </div>
      </div>

      <!-- 联系方式 -->
      <div class="section">
        <h4>📞 联系方式</h4>
        <div class="info-grid">
          <div class="info-item">
            <label>手机号码</label>
            <span>{{ familyData.contact.phone }}</span>
          </div>
          <div class="info-item">
            <label>电子邮箱</label>
            <span>{{ familyData.contact.email }}</span>
          </div>
          <div class="info-item">
            <label>微信号</label>
            <span>{{ familyData.contact.wechat }}</span>
          </div>
          <div class="info-item">
            <label>紧急联系人</label>
            <span>{{ familyData.contact.emergency_contact }}</span>
          </div>
          <div class="info-item">
            <label>紧急联系电话</label>
            <span>{{ familyData.contact.emergency_phone }}</span>
          </div>
        </div>
      </div>

      <!-- 一周生活记录 -->
      <div class="section" v-if="familyData.daily_life && familyData.daily_life.weekly_schedule">
        <h4>📅 一周生活记录</h4>
        <div class="weekly-life">
          <div
            v-for="(dayData, day) in familyData.daily_life.weekly_schedule"
            :key="day"
            class="day-record"
          >
            <div class="day-header">
              <span class="day-name">{{ getDayName(day) }}</span>
            </div>
            <div class="day-events">
              <!-- 起床时间 -->
              <div class="time-info">
                <span class="time-label">起床时间:</span>
                <span class="time-value">{{ dayData.wake_up_time }}</span>
                <span class="time-label">睡觉时间:</span>
                <span class="time-value">{{ dayData.bedtime }}</span>
              </div>

              <!-- 早上例行公事 -->
              <div class="routine-section" v-if="dayData.morning_activities">
                <div class="routine-header">
                  <span class="routine-title">早上例行公事</span>
                </div>
                <div class="routine-content">
                  <div class="routine-activities">
                    <span class="activity-label">活动:</span>
                    <span class="activity-list">{{ dayData.morning_activities }}</span>
                  </div>
                  <div class="routine-meal">
                    <span class="meal-label">早餐:</span>
                    <span class="meal-content">{{ dayData.morning_breakfast }}</span>
                  </div>
                  <div class="routine-conversations" v-if="dayData.morning_conversations">
                    <div class="conversation-item">
                      <span class="conv-content">{{ dayData.morning_conversations }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 下午例行公事 -->
              <div class="routine-section" v-if="dayData.afternoon_activities">
                <div class="routine-header">
                  <span class="routine-title">下午例行公事</span>
                </div>
                <div class="routine-content">
                  <div class="routine-activities">
                    <span class="activity-label">活动:</span>
                    <span class="activity-list">{{ dayData.afternoon_activities }}</span>
                  </div>
                  <div class="routine-meal">
                    <span class="meal-label">午餐:</span>
                    <span class="meal-content">{{ dayData.afternoon_lunch }}</span>
                  </div>
                  <div class="routine-conversations" v-if="dayData.afternoon_conversations">
                    <div class="conversation-item">
                      <span class="conv-content">{{ dayData.afternoon_conversations }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 晚上例行公事 -->
              <div class="routine-section" v-if="dayData.evening_activities">
                <div class="routine-header">
                  <span class="routine-title">晚上例行公事</span>
                </div>
                <div class="routine-content">
                  <div class="routine-activities">
                    <span class="activity-label">活动:</span>
                    <span class="activity-list">{{ dayData.evening_activities }}</span>
                  </div>
                  <div class="routine-meal">
                    <span class="meal-label">晚餐:</span>
                    <span class="meal-content">{{ dayData.evening_dinner }}</span>
                  </div>
                  <div class="routine-conversations" v-if="dayData.evening_conversations">
                    <div class="conversation-item">
                      <span class="conv-content">{{ dayData.evening_conversations }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 睡前对话 -->
              <div class="bedtime-conversation" v-if="dayData.bedtime_conversation">
                <span class="bedtime-label">睡前对话:</span>
                <span class="bedtime-content">{{ dayData.bedtime_conversation }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 家庭计划和活动 -->
      <div class="section" v-if="familyData.daily_life">
        <h4>🎯 家庭计划和活动</h4>
        <div class="plans-activities">
          <!-- 最近事件 -->
          <div
            v-if="
              familyData.daily_life.recent_events && familyData.daily_life.recent_events.length > 0
            "
            class="subsection"
          >
            <h5>📰 最近事件</h5>
            <div class="events-list">
              <div
                v-for="(event, index) in familyData.daily_life.recent_events"
                :key="index"
                class="event-card"
              >
                <div class="event-date">{{ event.date }}</div>
                <div class="event-title">{{ event.event }}</div>
                <div class="event-description">{{ event.description }}</div>
                <div class="event-participants">参与者: {{ event.participants.join('、') }}</div>
              </div>
            </div>
          </div>

          <!-- 家庭计划 -->
          <div
            v-if="
              familyData.daily_life.family_plans && familyData.daily_life.family_plans.length > 0
            "
            class="subsection"
          >
            <h5>📋 家庭计划</h5>
            <div class="plans-list">
              <div
                v-for="(plan, index) in familyData.daily_life.family_plans"
                :key="index"
                class="plan-card"
              >
                <div class="plan-type">{{ plan.plan_type }}</div>
                <div class="plan-description">{{ plan.description }}</div>
                <div class="plan-details">
                  <span class="plan-date">目标日期: {{ plan.target_date }}</span>
                  <span class="plan-budget">预算: {{ plan.budget }}</span>
                  <span class="plan-status" :class="getStatusClass(plan.status)">{{
                    plan.status
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 聊天话题 -->
          <div
            v-if="
              familyData.daily_life.family_chat_topics &&
              familyData.daily_life.family_chat_topics.length > 0
            "
            class="subsection"
          >
            <h5>💬 聊天话题</h5>
            <div class="topics-list">
              <span
                v-for="(topic, index) in familyData.daily_life.family_chat_topics"
                :key="index"
                class="topic-tag"
              >
                {{ topic }}
              </span>
            </div>
          </div>

          <!-- 喜爱食物 -->
          <div
            v-if="
              familyData.daily_life.favorite_foods &&
              familyData.daily_life.favorite_foods.length > 0
            "
            class="subsection"
          >
            <h5>🍽️ 喜爱食物</h5>
            <div class="foods-list">
              <span
                v-for="(food, index) in familyData.daily_life.favorite_foods"
                :key="index"
                class="food-tag"
              >
                {{ food }}
              </span>
            </div>
          </div>

          <!-- 家庭活动 -->
          <div
            v-if="
              familyData.daily_life.family_activities &&
              familyData.daily_life.family_activities.length > 0
            "
            class="subsection"
          >
            <h5>🎪 家庭活动</h5>
            <div class="activities-list">
              <span
                v-for="(activity, index) in familyData.daily_life.family_activities"
                :key="index"
                class="activity-tag"
              >
                {{ activity }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  familyData: {
    type: Object,
    required: true,
  },
})

// 获取中文星期名称
function getDayName(day) {
  const dayNames = {
    monday: '周一',
    tuesday: '周二',
    wednesday: '周三',
    thursday: '周四',
    friday: '周五',
    saturday: '周六',
    sunday: '周日',
  }
  return dayNames[day] || day
}

// 获取状态样式类
function getStatusClass(status) {
  const statusClasses = {
    进行中: 'status-progress',
    已完成: 'status-completed',
    已取消: 'status-cancelled',
  }
  return statusClasses[status] || 'status-default'
}
</script>

<style scoped>
.content-panel {
  background: rgba(255, 255, 255, 0.95); /* 半透明白色 */
  backdrop-filter: blur(10px); /* 毛玻璃效果 */
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  max-height: 80vh; /* 限制最大高度，适应上下布局 */
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

.panel-id {
  font-size: 13px;
  color: #718096;
  background: #e2e8f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
}

/* 家庭信息展示 */
.family-info {
  padding: 25px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 一周生活记录样式 */
.weekly-life {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.day-record {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.day-header {
  background: #4299e1;
  color: white;
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
}

.day-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.day-events {
  padding: 0;
}

.event-item {
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  transition: background-color 0.2s;
}

.event-item:last-child {
  border-bottom: none;
}

.event-item:hover {
  background: #f1f5f9;
}

.event-description {
  color: #2d3748;
  font-size: 14px;
  line-height: 1.6;
  text-align: justify;
}

.section {
  margin-bottom: 30px;
  padding-bottom: 25px;
  border-bottom: 1px solid #f1f5f9;
}

.section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section h4 {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 家庭成员卡片 */
.member-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.member-card {
  background: linear-gradient(145deg, #f8fafc, #ffffff);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.member-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.member-card.father {
  border-left: 4px solid #4299e1;
}

.member-card.mother {
  border-left: 4px solid #ed64a6;
}

.member-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e2e8f0;
}

.member-title {
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
}

.member-name {
  font-size: 16px;
  font-weight: 700;
  color: #2d3748;
}

.member-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 孩子信息 */
.children-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 15px;
}

.child-card {
  background: linear-gradient(145deg, #fef5e7, #ffffff);
  border: 1px solid #fbd38d;
  border-radius: 10px;
  padding: 15px;
  transition: all 0.3s ease;
}

.child-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(251, 211, 141, 0.3);
}

.child-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #fbd38d;
}

.child-title {
  font-size: 14px;
  font-weight: 600;
  color: #744210;
}

.child-age {
  font-size: 12px;
  background: #fbd38d;
  color: #744210;
  padding: 2px 8px;
  border-radius: 12px;
}

.child-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* 详细信息项 */
.detail-item {
  display: flex;
  gap: 8px;
  font-size: 13px;
  line-height: 1.4;
}

.detail-item .label {
  font-weight: 600;
  color: #4a5568;
  min-width: 50px;
  flex-shrink: 0;
}

.detail-item span:last-child {
  color: #2d3748;
  font-weight: 500;
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.info-item label {
  font-size: 12px;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item span {
  font-size: 14px;
  color: #2d3748;
  font-weight: 500;
}

/* 响应式 */
@media (max-width: 768px) {
  .panel-header {
    padding: 15px 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .family-info {
    padding: 20px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}

/* 一周生活记录样式 */
.weekly-life {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-top: 16px;
}

.day-record {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
  max-height: 80vh;
  overflow-y: auto;
}

.day-record:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.day-header {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.day-name {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-item {
  display: flex;
  gap: 8px;
  font-size: 13px;
  line-height: 1.4;
}

.event-time {
  font-weight: 600;
  color: #4a5568;
  min-width: 40px;
}

.event-description {
  color: #718096;
  flex: 1;
}

/* 家庭计划和活动样式 */
.plans-activities {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 16px;
}

.subsection {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
}

.subsection h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
}

/* 事件列表 */
.events-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 12px;
}

.event-date {
  font-size: 12px;
  color: #718096;
  margin-bottom: 4px;
}

.event-title {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.event-description {
  font-size: 13px;
  color: #4a5568;
  margin-bottom: 4px;
}

.event-participants {
  font-size: 12px;
  color: #718096;
}

/* 计划列表 */
.plans-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.plan-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 12px;
}

.plan-type {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.plan-description {
  font-size: 13px;
  color: #4a5568;
  margin-bottom: 8px;
}

.plan-details {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.plan-date,
.plan-budget {
  color: #718096;
}

.plan-status {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.status-progress {
  background: #bee3f8;
  color: #2b6cb0;
}

.status-completed {
  background: #c6f6d5;
  color: #2f855a;
}

.status-cancelled {
  background: #fed7d7;
  color: #c53030;
}

.status-default {
  background: #e2e8f0;
  color: #4a5568;
}

/* 标签列表 */
.topics-list,
.foods-list,
.activities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.topic-tag,
.food-tag,
.activity-tag {
  background: #e6fffa;
  color: #234e52;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid #b2f5ea;
}

.food-tag {
  background: #fef5e7;
  color: #744210;
  border-color: #fbd38d;
}

.activity-tag {
  background: #f0fff4;
  color: #22543d;
  border-color: #9ae6b4;
}

/* 详细生活场景样式 */
.time-info {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding: 8px 12px;
  background: #e6fffa;
  border-radius: 6px;
  font-size: 13px;
}

.time-label {
  font-weight: 600;
  color: #234e52;
}

.time-value {
  color: #2d3748;
  font-weight: 500;
}

.routine-section {
  margin-bottom: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}

.routine-header {
  background: #f7fafc;
  padding: 8px 12px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  gap: 8px;
  align-items: center;
}

.routine-time {
  background: #4299e1;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.routine-title {
  font-size: 13px;
  font-weight: 600;
  color: #2d3748;
}

.routine-content {
  padding: 12px;
  background: white;
}

.routine-activities,
.routine-meal {
  margin-bottom: 8px;
  font-size: 13px;
}

.activity-label,
.meal-label {
  font-weight: 600;
  color: #4a5568;
  margin-right: 8px;
}

.activity-list,
.meal-content {
  color: #718096;
}

.routine-conversations {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f1f5f9;
}

.conversation-item {
  margin-bottom: 6px;
  font-size: 12px;
  line-height: 1.4;
}

.conv-participants {
  font-weight: 600;
  color: #2b6cb0;
  margin-right: 6px;
}

.conv-content {
  color: #4a5568;
}

.bedtime-conversation {
  margin-top: 12px;
  padding: 8px 12px;
  background: #fef5e7;
  border-radius: 6px;
  border-left: 3px solid #f6ad55;
  font-size: 13px;
}

.bedtime-label {
  font-weight: 600;
  color: #744210;
  margin-right: 8px;
}

.bedtime-content {
  color: #744210;
}
</style>
