/**
 * 数据缓存管理器
 * 解决刷新页面后数据丢失的问题
 * 
 * 设计原则：
 * 1. 简单直接 - 不搞复杂的缓存策略
 * 2. 可靠持久 - 使用localStorage确保数据不丢失
 * 3. 向后兼容 - 不影响现有API调用逻辑
 */

const CACHE_KEYS = {
  GENERATED_FAMILIES: 'family_data_generated',
  API_CONFIG: 'family_data_api_config',
  LAST_SESSION: 'family_data_last_session'
}

/**
 * 缓存管理器类
 */
class CacheManager {
  constructor() {
    this.isAvailable = this.checkLocalStorageSupport()
  }

  /**
   * 检查localStorage支持
   */
  checkLocalStorageSupport() {
    try {
      const test = '__localStorage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (e) {
      console.warn('localStorage不可用，将使用内存缓存')
      return false
    }
  }

  /**
   * 设置缓存数据
   * @param {string} key 缓存键
   * @param {any} data 数据
   */
  set(key, data) {
    try {
      const serialized = JSON.stringify({
        data,
        timestamp: Date.now(),
        version: '1.0'
      })
      
      if (this.isAvailable) {
        localStorage.setItem(key, serialized)
      } else {
        // 内存缓存作为后备
        this.memoryCache = this.memoryCache || {}
        this.memoryCache[key] = serialized
      }
      
      console.log(`✅ 缓存已保存: ${key}`)
    } catch (error) {
      console.error(`❌ 缓存保存失败: ${key}`, error)
    }
  }

  /**
   * 获取缓存数据
   * @param {string} key 缓存键
   * @param {number} maxAge 最大缓存时间(毫秒)，默认24小时
   */
  get(key, maxAge = 24 * 60 * 60 * 1000) {
    try {
      let serialized = null
      
      if (this.isAvailable) {
        serialized = localStorage.getItem(key)
      } else {
        this.memoryCache = this.memoryCache || {}
        serialized = this.memoryCache[key]
      }

      if (!serialized) {
        return null
      }

      const cached = JSON.parse(serialized)
      
      // 检查缓存是否过期
      if (Date.now() - cached.timestamp > maxAge) {
        console.log(`⚠️ 缓存已过期: ${key}`)
        this.remove(key)
        return null
      }

      console.log(`✅ 缓存已加载: ${key}`)
      return cached.data
    } catch (error) {
      console.error(`❌ 缓存加载失败: ${key}`, error)
      return null
    }
  }

  /**
   * 删除缓存
   * @param {string} key 缓存键
   */
  remove(key) {
    try {
      if (this.isAvailable) {
        localStorage.removeItem(key)
      } else {
        this.memoryCache = this.memoryCache || {}
        delete this.memoryCache[key]
      }
      console.log(`🗑️ 缓存已删除: ${key}`)
    } catch (error) {
      console.error(`❌ 缓存删除失败: ${key}`, error)
    }
  }

