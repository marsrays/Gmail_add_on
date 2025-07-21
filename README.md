# Gmail Add-on

Google Apps Script add-on for Gmail

## 專案簡介

這是一個測試並實作 Gmail add-on 的專案，主要示範如何用 Google Apps Script 撰寫的 add-on 實作與 Gmail 互動。

## 功能特色

- **信件標記**: 快速標記信件為星號
- **郵件統計**: 提供各種郵件統計資訊
- **自訂介面**: 整合 Gmail 側邊欄的使用者介面
- **即時互動**: 與 Gmail 信件進行即時互動

## 技術架構

- **開發語言**: JavaScript (Google Apps Script)
- **平台**: Google Workspace
- **整合服務**: Gmail API
- **介面框架**: Card Service

## 檔案結構

```
Gmail_add_on/
├── src/
│   ├── api.js           # 外部呼叫 RESTful api
│   ├── appsscript.json  # 專案設定檔與 add-on 配置
│   ├── cache.js         # 資料暫存元件
│   ├── common.js        # 公用卡片元件
│   ├── compose.js       # 寫信元件
│   ├── contextual.js    # 讀信元件
│   ├── label.js         # 標籤控制元件
│   ├── main.js          # 主程序入口點
│   ├── star.js          # 信件標記星號功能
│   ├── statistics.js    # 郵件統計功能
│   ├── temp1.html       # html 模板1 (貓圖)
│   └── temp2.html       # html 模板2 (動態輸入請假信)
└── README.md           # 專案說明文件
```

## 建立與部署

### 前置需求

- Google 帳戶
- Gmail 存取權限
- Google Apps Script 存取權限

### 建立專案

