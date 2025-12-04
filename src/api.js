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

function generateReplyWithOpenAI(prompt) {
  const apiKey = PropertiesService.getScriptProperties().getProperty("OPENAI_API_KEY");
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

/**
 * 啟用 Vision API
 * 1. 前往你 Apps Script 專案所屬的 Google Cloud Console
 * 2. 啟用 Cloud Vision API
 * 3. 開啟「OAuth 同意畫面」，選擇「內部使用」
 * 4. 不需產生 API Key，因為 Apps Script 會自動用 OAuth2 授權
 * 但缺點就是發佈後使用者沒有授權Cloud Vision API不能用，所以要用專案「API與服務」中的KEY選項，自產 API_KEY 呼叫的方式
 */
function callVisionOCR(base64Image) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('VISION_API_KEY');
  const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

  const payload = {
    requests: [
      {
        image: { content: base64Image },
        features: [{ type: "TEXT_DETECTION", maxResults: 1 }],
        imageContext: {
          languageHints: ["zh-Hans", "zh-Hant"] // 建議加入語言提示，提高中文辨識準確性
        }
      }
    ]
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    // headers: {
    //   Authorization: 'Bearer ' + ScriptApp.getOAuthToken()
    // },
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const result = JSON.parse(response.getContentText());
  // Logger.log(`📝 OCR\nResult：${response.getResponseCode()}\nContentText:\n${response.getContentText()}`);
  const text = result.responses?.[0]?.fullTextAnnotation?.text || "（沒有辨識到文字）";
  return text;
}

function callChatWebhook(url, message) {
  //const url = `https://chat.googleapis.com/v1/spaces/${spaceId}/messages??key=${key}&token=${token}`;
  UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(message)
  });

  console.log(`chatWebhook url : ${url} , message : ${JSON.stringify(message)}`);
}