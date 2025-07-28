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

/**
 * Calls the Google Cloud Vision API's images:annotate endpoint
 * to perform TEXT_DETECTION and DOCUMENT_TEXT_DETECTION on a Base64 encoded image.
 *
 * @param {string} base64Image The Base64 encoded image string (e.g., "data:image/jpeg;base64,...").
 * @returns {object|null} The API response object, or null if an error occurs.
 */
function callVisionAPI(base64Image) {
  // --- IMPORTANT: Replace with your Google Cloud Project ID ---
  const GOOGLE_CLOUD_PROJECT_ID = 'YOUR_GOOGLE_CLOUD_PROJECT_ID'; // e.g., 'my-project-12345'
  // -----------------------------------------------------------

  if (!GOOGLE_CLOUD_PROJECT_ID || GOOGLE_CLOUD_PROJECT_ID === 'YOUR_GOOGLE_CLOUD_PROJECT_ID') {
    Logger.log('ERROR: Please replace "YOUR_GOOGLE_CLOUD_PROJECT_ID" with your actual project ID.');
    Browser.msgBox('Error', 'Please replace "YOUR_GOOGLE_CLOUD_PROJECT_ID" with your actual project ID in the script.', Browser.Buttons.OK);
    return null;
  }

  // Clean the base64 string if it contains the data URI prefix (e.g., "data:image/jpeg;base64,")
  let cleanBase64Image = base64Image;
  if (base64Image.includes(';base64,')) {
    cleanBase64Image = base64Image.split(',')[1];
  }

  const API_ENDPOINT = `https://vision.googleapis.com/v1/images:annotate`;

  const requestBody = {
    requests: [
      {
        image: {
          content: cleanBase64Image
        },
        features: [
          {
            type: "TEXT_DETECTION"
          },
          {
            type: "DOCUMENT_TEXT_DETECTION"
          }
        ],
        // Optional: Add language hints for better Chinese recognition
        imageContext: {
          languageHints: ["zh-Hans", "zh-Hant"] // Simplified and Traditional Chinese
        }
      }
    ]
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(requestBody),
    // Use OAuth token for authentication
    headers: {
      Authorization: 'Bearer ' + ScriptApp.getOAuthToken()
    },
    muteHttpExceptions: true // Prevents Apps Script from throwing an error on HTTP 4xx/5xx responses
  };

  try {
    const response = UrlFetchApp.fetch(API_ENDPOINT, options);
    const jsonResponse = JSON.parse(response.getContentText());

    if (response.getResponseCode() === 200) {
      Logger.log('API call successful!');
      Logger.log(JSON.stringify(jsonResponse, null, 2)); // Log the full response for inspection
      return jsonResponse;
    } else {
      Logger.log('API Error: ' + response.getResponseCode() + ' - ' + response.getContentText());
      Browser.msgBox('API Error', 'Vision API call failed: ' + response.getContentText(), Browser.Buttons.OK);
      return null;
    }
  } catch (e) {
    Logger.log('Script Error: ' + e.toString());
    Browser.msgBox('Script Error', 'An error occurred during the API call: ' + e.toString(), Browser.Buttons.OK);
    return null;
  }
}

// --- Example Usage ---
/**
 * A helper function to demonstrate how to call callVisionAPI with a sample image.
 * Replace the base64Image variable with your actual image data.
 */
function testVisionAPI() {
  // IMPORTANT: Replace this with an actual Base64 encoded image string.
  // You can convert an image to Base64 online or using other tools.
  // For security and practicality, do NOT paste very large base64 strings directly here.
  // In a real application, you might get this from a Google Drive file or a form submission.
  //
  // Example (truncated for brevity, REPLACE THIS!):
  const sampleBase64Image = "iVBORw0KGgoAAAANSUhEUgAA... (your actual base64 string here)"; // This should be a base64 string of your image, WITHOUT the "data:image/jpeg;base64," prefix if you manually add it, as the function handles it.

  if (sampleBase64Image === "iVBORw0KGgoAAAANSUhEUgAA... (your actual base64 string here)") {
    Browser.msgBox('Warning', 'Please replace the `sampleBase64Image` variable with your actual Base64 image data to test.', Browser.Buttons.OK);
    return;
  }

  const apiResponse = callVisionAPI(sampleBase64Image);

  if (apiResponse) {
    Logger.log('--- Processed API Response (for specific fields) ---');

    // Example of how to parse the response for document text detection
    // The fullTextAnnotation contains the structured text
    if (apiResponse.responses && apiResponse.responses.length > 0 && apiResponse.responses[0].fullTextAnnotation) {
      const fullText = apiResponse.responses[0].fullTextAnnotation.text;
      Logger.log('Full detected text:\n' + fullText);

      // --- Advanced Parsing (example - requires specific logic based on layout) ---
      // This part would be specific to YOUR image layout.
      // For the "轉帳憑證" image, you'd look for keywords like "交易金額", "收款人", "交易時間"
      // and then extract the text or numbers next to them.

      // Example for the specific "轉帳成功金額" from image_503401.jpg:
      // You'd look for "转账成功" or "¥" then the number
      const amountRegex = /¥\s*([\d,]+\.\d{2})/; // Matches ¥ followed by a number with commas and two decimals
      const amountMatch = fullText.match(amountRegex);
      if (amountMatch && amountMatch[1]) {
        Logger.log('Detected Amount: ' + amountMatch[1]);
      }

      // Example for "收款方帐号" (from the example image):
      // You'd look for a long sequence of numbers after "收款账号" or "收款账户"
      const accountNumberRegex = /(收款账号|收款帳號)\s*(\d{4}\s*\*\*\*\*\*\*\s*\d{4}|\d{16,})/; // Matches "收款账号" and then a pattern of numbers/stars
      const accountNumberMatch = fullText.match(accountNumberRegex);
      if (accountNumberMatch && accountNumberMatch[2]) {
        Logger.log('Detected Account Number: ' + accountNumberMatch[2].replace(/\s/g, '')); // Remove spaces for clean number
      }

      // Example for "轉帳時間":
      // Look for "交易时间" or "交易時間" followed by a date/time pattern
      const transactionTimeRegex = /(交易时间|交易時間)\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/;
      const transactionTimeMatch = fullText.match(transactionTimeRegex);
      if (transactionTimeMatch && transactionTimeMatch[2]) {
        Logger.log('Detected Transaction Time: ' + transactionTimeMatch[2]);
      }

    } else {
      Logger.log('No fullTextAnnotation found in the response.');
    }
  } else {
    Logger.log('Vision API call failed. Check logs for details.');
  }
}