// 大模型家庭数据生成器
// 支持多种AI服务：OpenAI、Claude、通义千问、智谱AI等
// 集成缓存功能，防止数据丢失

/**
 * LLM配置
 */
const LLM_CONFIGS = {
  openai: {
    name: 'OpenAI GPT',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    }),
  },
  qwen: {
    name: '通义千问',
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-turbo',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    }),
  },
  zhipu: {
    name: '智谱AI',
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    model: 'glm-4',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    }),
  },
  claude: {
    name: 'Claude',
    endpoint: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-haiku-20240307',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    }),
  },
}

/**
 * 生成家庭数据的提示词模板
 */
function generateFamilyPrompt(config) {
  return `请生成一个真实合理的中国家庭信息，要求如下：

家庭配置：
- 父亲年龄：${config.fatherAgeMin}-${config.fatherAgeMax}岁
- 母亲年龄：${config.motherAgeMin}-${config.motherAgeMax}岁  
- 孩子数量：${config.childrenCount}个

请确保生成的数据符合以下要求：
1. 姓名要符合中国人命名习惯
2. 职业和收入要匹配学历和年龄
3. 兴趣爱好要符合年龄和职业特点
4. 家庭地址要真实存在的中国城市
5. 家庭成员之间的信息要有逻辑关联性
6. 孩子的年级要与年龄匹配
7. 生活场景要真实合理，符合中国家庭日常

请严格按照以下JSON格式返回数据，不要添加任何其他文字。确保JSON格式完全正确，所有字符串都用双引号包围，所有对象和数组都正确闭合：

{
  "family_id": "生成UUID",
  "father": {
    "name": "父亲姓名",
    "age": 父亲年龄数字,
    "gender": "男",
    "education": "学历(博士/硕士/本科/大专/高中/初中)",
    "job": "职业",
    "salary": 月收入数字,
    "hobbies": ["爱好1", "爱好2", "爱好3"],
    "personality": ["性格1", "性格2"],
    "health_status": "健康状况",
    "id_number": "身份证号(18位数字)"
  },
  "mother": {
    "name": "母亲姓名", 
    "age": 母亲年龄数字,
    "gender": "女",
    "education": "学历",
    "job": "职业",
    "salary": 月收入数字,
    "hobbies": ["爱好1", "爱好2"],
    "personality": ["性格1", "性格2"], 
    "health_status": "健康状况",
    "id_number": "身份证号"
  },
  "children": [
    {
      "name": "孩子姓名",
      "age": 年龄数字,
      "gender": "男/女",
      "education": "当前学历",
      "job": "学生/无",
      "salary": 0,
      "hobbies": ["爱好1", "爱好2"],
      "personality": ["性格1", "性格2"],
      "health_status": "健康状况", 
      "id_number": "身份证号",
      "school_grade": "年级(如小学3年级)"
    }
  ],
  "family_info": {
    "city": "城市名称",
    "district": "区县名称", 
    "detailed_address": "详细地址",
    "housing_type": "住房类型(公寓/别墅/联排/平房/复式)",
    "housing_area": 住房面积数字,
    "family_income": 家庭总收入数字,
    "car_count": 汽车数量,
    "pets": ["宠物类型"],
    "family_motto": "家庭理念"
  },
  "contact": {
    "phone": "手机号码",
    "email": "邮箱地址", 
    "wechat": "微信号",
    "emergency_contact": "紧急联系人",
    "emergency_phone": "紧急联系电话"
  },
  "daily_life": {
    "weekly_schedule": {
      "monday": {
        "wake_up_time": "6:30",
        "morning_activities": "起床洗漱、准备早餐、叫孩子起床",
        "morning_breakfast": "豆浆、包子、咸菜",
        "morning_conversations": "父亲对母亲说：今天天气不错，记得给孩子多穿件衣服。母亲对孩子说：快点吃，不然上学要迟到了。",
        "afternoon_activities": "工作、接孩子放学、买菜",
        "afternoon_lunch": "工作餐/学校食堂",
        "afternoon_conversations": "父亲对同事说：这个项目进度怎么样？母亲对孩子说：今天在学校学了什么？",
        "evening_activities": "做饭、辅导作业、家庭聚餐",
        "evening_dinner": "红烧肉、青菜汤、米饭",
        "evening_conversations": "全家讨论：今天过得怎么样？有什么有趣的事情吗？父亲辅导孩子：这道数学题应该这样解...",
        "bedtime": "22:00",
        "bedtime_conversation": "讨论周末计划，决定去公园玩"
      },
      "tuesday": {
        "wake_up_time": "6:30",
        "morning_activities": "起床洗漱、准备早餐、叫孩子起床",
        "morning_breakfast": "牛奶、面包、鸡蛋",
        "morning_conversations": "母亲问孩子：昨晚睡得好吗？",
        "afternoon_activities": "工作、接孩子放学、去超市",
        "afternoon_lunch": "工作餐/学校食堂",
        "afternoon_conversations": "母亲问孩子：今天在学校和同学玩得开心吗？",
        "evening_activities": "做饭、家庭电影时间、聊天",
        "evening_dinner": "西红柿炒鸡蛋、米饭、紫菜蛋花汤",
        "evening_conversations": "全家讨论：今天看什么电影？孩子兴奋地说：这个角色好厉害！",
        "bedtime": "22:30",
        "bedtime_conversation": "分享学校趣事，讨论明天吃什么"
      },
      "wednesday": {
        "wake_up_time": "6:30",
        "morning_activities": "起床洗漱、准备早餐、叫孩子起床",
        "morning_breakfast": "小米粥、咸鸭蛋、馒头",
        "morning_conversations": "父亲对母亲说：今天周三了，这周过得真快",
        "afternoon_activities": "工作、接孩子放学、回家",
        "afternoon_lunch": "工作餐/学校食堂",
        "afternoon_conversations": "母亲问孩子：今天有音乐课吗？",
        "evening_activities": "做饭、练习钢琴、准备作业",
        "evening_dinner": "牛肉面、凉拌黄瓜",
        "evening_conversations": "母亲问孩子：钢琴练习得怎么样？父亲问孩子：作业写完了吗？",
        "bedtime": "22:00",
        "bedtime_conversation": "讨论孩子的兴趣班，决定继续学钢琴"
      },
      "thursday": {
        "wake_up_time": "6:30",
        "morning_activities": "起床洗漱、准备早餐、叫孩子起床",
        "morning_breakfast": "豆浆、油条、咸菜",
        "morning_conversations": "全家互相鼓励：今天周四了，再坚持一天就周末了",
        "afternoon_activities": "工作、接孩子放学、散步",
        "afternoon_lunch": "工作餐/学校食堂",
        "afternoon_conversations": "母亲问孩子：今天在学校表现怎么样？",
        "evening_activities": "做饭、阅读时间、聊天",
        "evening_dinner": "炒饭、蛋花汤",
        "evening_conversations": "全家讨论：今天读什么书？孩子说：这个故事真有趣！",
        "bedtime": "22:00",
        "bedtime_conversation": "讨论最近的学习情况，鼓励孩子继续努力"
      },
      "friday": {
        "wake_up_time": "6:30",
        "morning_activities": "起床洗漱、准备早餐、叫孩子起床",
        "morning_breakfast": "牛奶、煎蛋、吐司",
        "morning_conversations": "全家兴奋地说：终于到周五了！",
        "afternoon_activities": "工作、接孩子放学、准备聚餐",
        "afternoon_lunch": "工作餐/学校食堂",
        "afternoon_conversations": "母亲问孩子：今晚想吃什么？",
        "evening_activities": "聚餐、聊天、放松",
        "evening_dinner": "火锅、各种蔬菜和肉类",
        "evening_conversations": "全家庆祝：这周辛苦了，好好放松一下。父母讨论：周末有什么计划？",
        "bedtime": "22:30",
        "bedtime_conversation": "讨论周末活动计划，决定去游乐园"
      },
      "saturday": {
        "wake_up_time": "8:00",
        "morning_activities": "睡懒觉、起床洗漱、买菜",
        "morning_breakfast": "稀饭、咸菜、包子",
        "morning_conversations": "父母感慨：今天不用上班，真舒服",
        "afternoon_activities": "家庭出游、购物、游玩",
        "afternoon_lunch": "外面餐厅",
        "afternoon_conversations": "全家讨论：想去哪里玩？孩子兴奋地说：这个玩具好酷！",
        "evening_activities": "看电影、聚餐、聊天",
        "evening_dinner": "披萨、可乐、薯条",
        "evening_conversations": "全家分享：今天玩得开心吗？父母讨论：下周去哪里旅行？",
        "bedtime": "23:00",
        "bedtime_conversation": "讨论旅行计划，决定去海边度假"
      },
      "sunday": {
        "wake_up_time": "7:30",
        "morning_activities": "晨练、准备午餐、整理家务",
        "morning_breakfast": "豆浆、煎饼、咸菜",
        "morning_conversations": "父母交流：今天天气真好，适合运动",
        "afternoon_activities": "家庭聚会、休息、准备下周",
        "afternoon_lunch": "家庭聚餐",
        "afternoon_conversations": "全家总结：这周过得怎么样？父母讨论：下周的工作安排",
        "evening_activities": "准备下周、早睡、整理",
        "evening_dinner": "炖菜、米饭",
        "evening_conversations": "全家总结：总结这一周。父母鼓励：下周要加油！",
        "bedtime": "22:00",
        "bedtime_conversation": "总结一周，为下周做准备"
      }
    },
    "recent_events": [
      {
        "date": "最近日期",
        "event": "最近发生的事件",
        "participants": ["参与的家庭成员"],
        "description": "事件详细描述"
      },
      {
        "date": "另一个最近日期", 
        "event": "另一个最近发生的事件",
        "participants": ["参与的家庭成员"],
        "description": "事件详细描述"
      }
    ],
    "family_plans": [
      {
        "plan_type": "计划类型(如：旅行、学习、购物)",
        "description": "计划描述",
        "target_date": "目标日期",
        "budget": "预算金额",
        "status": "计划状态(进行中/已完成/已取消)"
      },
      {
        "plan_type": "另一个计划类型",
        "description": "另一个计划描述", 
        "target_date": "另一个目标日期",
        "budget": "另一个预算金额",
        "status": "另一个计划状态"
      }
    ],
    "family_chat_topics": [
      "最近家庭聊天话题1",
      "最近家庭聊天话题2", 
      "最近家庭聊天话题3"
    ],
    "favorite_foods": [
      "家庭喜爱的食物1",
      "家庭喜爱的食物2",
      "家庭喜爱的食物3"
    ],
    "family_activities": [
      "家庭常做的活动1",
      "家庭常做的活动2",
      "家庭常做的活动3"
    ]
  },
  "created_at": "当前ISO时间",
  "updated_at": "当前ISO时间"
}`
}