  /**
   * 清空所有缓存
   */
  clear() {
    try {
      if (this.isAvailable) {
        Object.values(CACHE_KEYS).forEach(key => {
          localStorage.removeItem(key)
        })
      } else {
        this.memoryCache = {}
      }
      console.log('🗑️ 所有缓存已清空')
    } catch (error) {
      console.error('❌ 缓存清空失败', error)
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    const stats = {
      totalFamilies: 0,
      lastGenerated: null,
      cacheSize: 0
    }

    try {
      const families = this.get(CACHE_KEYS.GENERATED_FAMILIES)
      if (families && Array.isArray(families)) {
        stats.totalFamilies = families.length
        stats.lastGenerated = families.length > 0 ? families[families.length - 1].created_at : null
      }

      // 计算缓存大小
      if (this.isAvailable) {
        let totalSize = 0
        Object.values(CACHE_KEYS).forEach(key => {
          const item = localStorage.getItem(key)
          if (item) {
            totalSize += item.length
          }
        })
        stats.cacheSize = totalSize
      }
    } catch (error) {
      console.error('获取缓存统计失败', error)
    }

    return stats
  }
}

// 创建全局缓存管理器实例
const cacheManager = new CacheManager()

/**
 * 保存生成的家庭数据
 * @param {Object|Array} familyData 家庭数据
 */
export function saveGeneratedFamilies(familyData) {
  try {
    // 获取现有数据
    let existingFamilies = cacheManager.get(CACHE_KEYS.GENERATED_FAMILIES) || []
    
    // 如果是单个数据，转换为数组
    const newFamilies = Array.isArray(familyData) ? familyData : [familyData]
    
    // 合并数据，避免重复
    const allFamilies = [...existingFamilies, ...newFamilies]
    
    // 去重（基于family_id）
    const uniqueFamilies = allFamilies.filter((family, index, self) => 
      index === self.findIndex(f => f.family_id === family.family_id)
    )
    
    // 保存到缓存
    cacheManager.set(CACHE_KEYS.GENERATED_FAMILIES, uniqueFamilies)
    
    console.log(`✅ 已保存 ${newFamilies.length} 个家庭数据到缓存`)
    return true
  } catch (error) {
    console.error('❌ 保存家庭数据失败', error)
    return false
  }
}

/**
 * 获取缓存中的家庭数据
 * @param {string} familyId 可选的特定家庭ID
 */
export function getCachedFamilies(familyId = null) {
  try {
    const families = cacheManager.get(CACHE_KEYS.GENERATED_FAMILIES) || []
    
    if (familyId) {
      return families.find(family => family.family_id === familyId)
    }
    
    return families
  } catch (error) {
    console.error('❌ 获取缓存家庭数据失败', error)
    return familyId ? null : []
  }
}

/**
 * 删除特定的家庭数据
 * @param {string} familyId 家庭ID
 */
export function removeCachedFamily(familyId) {
  try {
    const families = cacheManager.get(CACHE_KEYS.GENERATED_FAMILIES) || []
    const filteredFamilies = families.filter(family => family.family_id !== familyId)
    
    cacheManager.set(CACHE_KEYS.GENERATED_FAMILIES, filteredFamilies)
    console.log(`🗑️ 已删除家庭数据: ${familyId}`)
    return true
  } catch (error) {
    console.error('❌ 删除家庭数据失败', error)
    return false
  }
}

/**
 * 保存API配置
 * @param {Object} config API配置
 */
export function saveApiConfig(config) {
  try {
    cacheManager.set(CACHE_KEYS.API_CONFIG, config)
    console.log('✅ API配置已保存')
    return true
  } catch (error) {
    console.error('❌ 保存API配置失败', error)
    return false
  }
}

/**
 * 获取API配置
 */
export function getApiConfig() {
  try {
    return cacheManager.get(CACHE_KEYS.API_CONFIG) || {}
  } catch (error) {
    console.error('❌ 获取API配置失败', error)
    return {}
  }
}

/**
 * 保存会话信息
 * @param {Object} sessionInfo 会话信息
 */
export function saveSessionInfo(sessionInfo) {
  try {
    cacheManager.set(CACHE_KEYS.LAST_SESSION, {
      ...sessionInfo,
      timestamp: Date.now()
    })
    return true
  } catch (error) {
    console.error('❌ 保存会话信息失败', error)
    return false
  }
}

/**
 * 获取会话信息
 */
export function getSessionInfo() {
  try {
    return cacheManager.get(CACHE_KEYS.LAST_SESSION) || null
  } catch (error) {
    console.error('❌ 获取会话信息失败', error)
    return null
  }
}

/**
 * 清空所有缓存
 */
export function clearAllCache() {
  try {
    cacheManager.clear()
    console.log('🗑️ 所有缓存已清空')
    return true
  } catch (error) {
    console.error('❌ 清空缓存失败', error)
    return false
  }
}

/**
 * 获取缓存统计信息
 */
export function getCacheStats() {
  return cacheManager.getStats()
}

/**
 * 检查是否有未保存的数据
 */
export function hasUnsavedData() {
  try {
    const families = getCachedFamilies()
    const sessionInfo = getSessionInfo()
    
    return {
      hasFamilies: families.length > 0,
      familyCount: families.length,
      lastActivity: sessionInfo?.timestamp || null
    }
  } catch (error) {
    console.error('❌ 检查未保存数据失败', error)
    return { hasFamilies: false, familyCount: 0, lastActivity: null }
  }
}

export default cacheManager
