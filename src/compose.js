/**
 * 請求撰寫介面時觸發的撰寫觸發器函數。建立並返回用於插入圖片的撰寫介面。
 *
 * @param {event} e 撰寫觸發事件物件
 * @return {Card[]}
 */
function onGmailCompose(e) {
  return [buildComposeCard()];
}

/**
 * 建立一個卡片來顯示互動式按鈕，以允許使用者更新主題以及收件者、副本、密送人。
 *
 * @return {Card}
 */
function buildComposeCard() {

  var card = CardService.newCardBuilder();
  var header = CardService.newCardHeader()
      .setTitle('模板操作')
      .setSubtitle(`<ul>
    <li>1.主題</li>
    <li>2.收件者</li>
    <li>3.副本</li>
    <li>4.密件副本</li>
    <li>5.貓圖</li>
</ul>`)
      .setImageStyle(CardService.ImageStyle.SQUARE)
      .setImageUrl('https://images.pexels.com/photos/281962/pexels-photo-281962.jpeg');
  var cardSection = CardService.newCardSection().setHeader('Update email');
  cardSection.addWidget(
      CardService.newTextButton()
          .setText('Update subject')
          .setOnClickAction(CardService.newAction()
              .setFunctionName('updateSubject')));
  cardSection.addWidget(
      CardService.newTextButton()
          .setText('Update To recipients')
          .setOnClickAction(CardService.newAction()
              .setFunctionName('updateToRecipients')));
  cardSection.addWidget(
      CardService.newTextButton()
          .setText('Update Cc recipients')
          .setOnClickAction(CardService.newAction()
              .setFunctionName('updateCcRecipients')));
  cardSection.addWidget(
      CardService.newTextButton()
          .setText('Update Bcc recipients')
          .setOnClickAction(CardService.newAction()
              .setFunctionName('updateBccRecipients')));

  var inputSuperior = CardService.newTextInput()
      .setFieldName('superior')
      .setTitle('上級')
      .setHint('輸入你的上級');
  var inputMyName = CardService.newTextInput()
      .setFieldName('myName')
      .setTitle('名字')
      .setHint('輸入你的名字');
  var button = CardService.newTextButton()
      .setText('插入請假範例')
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED_TONAL)
      .setOnClickAction(CardService.newAction()
          .setFunctionName('onGmailInsertLeaveAsk')
          .addRequiredWidget('superior')
          .addRequiredWidget('myName'));
  cardSection.addWidget(inputSuperior);
  cardSection.addWidget(inputMyName);
  cardSection.addWidget(button);


  var input = CardService.newTextInput()
      .setFieldName('text')
      .setTitle('貓圖文字')
      .setHint('輸入你想放在貓圖上的文字...');
  // Create a button that inserts the cat image when pressed.
  var button = CardService.newTextButton()
      .setText('插入貓圖')
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
      .setOnClickAction(CardService.newAction()
        .setFunctionName('onGmailInsertCat'));
  var buttonSet = CardService.newButtonSet()
      .addButton(button);
  cardSection.addWidget(input).addWidget(buttonSet);
  return card.setHeader(header).addSection(cardSection).build();
}

function onGmailInsertLeaveAsk(e) {
  const {
    superior = 'Unknow',
    myName = 'Anonymous',
  } = e.formInput;
  const html = HtmlService.createTemplateFromFile('temp2');//.evaluate().getContent();
  // 動態改 html template
  html.Superior = superior;
  html.MyName = myName;

  var response = CardService.newUpdateDraftActionResponseBuilder()
      .setUpdateDraftBodyAction(CardService.newUpdateDraftBodyAction()
          .addUpdateContent(html.evaluate().getContent(),CardService.ContentType.MUTABLE_HTML)
          .setUpdateType(CardService.UpdateDraftBodyType.IN_PLACE_INSERT))
      .build();
  return response;
}

/**
 * Callback for inserting a cat into the Gmail draft.
 * @param {Object} e The event object.
 * @return {CardService.UpdateDraftActionResponse} The draft update response.
 */
