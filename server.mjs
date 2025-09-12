import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Use built-in fetch API (Node.js 18+)
// If node-fetch is needed for older versions, it will be installed in production
let fetch
try {
  // Try using the built-in fetch first (Node.js 18+)
  fetch = globalThis.fetch
  if (!fetch) {
    // Fallback to node-fetch if available
    const nodeFetch = await import('node-fetch')
    fetch = nodeFetch.default
  }
} catch (error) {
  console.log('⚠️  Using built-in fetch API')
  fetch = globalThis.fetch
}

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(cors())
app.use(express.json())

// LLM配置
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
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    model: 'qwen-plus',
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

// 生成家庭数据的提示词模板
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

// 调用OpenAI API
async function callOpenAI(prompt, apiKey) {
  const config = LLM_CONFIGS.openai

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: config.headers(apiKey),
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的数据生成助手，擅长生成真实合理的中国家庭信息。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 4000,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// 调用通义千问API
async function callQwen(prompt, apiKey) {
  const config = LLM_CONFIGS.qwen

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: config.headers(apiKey),
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的数据生成助手，擅长生成真实合理的中国家庭信息。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 4000,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.log('通义千问 API详细错误:', errorText)
    throw new Error(`通义千问 API error: ${response.status} - ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// 调用智谱AI API
async function callZhipu(prompt, apiKey) {
  const config = LLM_CONFIGS.zhipu

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: config.headers(apiKey),
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的数据生成助手，擅长生成真实合理的中国家庭信息。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 4000,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.log('智谱AI API详细错误:', errorText)
    throw new Error(`智谱AI API error: ${response.status} - ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// 调用Claude API
async function callClaude(prompt, apiKey) {
  const config = LLM_CONFIGS.claude

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: config.headers(apiKey),
    body: JSON.stringify({
      model: config.model,
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
    }),
  })

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`)
  }

  const data = await response.json()
  return data.content[0].text
}

// 通用LLM调用函数
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

// 解析LLM返回的JSON数据
function parseLLMResponse(response) {
  try {
    // 清理响应数据
    let cleanResponse = response.trim()

    // 移除可能的markdown代码块标记
    cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '')

    // 尝试提取JSON部分（有些模型会返回额外的文字）
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      let jsonStr = jsonMatch[0]

      // 尝试修复常见的JSON格式问题
      jsonStr = fixCommonJSONIssues(jsonStr)

      console.log('提取的JSON字符串长度:', jsonStr.length)
      return JSON.parse(jsonStr)
    }

    // 如果没有找到JSON，尝试直接解析
    return JSON.parse(cleanResponse)
  } catch (error) {
    console.error('JSON解析错误详情:', error.message)
    console.error('响应数据长度:', response.length)
    console.error('响应数据前200字符:', response.substring(0, 200))
    console.error('响应数据后200字符:', response.substring(response.length - 200))

    // 尝试更激进的修复
    try {
      const fixedResponse = fixCommonJSONIssues(response)
      return JSON.parse(fixedResponse)
    } catch (secondError) {
      // 最后尝试：使用更激进的修复策略
      try {
        const aggressiveFixed = aggressiveJSONFix(response)
        return JSON.parse(aggressiveFixed)
      } catch (thirdError) {
        // 最后尝试：使用智能修复策略
        try {
          // 从错误信息中提取位置信息
          const positionMatch = error.message.match(/position (\d+)/)
          const errorPosition = positionMatch ? parseInt(positionMatch[1]) : 0

          const smartFixed = smartJSONFix(response, errorPosition)
          return JSON.parse(smartFixed)
        } catch (fourthError) {
          // 最后尝试：修复被截断的JSON
          try {
            const truncatedFixed = fixTruncatedJSON(response)
            return JSON.parse(truncatedFixed)
          } catch (fifthError) {
            throw new Error(`无法解析LLM返回的数据: ${error.message}`)
          }
        }
      }
    }
  }
}

// 修复常见的JSON格式问题
function fixCommonJSONIssues(jsonStr) {
  // 修复未转义的引号（但要小心不要破坏JSON结构）
  // 只修复字符串值中的未转义引号，不修复键名和结构引号
  jsonStr = jsonStr.replace(/([^\\])"([^":,}\]]*)"([^":,}\]]*)"([^":,}\]]*)/g, '$1\\"$2\\"$3\\"$4')

  // 修复缺少逗号的问题
  jsonStr = jsonStr.replace(/"\s*\n\s*"/g, '",\n"')
  jsonStr = jsonStr.replace(/}\s*\n\s*"/g, '},\n"')
  jsonStr = jsonStr.replace(/]\s*\n\s*"/g, '],\n"')
  jsonStr = jsonStr.replace(/\d\s*\n\s*"/g, '$1,\n"')

  // 修复多余的逗号
  jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1')

  // 修复缺少引号的键（但要小心不要破坏已有的引号）
  jsonStr = jsonStr.replace(/(\s+)(\w+):/g, '$1"$2":')

  // 修复可能的换行符问题
  jsonStr = jsonStr.replace(/\n/g, '\\n')
  jsonStr = jsonStr.replace(/\\n/g, '\n')

  // 修复可能的制表符问题
  jsonStr = jsonStr.replace(/\t/g, '\\t')
  jsonStr = jsonStr.replace(/\\t/g, '\t')

  return jsonStr
}

// 激进的JSON修复策略
function aggressiveJSONFix(jsonStr) {
  console.log('尝试激进JSON修复...')

  // 提取JSON部分
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('未找到JSON结构')
  }

  let fixed = jsonMatch[0]

  // 修复常见的LLM输出问题
  // 1. 修复字符串中的未转义引号
  fixed = fixed.replace(/([^\\])"([^":,}\]]*)"([^":,}\]]*)/g, (match, p1, p2, p3) => {
    return p1 + '\\"' + p2 + '\\"' + p3
  })

  // 2. 修复缺少逗号的问题
  fixed = fixed.replace(/"\s*\n\s*"/g, '",\n"')
  fixed = fixed.replace(/}\s*\n\s*"/g, '},\n"')
  fixed = fixed.replace(/]\s*\n\s*"/g, '],\n"')
  fixed = fixed.replace(/\d\s*\n\s*"/g, '$1,\n"')

  // 3. 修复多余的逗号
  fixed = fixed.replace(/,(\s*[}\]])/g, '$1')

  // 4. 修复缺少引号的键
  fixed = fixed.replace(/(\s+)(\w+):/g, '$1"$2":')

  // 5. 修复可能的换行符和制表符问题
  fixed = fixed.replace(/\n/g, '\\n')
  fixed = fixed.replace(/\t/g, '\\t')
  fixed = fixed.replace(/\\n/g, '\n')
  fixed = fixed.replace(/\\t/g, '\t')

  // 6. 确保JSON结构完整
  if (!fixed.endsWith('}')) {
    fixed += '}'
  }

  console.log('激进修复完成，长度:', fixed.length)
  return fixed
}

// 智能JSON修复 - 基于错误位置进行精确修复
function smartJSONFix(jsonStr, errorPosition) {
  console.log(`尝试智能JSON修复，错误位置: ${errorPosition}`)

  // 提取JSON部分
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('未找到JSON结构')
  }

  let fixed = jsonMatch[0]

  // 如果错误位置在5180附近，说明可能是某个特定字段的问题
  if (errorPosition > 5000) {
    console.log('错误位置较后，可能是daily_life部分的问题')

    // 检查daily_life部分是否有问题
    const dailyLifeMatch = fixed.match(/"daily_life":\s*\{[\s\S]*\}/)
    if (dailyLifeMatch) {
      console.log('找到daily_life部分，进行特殊处理')

      // 修复daily_life中的常见问题
      let dailyLife = dailyLifeMatch[0]

      // 修复字符串中的引号问题
      dailyLife = dailyLife.replace(/([^\\])"([^":,}\]]*)"([^":,}\]]*)/g, (match, p1, p2, p3) => {
        return p1 + '\\"' + p2 + '\\"' + p3
      })

      // 修复缺少逗号的问题
      dailyLife = dailyLife.replace(/"\s*\n\s*"/g, '",\n"')
      dailyLife = dailyLife.replace(/}\s*\n\s*"/g, '},\n"')
      dailyLife = dailyLife.replace(/]\s*\n\s*"/g, '],\n"')

      // 修复多余的逗号
      dailyLife = dailyLife.replace(/,(\s*[}\]])/g, '$1')

      // 替换原字符串中的daily_life部分
      fixed = fixed.replace(/"daily_life":\s*\{[\s\S]*\}/, dailyLife)
    }
  }

  // 通用修复
  fixed = fixed.replace(/"\s*\n\s*"/g, '",\n"')
  fixed = fixed.replace(/}\s*\n\s*"/g, '},\n"')
  fixed = fixed.replace(/]\s*\n\s*"/g, '],\n"')
  fixed = fixed.replace(/,(\s*[}\]])/g, '$1')

  console.log('智能修复完成，长度:', fixed.length)
  return fixed
}

// 修复被截断的JSON
function fixTruncatedJSON(jsonStr) {
  console.log('尝试修复被截断的JSON...')

  // 提取JSON部分
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('未找到JSON结构')
  }

  let fixed = jsonMatch[0]

  // 检查JSON是否被截断
  if (!fixed.endsWith('}')) {
    console.log('检测到JSON被截断，尝试修复...')

    // 找到最后一个完整的对象或数组
    let lastCompleteIndex = -1
    let braceCount = 0
    let bracketCount = 0
    let inString = false
    let escapeNext = false

    for (let i = 0; i < fixed.length; i++) {
      const char = fixed[i]

      if (escapeNext) {
        escapeNext = false
        continue
      }

      if (char === '\\') {
        escapeNext = true
        continue
      }

      if (char === '"' && !escapeNext) {
        inString = !inString
        continue
      }

      if (!inString) {
        if (char === '{') {
          braceCount++
        } else if (char === '}') {
          braceCount--
          if (braceCount === 0) {
            lastCompleteIndex = i
          }
        } else if (char === '[') {
          bracketCount++
        } else if (char === ']') {
          bracketCount--
        }
      }
    }

    if (lastCompleteIndex > 0) {
      // 截取到最后一个完整的对象
      fixed = fixed.substring(0, lastCompleteIndex + 1)
      console.log('截取到最后一个完整对象，位置:', lastCompleteIndex)
    } else {
      // 如果找不到完整对象，尝试手动闭合
      console.log('手动闭合JSON结构...')

      // 移除可能的不完整部分
      fixed = fixed.replace(/,\s*$/, '')
      fixed = fixed.replace(/:\s*$/, ': ""')

      // 手动闭合daily_life部分
      if (
        (fixed.includes('"daily_life"') && !fixed.includes('"daily_life": {')) ||
        (fixed.includes('"daily_life": {') && !fixed.includes('}'))
      ) {
        // 如果daily_life部分不完整，移除它
        fixed = fixed.replace(/,\s*"daily_life":\s*\{[\s\S]*$/, '')
      }

      // 确保JSON结构完整
      if (!fixed.endsWith('}')) {
        fixed += '}'
      }
    }
  }

  // 通用修复
  fixed = fixed.replace(/"\s*\n\s*"/g, '",\n"')
  fixed = fixed.replace(/}\s*\n\s*"/g, '},\n"')
  fixed = fixed.replace(/]\s*\n\s*"/g, '],\n"')
  fixed = fixed.replace(/,(\s*[}\]])/g, '$1')

  console.log('截断修复完成，长度:', fixed.length)
  return fixed
}

// 终极JSON修复策略 - 处理最复杂的LLM输出问题
function ultimateJSONFix(jsonStr) {
  console.log('尝试终极JSON修复...')

  // 提取JSON部分
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('未找到JSON结构')
  }

  let fixed = jsonMatch[0]

  // 1. 修复字符串中的未转义引号 - 更精确的匹配
  fixed = fixed.replace(/([^\\])"([^":,}\]]*)"([^":,}\]]*)/g, (match, p1, p2, p3) => {
    return p1 + '\\"' + p2 + '\\"' + p3
  })

  // 2. 修复缺少逗号的问题 - 更全面的匹配
  fixed = fixed.replace(/"\s*\n\s*"/g, '",\n"')
  fixed = fixed.replace(/}\s*\n\s*"/g, '},\n"')
  fixed = fixed.replace(/]\s*\n\s*"/g, '],\n"')
  fixed = fixed.replace(/\d\s*\n\s*"/g, '$1,\n"')
  fixed = fixed.replace(/"\s*\n\s*\{/g, '",\n{')
  fixed = fixed.replace(/"\s*\n\s*\[/g, '",\n[')

  // 3. 修复多余的逗号
  fixed = fixed.replace(/,(\s*[}\]])/g, '$1')

  // 4. 修复缺少引号的键
  fixed = fixed.replace(/(\s+)(\w+):/g, '$1"$2":')

  // 5. 修复可能的换行符和制表符问题
  fixed = fixed.replace(/\n/g, '\\n')
  fixed = fixed.replace(/\t/g, '\\t')
  fixed = fixed.replace(/\\n/g, '\n')
  fixed = fixed.replace(/\\t/g, '\t')

  // 6. 确保JSON结构完整
  if (!fixed.endsWith('}')) {
    fixed += '}'
  }

  // 7. 修复可能的括号不匹配问题
  const openBraces = (fixed.match(/\{/g) || []).length
  const closeBraces = (fixed.match(/\}/g) || []).length
  if (openBraces > closeBraces) {
    fixed += '}'.repeat(openBraces - closeBraces)
  }

  console.log('终极修复完成，长度:', fixed.length)
  return fixed
}

// API路由
app.post('/api/generate-family', async (req, res) => {
  try {
    const { config, provider, apiKey } = req.body

    if (!apiKey) {
      return res.status(400).json({ error: '请提供API密钥' })
    }

    const defaultConfig = {
      fatherAgeMin: 30,
      fatherAgeMax: 50,
      motherAgeMin: 28,
      motherAgeMax: 48,
      childrenCount: 2,
      ...config,
    }

    const prompt = generateFamilyPrompt(defaultConfig)
    console.log(`正在使用 ${LLM_CONFIGS[provider].name} 生成家庭数据...`)

    const response = await callLLM(provider, prompt, apiKey)
    const familyData = parseLLMResponse(response)

    console.log('✅ LLM生成成功!')
    res.json({ success: true, data: familyData })
  } catch (error) {
    console.error('❌ LLM生成失败:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// 批量生成API
app.post('/api/generate-batch', async (req, res) => {
  try {
    const { count, config, provider, apiKey } = req.body

    if (!apiKey) {
      return res.status(400).json({ error: '请提供API密钥' })
    }

    const results = []
    const errors = []

    console.log(`开始批量生成 ${count} 个家庭数据...`)

    for (let i = 0; i < count; i++) {
      try {
        console.log(`正在生成第 ${i + 1}/${count} 个家庭...`)

        const defaultConfig = {
          fatherAgeMin: 30,
          fatherAgeMax: 50,
          motherAgeMin: 28,
          motherAgeMax: 48,
          childrenCount: 2,
          ...config,
        }

        const prompt = generateFamilyPrompt(defaultConfig)
        const response = await callLLM(provider, prompt, apiKey)
        const familyData = parseLLMResponse(response)

        results.push(familyData)

        // 添加延迟避免API限流
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`第 ${i + 1} 个家庭生成失败:`, error.message)
        errors.push({ index: i + 1, error: error.message })
      }
    }

    console.log(`✅ 批量生成完成: 成功 ${results.length} 个，失败 ${errors.length} 个`)

    res.json({
      success: true,
      data: {
        success: results,
        errors: errors,
        total: count,
        successCount: results.length,
        errorCount: errors.length,
      },
    })
  } catch (error) {
    console.error('❌ 批量生成失败:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Family Data Generator API is running' })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`)
  console.log(`📊 API文档: http://localhost:${PORT}/api/health`)
})
