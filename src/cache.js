// 使用 PropertiesService 暫存資料給其他卡片使用，每次卡片切換或按鈕觸發時，都會重新執行腳本，全域變數會被重置
// 存放
function setCache(key, value) {
  try {
    var cacheData = {
      value: value,
      timestamp: new Date().getTime()
    };

    var serializedData = JSON.stringify(cacheData);
    PropertiesService.getScriptProperties().setProperty(key, serializedData);

    Logger.log('Cache set successfully for key: ' + key);
  } catch (error) {
    Logger.log('Error setting cache for key ' + key + ': ' + error.toString());
  }
}

// 拿取
function getCache(key) {
  try {
    var serializedData = PropertiesService.getScriptProperties().getProperty(key);

    if (!serializedData) {
      Logger.log('Cache miss for key: ' + key);
      return null;
    }

    var cacheData = JSON.parse(serializedData);

    Logger.log('Cache hit for key: ' + key);
    return cacheData.value;

  } catch (error) {
    Logger.log('Error getting cache for key ' + key + ': ' + error.toString());
    return null;
  }
}

// 額外的輔助方法

// 清除特定 key 的 cache
function clearCache(key) {
  try {
    PropertiesService.getScriptProperties().deleteProperty(key);
    Logger.log('Cache cleared for key: ' + key);
  } catch (error) {
    Logger.log('Error clearing cache for key ' + key + ': ' + error.toString());
  }
}

// 清空所有 cache
function clearAllCache() {
  try {
    PropertiesService.getScriptProperties().deleteAllProperties();
    Logger.log('Cache all cleared');
  } catch (error) {
    Logger.log('Error clearing all cache: ' + error.toString());
  }
}

// 檢查 cache 是否存在
function hasCache(key) {
  var data = PropertiesService.getScriptProperties().getProperty(key);
  return data !== null;
}

// 獲取 cache 的時間戳
function getCacheTimestamp(key) {
  try {
    var serializedData = PropertiesService.getScriptProperties().getProperty(key);
    if (!serializedData) return null;

    var cacheData = JSON.parse(serializedData);
    return new Date(cacheData.timestamp);
  } catch (error) {
    Logger.log('Error getting cache timestamp for key ' + key + ': ' + error.toString());
    return null;
  }
}