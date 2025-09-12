import axios from 'axios'
import { 
  saveGeneratedFamilies, 
  getCachedFamilies, 
  saveApiConfig, 
  getApiConfig,
  saveSessionInfo,
  getSessionInfo,
  hasUnsavedData
} from './cacheManager.js'

// 配置你的API端点
const API_BASE_URL = 'https://your-api-endpoint.com'
const API_TOKEN = import.meta.env.VITE_API_TOKEN || null // 可选，从环境变量获取

/**
 * 生成请求头
 * @returns {Object} 请求头对象
 */
function getHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  }

  // 只有在有token时才添加认证头
  if (API_TOKEN) {
    headers.Authorization = `Bearer ${API_TOKEN}`
  }

  return headers
}

/**
 * 将家庭数据拆分为标准字段结构
 * @param {Object} familyData 原始家庭数据
 * @returns {Object} 拆分后的数据结构
 */
function transformFamilyData(familyData) {
  return {
    // 家庭基本信息
    family: {
      family_id: familyData.family_id,
      city: familyData.family_info.city,
      district: familyData.family_info.district,
      detailed_address: familyData.family_info.detailed_address,
      housing_type: familyData.family_info.housing_type,
      housing_area: familyData.family_info.housing_area,
      family_income: familyData.family_info.family_income,
      car_count: familyData.family_info.car_count,
      pets: familyData.family_info.pets,
      family_motto: familyData.family_info.family_motto,
      created_at: familyData.created_at,
      updated_at: familyData.updated_at,
    },

    // 家庭成员信息
    members: [
      // 父亲
      {
        family_id: familyData.family_id,
        name: familyData.father.name,
        age: familyData.father.age,
        gender: familyData.father.gender,
        education: familyData.father.education,
        job: familyData.father.job,
        salary: familyData.father.salary,
        hobbies: familyData.father.hobbies,
        personality: familyData.father.personality,
        health_status: familyData.father.health_status,
        id_number: familyData.father.id_number,
        role: 'father',
      },
      // 母亲
      {
        family_id: familyData.family_id,
        name: familyData.mother.name,
        age: familyData.mother.age,
        gender: familyData.mother.gender,
        education: familyData.mother.education,
        job: familyData.mother.job,
        salary: familyData.mother.salary,
        hobbies: familyData.mother.hobbies,
        personality: familyData.mother.personality,
        health_status: familyData.mother.health_status,
        id_number: familyData.mother.id_number,
        role: 'mother',
      },
      // 孩子们
      ...familyData.children.map((child) => ({
        family_id: familyData.family_id,
        name: child.name,
        age: child.age,
        gender: child.gender,
        education: child.education,
        job: child.job,
        salary: child.salary,
        hobbies: child.hobbies,
        personality: child.personality,
        health_status: child.health_status,
        id_number: child.id_number,
        school_grade: child.school_grade,
        role: 'child',
      })),
    ],

    // 联系方式
    contacts: {
      family_id: familyData.family_id,
      phone: familyData.contact.phone,
      email: familyData.contact.email,
      wechat: familyData.contact.wechat,
      emergency_contact: familyData.contact.emergency_contact,
      emergency_phone: familyData.contact.emergency_phone,
    },

    // 一周生活记录
    weekly_life: Object.entries(familyData.weekly_life).map(([day, events]) => ({
      family_id: familyData.family_id,
      day_of_week: day,
      events: events,
      created_at: familyData.created_at,
    })),
  }
}

/**
 * 写入单个家庭数据到API (拆分为多个表)
 * @param {Object} familyData 家庭数据
 * @param {boolean} saveToCache 是否保存到缓存，默认true
 * @returns {Promise} API响应
 */
export async function writeFamilyData(familyData, saveToCache = true) {
  try {
    // 先保存到缓存（无论API是否成功）
    if (saveToCache) {
      saveGeneratedFamilies(familyData)
      saveSessionInfo({
        lastAction: 'write_single',
        familyId: familyData.family_id,
        timestamp: Date.now()
      })
    }

    const transformedData = transformFamilyData(familyData)

    // 1. 先创建家庭记录
    const familyResponse = await axios.post(`${API_BASE_URL}/families`, transformedData.family, {
      headers: getHeaders(),
    })

    // 2. 批量创建家庭成员
    const membersResponse = await axios.post(
      `${API_BASE_URL}/family-members/batch`,
      transformedData.members,
      {
        headers: getHeaders(),
      },
    )

    // 3. 创建联系方式
    const contactsResponse = await axios.post(
      `${API_BASE_URL}/family-contacts`,
      transformedData.contacts,
      {
        headers: getHeaders(),
      },
    )

    // 4. 批量创建生活记录
    const lifeResponse = await axios.post(
      `${API_BASE_URL}/family-life/batch`,
      transformedData.weekly_life,
      {
        headers: getHeaders(),
      },
    )

    console.log('✅ API写入成功，数据已保存到缓存')
    return {
      success: true,
      data: {
        family: familyResponse.data,
        members: membersResponse.data,
        contacts: contactsResponse.data,
        weekly_life: lifeResponse.data,
      },
    }
  } catch (error) {
    console.error('❌ API写入失败:', error)
    // 即使API失败，数据也已经保存到缓存了
    return { success: false, error: error.message, cached: true }
  }
}

/**
 * 批量写入家庭数据到API (优化版本)
 * @param {Array} familyDataArray 家庭数据数组
 * @param {boolean} saveToCache 是否保存到缓存，默认true
 * @returns {Promise} 批量写入结果
 */