function onGmailInsertCat(e) {
  console.log(e);
  // Get the text that was entered by the user.
  var text = e.formInput.text;
  // Use the "Cat as a service" API to get the cat image. Add a "time" URL
  // parameter to act as a cache buster.
  var now = new Date();
  var imageUrl = 'https://cataas.com/cat';
  if (text) {
    // Replace forward slashes in the text, as they break the CataaS API.
    var caption = text.replace(/\//g, ' ');
    imageUrl += Utilities.formatString('/says/%s?time=%s',
        encodeURIComponent(caption), now.getTime());
  }
  var imageHtmlContent = '<img style="display: block; max-height: 300px;" src="'
      + imageUrl + '"/>';
  var response = CardService.newUpdateDraftActionResponseBuilder()
      .setUpdateDraftBodyAction(CardService.newUpdateDraftBodyAction()
          .addUpdateContent(imageHtmlContent,CardService.ContentType.MUTABLE_HTML)
          .setUpdateType(CardService.UpdateDraftBodyType.IN_PLACE_INSERT))
      .build();
  return response;
}

/**
 * 當使用者在撰寫 UI 中點擊「更新主題」時，更新目前電子郵件的主題欄位。
 *
 * Note: 這不是建立撰寫 UI 的撰寫操作，而是使用者與撰寫 UI 互動時採取的操作。
 *
 * @return {UpdateDraftActionResponse}
 */
function updateSubject() {
  // 取得電子郵件的新主題字段
  var subject = "測試"; //getSubject();
  var response = CardService.newUpdateDraftActionResponseBuilder()
      .setUpdateDraftSubjectAction(CardService.newUpdateDraftSubjectAction()
          .addUpdateSubject(subject))
      .build();
  return response;
}

/**
 * 當使用者在撰寫 UI 中點擊「更新收件者」時，更新目前電子郵件的收件者。
 *
 * Note: 這不是建立撰寫 UI 的撰寫操作，而是使用者與撰寫 UI 互動時採取的操作。
 *
 * @return {UpdateDraftActionResponse}
 */
function updateToRecipients() {
  // 取得電子郵件的新收件者
  var toRecipients = ['abc@reci.com']; //getToRecipients();
  var response = CardService.newUpdateDraftActionResponseBuilder()
      .setUpdateDraftToRecipientsAction(CardService.newUpdateDraftToRecipientsAction()
          .addUpdateToRecipients(toRecipients))
      .build();
  return response;
}

/**
 * 當使用者在撰寫 UI 中點擊「更新副本收件者」時，更新目前電子郵件的副本收件者。
 *
 * Note: 這不是建立撰寫 UI 的撰寫操作，而是使用者與撰寫 UI 互動時採取的操作。
 *
 * @return {UpdateDraftActionResponse}
 */
function updateCcRecipients() {
  // 取得電子郵件的新副本收件者
  var ccRecipients = ['abc@cc.com']; //getCcRecipients();
  var response = CardService.newUpdateDraftActionResponseBuilder()
      .setUpdateDraftCcRecipientsAction(CardService.newUpdateDraftCcRecipientsAction()
          .addUpdateCcRecipients(ccRecipients))
      .build();
  return response;
}

/**
 * 當使用者在撰寫 UI 中點選「更新密件副本收件者」時，更新目前電子郵件的密件副本收件者。
 *
 * Note: 這不是建立撰寫 UI 的撰寫操作，而是使用者與撰寫 UI 互動時採取的操作。
 *
 * @return {UpdateDraftActionResponse}
 */
function updateBccRecipients() {
  // 取得電子郵件的新密件副本收件者
  var bccRecipients = ['abc@bcc.com']; //getBccRecipients();
  var response = CardService.newUpdateDraftActionResponseBuilder()
      .setUpdateDraftBccRecipientsAction(CardService.newUpdateDraftBccRecipientsAction()
          .addUpdateBccRecipients(bccRecipients))
      .build();
  return response;
}