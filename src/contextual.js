/**
 * Event e
 * {
 *    "clientPlatform": "web",
 *    "hostApp": "gmail",
 *    "gmail": {
 *        "messageId": "msg-f:1888313095599270248",
 *        "accessToken": "AND7SKXzD ... hpWGGgiVKJIWTT8ggOhpNw",
 *        "threadId": "thread-f:1888313095599270248"
 *    },
 *    "commonEventObject": {
 *        "hostApp": "GMAIL",
 *        "platform": "WEB"
 *    },
 *    "messageMetadata": {
 *        "accessToken": "AND7SKUQB1 ... 50JUFtfE1ChGzf3y7fpvw",
 *        "messageId": "msg-f:1888313095599270248",
 *        "threadId": "thread-f:1888313095599270248"
 *    }
 * }
 */
// 開啟郵件觸發
function onGmailMessageOpen(e) {
  try {
    // 啟動臨時 Gmail Scope 授權，在這種情況下才允許用於讀取訊息元資料和內容的附加元件
    var accessToken = e.gmail.accessToken;
    GmailApp.setCurrentMessageAccessToken(accessToken);

    // 讀取郵件元資料和內容，這需要 Gmail oauthScopes 授權
    // https://www.googleapis.com/auth/gmail.addons.current.message.readonly.
    var messageId = e.gmail.messageId;
    var message = GmailApp.getMessageById(messageId); // 沒授權會報錯
    var subject = message.getSubject();
    var sender = message.getFrom();
    var body = message.getPlainBody();
    var messageDate = message.getDate();

    // 使用 gmail.addons.current.message.readonly 設定存取 Token
    // 範圍還允許讀取線程中的其他訊息。
    var thread = message.getThread();
    var threadMessages = thread.getMessages();

    // 使用此連結可以避免複製訊息或主題內容
    var threadLink = thread.getPermalink();

    // 建立一張包含單一 Section 和兩個 Widget 的卡片
    // 請務必執行 build() 來完成卡片的建置
    var exampleCard = CardService.newCardBuilder()
        .setHeader(CardService.newCardHeader()
            .setTitle('信件讀取示範')
            .setSubtitle('展示信件內容')
            .setImageStyle(CardService.ImageStyle.SQUARE)
            .setImageUrl('https://images.pexels.com/photos/1447255/pexels-photo-1447255.jpeg'))
        .addSection(CardService.newCardSection().setHeader("ℹ️ 觸發輸入事件")
            .addWidget(CardService.newTextParagraph()
                .setText(`自動參數: <br><br>&nbsp;-&nbsp;e.gmail.accessToken :<br>${accessToken}<br><br>&nbsp;-&nbsp;e.gmail.messageId :<br>${messageId}`)))
        .addSection(CardService.newCardSection()
            .addWidget(CardService.newDecoratedText()
                .setTopLabel("標題")
                .setText(subject)
                .setWrapText(true))
            .addWidget(CardService.newDecoratedText()
                .setTopLabel("來自")
                .setText(sender)
                .setWrapText(true))
            .addWidget(CardService.newDecoratedText()
                .setTopLabel("時間")
                .setText(messageDate)
                .setWrapText(true))
            .addWidget(CardService.newDecoratedText()
                .setTopLabel("內文")
                .setText(body)
                .setWrapText(true)))
        .addSection(CardService.newCardSection().setHeader("📝 回信")
            .addWidget(CardService.newTextButton()
                .setText("使用範例一")
                .setOnClickAction(CardService.newAction().setFunctionName("onReply").setParameters({"id": messageId, "templateName": "temp1"}))))
        .build();   // Don't forget to build the Card!
    return [exampleCard];

  } catch (error) {
    console.log('錯誤：' + error.message);
    return createErrorCard(error.message);
  }
}

function onReply(e) {
  const [message, templateName] = [ GmailApp.getMessageById(e.parameters.id), e.parameters.templateName];
  const html = HtmlService.createTemplateFromFile(templateName).evaluate().getContent();
  message.createDraftReply("incapable of HTML", {htmlBody: html});  //"incapable of HTML" 如果後面htmlBody無法顯示時所出現的內容
}