export async function writeBatchFamilyData(familyDataArray, saveToCache = true) {
  try {
    // 先保存到缓存（无论API是否成功）
    if (saveToCache) {
      saveGeneratedFamilies(familyDataArray)
      saveSessionInfo({
        lastAction: 'write_batch',
        count: familyDataArray.length,
        timestamp: Date.now()
      })
    }

    // 批量转换数据
    const allFamilies = []
    const allMembers = []
    const allContacts = []
    const allWeeklyLife = []

    familyDataArray.forEach((familyData) => {
      const transformed = transformFamilyData(familyData)
      allFamilies.push(transformed.family)
      allMembers.push(...transformed.members)
      allContacts.push(transformed.contacts)
      allWeeklyLife.push(...transformed.weekly_life)
    })

    // 批量API调用
    const [familiesResponse, membersResponse, contactsResponse, lifeResponse] = await Promise.all([
      axios.post(`${API_BASE_URL}/families/batch`, allFamilies, {
        headers: getHeaders(),
      }),
      axios.post(`${API_BASE_URL}/family-members/batch`, allMembers, {
        headers: getHeaders(),
      }),
      axios.post(`${API_BASE_URL}/family-contacts/batch`, allContacts, {
        headers: getHeaders(),
      }),
      axios.post(`${API_BASE_URL}/family-life/batch`, allWeeklyLife, {
        headers: getHeaders(),
      }),
    ])

    console.log(`✅ 批量API写入成功，${familyDataArray.length} 个家庭数据已保存到缓存`)
    return {
      success: true,
      total: familyDataArray.length,
      successCount: familyDataArray.length,
      failedCount: 0,
      data: {
        families: familiesResponse.data,
        members: membersResponse.data,
        contacts: contactsResponse.data,
        weekly_life: lifeResponse.data,
      },
    }
  } catch (error) {
    console.error('❌ 批量API写入失败:', error)
    // 即使API失败，数据也已经保存到缓存了
    return {
      success: false,
      total: familyDataArray.length,
      successCount: 0,
      failedCount: familyDataArray.length,
      error: error.message,
      cached: true
    }
  }
}

/**
 * 模拟API写入 (用于测试)
 * @param {Object|Array} data 数据
 * @returns {Promise} 模拟响应
 */
export async function mockApiWrite(data) {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 500))

  // 90%成功率模拟
  const success = Math.random() > 0.1

  if (success) {
    console.log('✅ 模拟API写入成功:', data)
    return { success: true, data: { id: Date.now(), ...data } }
  } else {
    console.error('❌ 模拟API写入失败')
    return { success: false, error: '模拟网络错误' }
  }
}

/**
 * 从缓存恢复数据
 * @returns {Object} 恢复的数据和状态
 */
export function restoreFromCache() {
  try {
    const families = getCachedFamilies()
    const sessionInfo = getSessionInfo()
    const unsavedData = hasUnsavedData()
    
    console.log(`📦 从缓存恢复: ${families.length} 个家庭数据`)
    
    return {
      success: true,
      families,
      sessionInfo,
      unsavedData,
      message: `已恢复 ${families.length} 个家庭数据`
    }
  } catch (error) {
    console.error('❌ 从缓存恢复失败:', error)
    return {
      success: false,
      families: [],
      sessionInfo: null,
      unsavedData: { hasFamilies: false, familyCount: 0 },
      error: error.message
    }
  }
}

/**
 * 保存API配置到缓存
 * @param {Object} config API配置
 */
export function saveApiConfiguration(config) {
  try {
    saveApiConfig(config)
    console.log('✅ API配置已保存到缓存')
    return true
  } catch (error) {
    console.error('❌ 保存API配置失败:', error)
    return false
  }
}

/**
 * 获取缓存的API配置
 */
export function getCachedApiConfiguration() {
  try {
    return getApiConfig()
  } catch (error) {
    console.error('❌ 获取API配置失败:', error)
    return {}
  }
}

/**
 * 检查数据完整性
 * @param {Object|Array} data 要检查的数据
 */
export function validateDataIntegrity(data) {
  try {
    const families = Array.isArray(data) ? data : [data]
    const issues = []
    
    families.forEach((family, index) => {
      // 检查必需字段
      if (!family.family_id) {
        issues.push(`家庭 ${index + 1}: 缺少 family_id`)
      }
      if (!family.father || !family.father.name) {
        issues.push(`家庭 ${index + 1}: 缺少父亲信息`)
      }
      if (!family.mother || !family.mother.name) {
        issues.push(`家庭 ${index + 1}: 缺少母亲信息`)
      }
      if (!family.children || !Array.isArray(family.children)) {
        issues.push(`家庭 ${index + 1}: 缺少孩子信息`)
      }
      if (!family.family_info || !family.family_info.city) {
        issues.push(`家庭 ${index + 1}: 缺少家庭信息`)
      }
    })
    
    return {
      isValid: issues.length === 0,
      issues,
      familyCount: families.length
    }
  } catch (error) {
    console.error('❌ 数据完整性检查失败:', error)
    return {
      isValid: false,
      issues: ['数据格式错误'],
      familyCount: 0
    }
  }
}

/**
 * 导出缓存数据
 * @param {string} format 导出格式 ('json' | 'csv')
 */
export function exportCachedData(format = 'json') {
  try {
    const families = getCachedFamilies()
    
    if (families.length === 0) {
      return {
        success: false,
        message: '没有可导出的数据'
      }
    }
    
    if (format === 'json') {
      const dataStr = JSON.stringify(families, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `family_data_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      return {
        success: true,
        message: `已导出 ${families.length} 个家庭数据`
      }
    }
    
    return {
      success: false,
      message: '不支持的导出格式'
    }
  } catch (error) {
    console.error('❌ 导出数据失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
