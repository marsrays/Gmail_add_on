/**
 * Google Chat 機器人需要啟用 Google Chat API (https://console.cloud.google.com/marketplace/product/google/chat.googleapis.com)
 * 啟用後在 "設定" 頁面中勾選 "將這個 Chat 擴充應用程式建構為 Workspace 外掛程式。"
 * 若要使用外部服務或是 cloud run 運行 "HTTP 端點網址" 機器人則不可勾選此項
 * 若之前已使用 Google Workspace Marketplace SDK 發布過，則只能選Apps Script並會自動帶入部屬ID
 * PS. 發布 Marketplace 後，只能在 Marketplace 安裝頁面把此機器人加入聊天室
 */

/**
 * Google Chat 機器人事件處理加入聊天室
 */
function onAddedToSpace(e) {
    const spaceName = e.chat?.addedToSpacePayload?.space?.name || "";
    const displayName = e.chat?.removedFromSpacePayload?.space?.displayName || "";
    Logger.log(`📝 ${displayName} (${spaceName}) onAddedToSpace , JSON：${JSON.stringify(e)}`);
}

/**
 * Google Chat 機器人事件處理移出聊天室
 */
function onRemovedFromSpace(e) {
    const spaceName = e.chat?.removedFromSpacePayload?.space?.name || "";
    const displayName = e.chat?.removedFromSpacePayload?.space?.displayName || "";
    Logger.log(`📝 ${displayName} (${spaceName}) onRemovedFromSpace , JSON：${JSON.stringify(e)}`);
}

/**
 * Google Chat 機器人事件處理收到訊息
 */
function onMessage(e) {
    let spaceName = e.chat?.messagePayload?.message?.space?.name || "";
    let text = e.chat?.messagePayload?.message?.text || "";
    Logger.log(`📝 ${spaceName} onMessage ${text} , JSON：${JSON.stringify(e)}`);
    // Chat.Spaces.Messages.create({ text:"思考中..." }, spaceName, {});
    let userName = e.chat?.user?.name || "";

    let message = {};
    if (checkID(text)) {
        message = getIDMessage(userName);
    } else {
        message = getEchoMessage(userName, text);
    }

    return {
        "hostAppDataAction": {
            "chatDataAction": {
                "createMessageAction": {
                    message
                }
            }
        }
    };
}

/**
 * 檢查指令是否包含查詢ID關鍵字
 * @param command 用戶指令
 * @returns {boolean} 是否包含查詢ID關鍵字
 */
function checkID(command) {
    const checkIDKeywords = ['CHATID', 'CHAT ID', '查詢ID', '查询ID', '使用者ID', '我的ID', '查下ID', '查ID'];
    const text = command.toUpperCase();  // 轉成全大寫
    return checkIDKeywords.some(keyword => text.includes(keyword));
}

/**
 * Google Chat 機器人事件處理按鈕回應
 */
function eventConfirmation(e) {
    let spaceName = e.chat?.messagePayload?.message?.space?.name || "";
    Logger.log(`📝 ${spaceName} eventConfirmation, JSON：${JSON.stringify(e)}`);

    let userName = e.chat?.user?.name || "";

    let ans = e.commonEventObject?.parameters?.answer || "";

    const message = { hostAppDataAction: { chatDataAction: { createMessageAction: { message: {
                        text: `Hi \u003c${userName}\u003e 你按下按鈕：${ans}`
                    }}}}};

    return message;
}