1. 開啟 [Google Apps Script 控制台](https://script.google.com)
2. 點擊「新增專案」
3. 將專案命名為 `Gmail_add_on`

### 匯入程式碼

1. 刪除預設的 `Code.gs` 檔案
2. 依序建立以下檔案並複製對應的程式碼：
   - `appsscript.json` - 專案設定檔
   - `main.js` - 主程序入口點
   - `common.js` - 公用卡片元件
   - `star.js` - 信件標記功能
   - `statistics.js` - 郵件統計功能

注意：將 `src/` 資料夾中的所有檔案內容複製到 Google Apps Script 專案中

### 設定權限

1. 在 Google Apps Script 編輯器中點擊「服務」
2. 新增 Gmail API 服務
3. 確認 `appsscript.json` 中的權限設定正確

### appsscript.json 設定
#### oauthScopes
 - "https://www.googleapis.com/auth/calendar.addons.execute",              // Calendar: 執行 Add-on 功能
 - "https://www.googleapis.com/auth/calendar.readonly",                    // Calendar: 讀取日曆資訊
 - "https://www.googleapis.com/auth/drive.addons.metadata.readonly",       // Drive: 讀取 Drive 檔案的基本資料
 - "https://www.googleapis.com/auth/gmail.addons.current.action.compose",  // Gmail: 撰寫郵件時的操作
 - "https://www.googleapis.com/auth/gmail.addons.current.message.readonly",// Gmail: 讀取郵件內容
 - "https://www.googleapis.com/auth/gmail.addons.execute",                 // Gmail: 執行 Add-on 功能
 - "https://www.googleapis.com/auth/gmail.addons.current.action.compose",  // Gmail: 建立新的草稿訊息和回覆
 - "https://www.googleapis.com/auth/gmail.addons.current.message.metadata",// Gmail: 讀取訊息中繼資料 (例如主旨或收件者) 。不允許讀取訊息內容，且需要存取 token
 - "https://www.googleapis.com/auth/script.locale"                         // Script locale: 取得使用者的語言設定
#### addOns
 - common // 共通設定，當其他專屬部分沒有設定時使用這裡的設定當預設
   - name // 名稱
   - logoUrl // 元件圖標
   - useLocaleFromApp // true: Add-on 會使用使用者當前語言, false: Add-on 會使用預設語言（通常是英文）
   - homepageTrigger // 首頁觸發器: 當使用者開啟 Add-on 時會執行，若其他專屬部分也設定這一區塊，用專屬Apps裡時這裡設定會無效 (runFunction, enabled參數必填)
   - universalActions // 通用動作陣列，openLink與runFunction二選一，可設置複數組不同功用按鈕
 - gmail // Gmail 設定
   - contextualTriggers // 上下文觸發器: 當使用者查看任何郵件時觸發函式
   - composeTrigger // 撰寫觸發器: 在撰寫郵件時觸發函式，可設定多組 selectActions 按鈕動作
   - draftAccess // 控制對草稿的存取權限 "NONE" 或 "METADATA"(event.draftMetadata)
 - Drive // Drive 設定
   - onItemsSelectedTrigger // 檔案選取觸發器
 - Calendar // Calendar 設定
   - eventOpenTrigger // 日曆事件觸發器


### 部署 Add-on

1. 在 Google Apps Script 編輯器中點擊「部署」
2. 選擇「新增部署」
3. 選擇類型為「Add-on」
4. 設定部署描述
5. 點擊「部署」

### 測試部署

1. 部署完成後，開啟 Gmail
2. 選擇任一封郵件
3. 在右側面板應該會看到您的 add-on
4. 點擊 add-on 圖示測試功能

## 開發與測試

### 本地測試

1. **函數測試**：
   - 在 Google Apps Script 編輯器中選擇特定函數
   - 點擊「執行」按鈕
   - 查看執行記錄了解運作狀況

2. **權限授權**：
   - 首次執行會要求授權
   - 依照提示完成 OAuth 流程
   - 確認所有必要權限都已授予

3. **除錯模式**：
   - 使用 `console.log()` 輸出除錯資訊
   - 在「執行」標籤中查看記錄
   - 利用 Google Apps Script 的內建除錯工具

### Gmail 整合測試

1. **部署測試版本**：
   - 建立測試部署
   - 僅對特定使用者開放測試

2. **功能驗證**：
   - 測試信件標記功能
   - 驗證統計資料正確性
   - 確認介面響應正常

3. **錯誤處理**：
   - 測試各種邊界情況
   - 確認錯誤訊息友善易懂
   - 驗證異常狀況的處理

## 模組說明

### src/appsscript.json
專案設定檔，定義 add-on 的基本資訊、權限需求和觸發條件

### src/main.js
主程序入口點，處理 Gmail 事件觸發和 add-on 初始化

### src/common.js
公用卡片元件，提供可重複使用的 UI 元素和共用函數

### src/star.js
實作信件標記星號功能，包含標記和取消標記的邏輯

### src/statistics.js
實作郵件統計功能，提供各種郵件數據分析和統計資訊

## 常見問題

### Q: 如何更新已部署的 add-on？
A: 在 Google Apps Script 編輯器中修改程式碼後，重新部署即可。現有使用者會自動取得更新。

### Q: Add-on 沒有出現在 Gmail 中？
A: 確認已正確部署，並檢查 appsscript.json 設定。可能需要重新整理 Gmail 頁面。

### Q: 如何處理權限問題？
A: 在 Google Apps Script 中重新授權，或檢查 appsscript.json 中的權限設定是否完整。

### Q: 可以分享給其他使用者嗎？
A: 可以，透過 Google Apps Script 的部署設定，可以將 add-on 分享給特定使用者或公開發布。

## 版本控制

建議使用 Git 進行版本控制，或利用 Google Apps Script 的版本功能管理程式碼變更。

## 貢獻

歡迎提交 Issue 和 Pull Request 來改善此專案。

## 授權

MIT License

## 聯絡資訊

如有任何問題或建議，請透過 GitHub Issues 與我們聯繫。

---

*此專案僅供學習和測試目的使用*