/**
 * 调用OpenAI API（通过后端代理）
 */
async function callOpenAI(prompt, apiKey) {
  const response = await fetch('http://localhost:3001/api/generate-family', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      config: {},
      provider: 'openai',
      apiKey: apiKey,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`OpenAI API error: ${errorData.error || response.statusText}`)
  }

  const data = await response.json()
  return JSON.stringify(data.data)
}

/**
 * 调用通义千问API（通过后端代理）
 */
async function callQwen(prompt, apiKey) {
  const response = await fetch('http://localhost:3001/api/generate-family', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      config: {},
      provider: 'qwen',
      apiKey: apiKey,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`通义千问 API error: ${errorData.error || response.statusText}`)
  }

  const data = await response.json()
  return JSON.stringify(data.data)
}

/**
 * 调用智谱AI API（通过后端代理）
 */
async function callZhipu(prompt, apiKey) {
  const response = await fetch('http://localhost:3001/api/generate-family', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      config: {},
      provider: 'zhipu',
      apiKey: apiKey,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`智谱AI API error: ${errorData.error || response.statusText}`)
  }

  const data = await response.json()
  return JSON.stringify(data.data)
}

/**
 * 调用Claude API（通过后端代理）
 */
async function callClaude(prompt, apiKey) {
  const response = await fetch('http://localhost:3001/api/generate-family', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      config: {},
      provider: 'claude',
      apiKey: apiKey,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Claude API error: ${errorData.error || response.statusText}`)
  }

  const data = await response.json()
  return JSON.stringify(data.data)
}

/**
 * 通用LLM调用函数
 */
async function callLLM(provider, prompt, apiKey) {
  switch (provider) {
    case 'openai':
      return await callOpenAI(prompt, apiKey)
    case 'qwen':
      return await callQwen(prompt, apiKey)
    case 'zhipu':
      return await callZhipu(prompt, apiKey)
    case 'claude':
      return await callClaude(prompt, apiKey)
    default:
      throw new Error(`不支持的LLM提供商: ${provider}`)
  }
}

/**
 * 解析LLM返回的JSON数据
 */
function parseLLMResponse(response) {
  try {
    // 尝试提取JSON部分（有些模型会返回额外的文字）
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    // 如果没有找到JSON，尝试直接解析
    return JSON.parse(response)
  } catch (error) {
    throw new Error(`无法解析LLM返回的数据: ${error.message}`)
  }
}

/**
 * 使用LLM生成单个家庭数据（通过后端代理）
 * @param {Object} config 配置参数
 * @param {string} provider LLM提供商 (openai/qwen/zhipu/claude)
 * @param {string} apiKey API密钥
 * @param {boolean} saveToCache 是否保存到缓存，默认true
 * @returns {Object} 家庭数据
 */
export async function generateFamilyDataWithLLM(config = {}, provider = 'openai', apiKey, saveToCache = true) {
  if (!apiKey) {
    throw new Error('请提供API密钥')
  }

  const defaultConfig = {
    fatherAgeMin: 30,
    fatherAgeMax: 50,
    motherAgeMin: 28,
    motherAgeMax: 48,
    childrenCount: 2,
    ...config,
  }

  try {
    console.log(`正在使用 ${LLM_CONFIGS[provider].name} 生成家庭数据...`)

    const response = await fetch('http://localhost:3001/api/generate-family', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config: defaultConfig,
        provider: provider,
        apiKey: apiKey,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`LLM生成失败: ${errorData.error || response.statusText}`)
    }

    const data = await response.json()
    const familyData = data.data
    
    // 自动保存到缓存
    if (saveToCache) {
      try {
        const { saveGeneratedFamilies, saveSessionInfo } = await import('./cacheManager.js')
        saveGeneratedFamilies(familyData)
        saveSessionInfo({
          lastAction: 'generate_single',
          provider: provider,
          familyId: familyData.family_id,
          timestamp: Date.now()
        })
        console.log('✅ 数据已自动保存到缓存')
      } catch (cacheError) {
        console.warn('⚠️ 缓存保存失败，但数据生成成功:', cacheError.message)
      }
    }
    
    console.log('✅ LLM生成成功!')
    return familyData
  } catch (error) {
    console.error('❌ LLM生成失败:', error)
    throw error
  }
}

/**
 * 批量生成家庭数据（通过后端代理）
 * @param {number} count 生成数量
 * @param {Object} config 配置参数
 * @param {string} provider LLM提供商
 * @param {string} apiKey API密钥
 * @param {boolean} saveToCache 是否保存到缓存，默认true
 * @returns {Array} 家庭数据数组
 */
export async function generateBatchFamilyDataWithLLM(count, config, provider, apiKey, saveToCache = true) {
  if (!apiKey) {
    throw new Error('请提供API密钥')
  }

  console.log(`开始批量生成 ${count} 个家庭数据...`)

  try {
    const response = await fetch('http://localhost:3001/api/generate-batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        count: count,
        config: config,
        provider: provider,
        apiKey: apiKey,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`批量生成失败: ${errorData.error || response.statusText}`)
    }

    const data = await response.json()
    const result = data.data
    
    // 自动保存成功的数据到缓存
    if (saveToCache && result.success && result.success.length > 0) {
      try {
        const { saveGeneratedFamilies, saveSessionInfo } = await import('./cacheManager.js')
        saveGeneratedFamilies(result.success)
        saveSessionInfo({
          lastAction: 'generate_batch',
          provider: provider,
          count: result.successCount,
          timestamp: Date.now()
        })
        console.log(`✅ ${result.successCount} 个家庭数据已自动保存到缓存`)
      } catch (cacheError) {
        console.warn('⚠️ 缓存保存失败，但数据生成成功:', cacheError.message)
      }
    }
    
    console.log(
      `✅ 批量生成完成: 成功 ${result.successCount} 个，失败 ${result.errorCount} 个`,
    )

    return result
  } catch (error) {
    console.error('❌ 批量生成失败:', error)
    throw error
  }
}

/**
 * 获取支持的LLM提供商列表
 */
export function getSupportedProviders() {
  return Object.keys(LLM_CONFIGS).map((key) => ({
    key,
    name: LLM_CONFIGS[key].name,
    model: LLM_CONFIGS[key].model,
  }))
}

/**
 * 模拟LLM生成（用于测试，无需API密钥）
 */
export async function mockLLMGenerate(config = {}) {
  console.log('🔄 使用模拟LLM生成数据...')

  // 模拟API延迟
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const mockData = {
    family_id: `mock-${Date.now()}`,
    father: {
      name: '张建国',
      age: 38,
      gender: '男',
      education: '本科',
      job: '软件工程师',
      salary: 25000,
      hobbies: ['编程', '读书', '跑步'],
      personality: ['稳重', '责任心强'],
      health_status: '良好',
      id_number: '110101198501234567',
    },
    mother: {
      name: '李美华',
      age: 35,
      gender: '女',
      education: '硕士',
      job: '会计师',
      salary: 18000,
      hobbies: ['烹饪', '瑜伽', '旅游'],
      personality: ['细心', '温和'],
      health_status: '优秀',
      id_number: '110101198801234567',
    },
    children: [
      {
        name: '张小明',
        age: 10,
        gender: '男',
        education: '小学',
        job: '学生',
        salary: 0,
        hobbies: ['足球', '画画', '游戏'],
        personality: ['活泼', '好奇'],
        health_status: '优秀',
        id_number: '110101201401234567',
        school_grade: '小学5年级',
      },
    ],
    family_info: {
      city: '北京市',
      district: '朝阳区',
      detailed_address: '朝阳区望京街道某某小区3号楼2单元101室',
      housing_type: '公寓',
      housing_area: 120,
      family_income: 43000,
      car_count: 1,
      pets: ['金毛'],
      family_motto: '和谐美满，积极向上',
    },
    contact: {
      phone: '13800138000',
      email: 'zhangjianguo@email.com',
      wechat: 'zjg123456',
      emergency_contact: '张父',
      emergency_phone: '13900139000',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  console.log('✅ 模拟LLM生成完成!')
  return mockData
}
