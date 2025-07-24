// 簡單的 GET 請求
function simpleGetRequest(url) {
  try {
    const response = UrlFetchApp.fetch(url);
    const data = JSON.parse(response.getContentText());

    Logger.log('Response: ' + JSON.stringify(data));
    return data;
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return null;
  }
}

// 帶參數的 GET 請求
function getRequestWithParams(baseUrl, params) {
  try {
    let url = baseUrl;

    // 建構 query string
    if (params && Object.keys(params).length !== 0) {
      const queryString = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');

      url = `${baseUrl}?${queryString}`;
    }

    const response = UrlFetchApp.fetch(url);
    const data = JSON.parse(response.getContentText());

    Logger.log('Posts: ' + JSON.stringify(data));
    return data;
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return null;
  }
}

// 帶 Headers 的 GET 請求
function getRequestWithHeaders() {
  try {
    const options = {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer your-token-here',
        'Content-Type': 'application/json',
        'User-Agent': 'Google Apps Script'
      }
    };

    const response = UrlFetchApp.fetch('https://api.example.com/get', options);
    const data = JSON.parse(response.getContentText());

    Logger.log('Response: ' + JSON.stringify(data));
    return data;
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return null;
  }
}

// Form Data POST 請求
function formDataPostRequest() {
  try {
    const payload = {
      'name': 'John Doe',
      'email': 'john@example.com',
      'message': 'Hello World'
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      payload: payload  // 不需要 JSON.stringify，直接傳物件
    };

    const response = UrlFetchApp.fetch('https://httpbin.org/post', options);
    const data = JSON.parse(response.getContentText());

    Logger.log('Form response: ' + JSON.stringify(data));
    return data;
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return null;
  }
}

// 帶認證的 POST 請求
function authenticatedPostRequest() {
  try {
    const payload = {
      title: 'Authenticated Post',
      content: 'This requires authentication'
    };

    const options = {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer your-api-token',
        'Content-Type': 'application/json',
        'X-API-Key': 'your-api-key'
      },
      payload: JSON.stringify(payload)
    };

    const response = UrlFetchApp.fetch('https://api.example.com/posts', options);
    const data = JSON.parse(response.getContentText());

    Logger.log('Authenticated response: ' + JSON.stringify(data));
    return data;
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return null;
  }
}

function getOpenAiApiKey() {
  return PropertiesService.getScriptProperties().getProperty("OPENAI_API_KEY");
}

function generateReplyWithOpenAI(prompt) {
  const apiKey = getOpenAiApiKey();
  const url = "https://api.openai.com/v1/chat/completions";
  const payload = {
   model: "gpt-4.1",
    messages: [
    { role: "system", content: "您是負責回覆商務電子郵件的中文助理" },
   { role: "user", content: prompt }
     ],
    temperature: 0.7
  };

  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: "Bearer " + apiKey
  },
  payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());

    if (response.getResponseCode() !== 200) {
      console.error("API Error (Status: " + response.getResponseCode() + "): " + (result.error ? result.error.message : response.getContentText()));
      return `回應報錯，ResponseCode : ${response.getResponseCode()}`;
    }

    if (result.choices && result.choices.length > 0 && result.choices[0].message && result.choices[0].message.content) {
      return result.choices[0].message.content.trim();
    } else {
      console.error("API Response Error: Unexpected response format.");
      return "非預期的API回應格式";
    }

  } catch (e) {
    console.error("API get expection: " + e.toString());
    return "發生不預期的錯誤，請見LOG";
  }
}