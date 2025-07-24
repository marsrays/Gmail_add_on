/**
 * 取得所有 Gmail thread 的進階函數（支援分批載入）
 * @param {Object} options - 選項參數
 * @param {string} options.query - Gmail 搜尋查詢字串
 * @param {number} options.batchSize - 每批載入的數量，預設為 100
 * @param {number} options.maxTotal - 最大總數，預設為 999
 * @returns {GmailThread[]} Gmail thread 陣列
 */
function getAllThreadsAdvanced(options = {}) {
  const {
    query = '',
    batchSize = 100,
    maxTotal = 999,
    sort = false
  } = options;
  console.log(`options: ${options.query}`);

  let start = 0;
  let hasMore = true;
  const threads = []; // Reset allThreads

  console.log(`開始載入...`);
  while (hasMore) {
    let batchThreads;

    if (query) {
      batchThreads = GmailApp.search(query, start, batchSize);
    } else {
      batchThreads = GmailApp.getInboxThreads(start, batchSize);
    }

    if (batchThreads.length === 0) {
      break; // 沒有更多 threads 了
    }

    threads.push(...batchThreads);
    start += batchThreads.length;

    console.log(`已載入 ${threads.length} 個 thread...`);
    // 如果回傳的數量小於批次大小，表示沒有更多信件了
    if (batchThreads.length < batchSize) {
      hasMore = false;
    }
    if (start >= maxTotal) {
      console.log(`載入達最大值： ${maxTotal}`);
      hasMore = false;
    }
  }

  if (sort) {
    threads.sort((a, b) => {
      const timeDiff = b.getLastMessageDate().getTime() - a.getLastMessageDate().getTime();
      if (timeDiff !== 0) return timeDiff;

      // 第二層：用 thread ID 比大小（字典順序）
      return a.getId().localeCompare(b.getId());
    });
  }

  console.log(`載入完成，總共取得 ${threads.length} 個 thread`);
  return threads;
}

// 取得指定日期字串格式，若 date 是今日，可用 offset 設定昨日(-1)或明日(1)
function getDateFormat(date, offset = 0) {
  if (date instanceof Date) {
    const tz = Session.getScriptTimeZone(); // 確保使用腳本的時區
    const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset);
    return Utilities.formatDate(startOfDate, tz, 'yyyy/MM/dd');
  } else {
    return "2077/01/01"
  }
}

// 印出物件內容
function printObject(obj) {
  indent = '{ ';
  let count = 0;
  for (var key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    var value = obj[key];
    if (typeof value === 'object' && value !== null) {
      indent = indent + `\n&nbsp;&nbsp;"${key}" : `;
      indent = indent + `${printObject(value)}, `;
    } else {
      indent = indent + `\n&nbsp;&nbsp;"${key}" : "${value}", `;
    }
    count++;
  }
  indent = indent.replace(/,\s*$/, '');
  if (count === 0) {
    indent = indent + '}';
  } else {
    indent = indent + '\n}';
  }

  return indent;
}

function createFilledButton({text, functionName, color, icon}) {
  // Create a new text button
  const textButton = CardService.newTextButton();

  // Set the button text
  textButton.setText(text);

  // Set the action to perform when the button is clicked
  const action = CardService.newAction();
  action.setFunctionName(functionName);
  action.setLoadIndicator(CardService.LoadIndicator.SPINNER);
  textButton.setOnClickAction(action);

  if (color) {
    // Set the button style to filled
    textButton.setTextButtonStyle(CardService.TextButtonStyle.FILLED);
    // Set the background color
    textButton.setBackgroundColor(color);
  }

  textButton.setMaterialIcon(CardService.newMaterialIcon().setName(icon));  // See:https://fonts.google.com/icons?hl=zh-tw

  return textButton;
}

// 封裝換卡流程
function updateCard(card) {
  return CardService.newActionResponseBuilder()
      .setStateChanged(true)
      .setNavigation(CardService.newNavigation().updateCard(card))
      .build();
}

// 通用訊息卡片
function createInfoCard(message) {
  const card = CardService.newCardBuilder();
  const section = CardService.newCardSection();
  section.addWidget(CardService.newTextParagraph().setText(message));
  card.addSection(section);
  return card.build();
}

// 若無信件，顯示 "無信件" 訊息
function createNoEmailCard() {
  return CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader().setTitle('⚠️ 沒有找到任何信件'))
      .build();
}

// 顯示錯誤訊息卡片
function createErrorCard(errorMessage) {
  const card = CardService.newCardBuilder();
  const section = CardService.newCardSection().setHeader("⚠️ 錯誤");
  section.addWidget(CardService.newTextParagraph().setText(errorMessage));
  card.addSection(section);
  return card.build();
}

var testWidget;
var phoneNumber = '+1 (555) 555-1234';
// 官方示範卡片
function createDefaultCard() {
  testWidget = CardService.newDecoratedText()
                    .setStartIcon(
                        CardService.newIconImage().setIcon(CardService.Icon.PHONE))
                    .setText(phoneNumber);

  return CardService.newCardBuilder()
      .setHeader(
          CardService.newCardHeader()
              .setTitle('Widget demonstration')
              .setSubtitle('Check out these widgets')
              .setImageStyle(CardService.ImageStyle.SQUARE)
              .setImageUrl('https://images.pexels.com/photos/1069798/pexels-photo-1069798.jpeg'),
          )
      .addSection(
          CardService.newCardSection()
              .setHeader('Simple widgets')  // optional
              .setCollapsible(true)         // 收折 (Show more)
              .setNumUncollapsibleWidgets(1)// 收折後顯示到第n個 Widget 顯示
              .addWidget(
                  CardService.newTextParagraph().setText(
                      'These widgets are display-only. ' +
                          'A text paragraph can have multiple lines and ' +
                          'formatting.',
                      ),
                  )
              .addWidget(
                  CardService.newImage().setImageUrl(
                      'https://images.pexels.com/photos/4543103/pexels-photo-4543103.jpeg',
                      ),
                  ),
          )
      .addCardAction(
          CardService.newCardAction().setText('Gmail').setOpenLink(
              CardService.newOpenLink().setUrl('https://developers.google.com/apps-script/reference/card-service/card-action'),
              ),
          )
      .addSection(
          CardService.newCardSection()
            .setHeader('Contact Info')
            .setCollapsible(true)
            .addWidget(
                CardService.newDecoratedText()
                    .setStartIcon(
                        CardService.newIconImage().setIcon(CardService.Icon.EMAIL))
                    .setText('sasha@example.com'),
                )
            .addWidget(
                CardService.newDecoratedText()
                    .setStartIcon(
                        CardService.newIconImage().setIcon(CardService.Icon.PERSON))
                    .setText('<font color="#80e27e">Online</font>'),
                )
            .addWidget(
                  testWidget
                )
            .addWidget(
                CardService.newButtonSet()
                    .addButton(
                        CardService.newTextButton().setText('Share').setOpenLink(
                            CardService.newOpenLink().setUrl(
                                'https://example.com/share'),
                            ),
                        )
                    .addButton(
                        CardService.newTextButton()
                            .setText('Edit')
                            .setOnClickAction(
                                CardService.newAction()
                                    .setFunctionName('onEdit')
                                    .setParameters({viewType: 'EDIT'}),
                                ),
                        ),
                  )
          )
      .build();
}

function onEdit(e) {
  const viewType = e.parameters.viewType;
  if (viewType === 'EDIT') {
    const card = CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader().setTitle('編輯電話'))
      .addSection(
        CardService.newCardSection()
          .addWidget(
            CardService.newTextInput()
              .setFieldName('editField')
              .setTitle('請輸入電話')
          )
          .addWidget(
            CardService.newTextButton()
              .setText('儲存')
              .setOnClickAction(
                CardService.newAction().setFunctionName('onSaveContent')
              )
          )
      )

      .build();

    return CardService.newNavigation().pushCard(card);
  } else if (viewType === 'VIEW') {
    return createInfoCard(phoneNumber)
  }
}

function onSaveContent(e) {
  try {
    const userInput = e.formInput.editField;

    // 假裝儲存資料，可依實際情況儲存至 Spreadsheet / Gmail draft / etc.
    Logger.log('使用者輸入：' + userInput);

    phoneNumber = userInput;  // 不會在舊卡片生效(卡片一生成，資料就不可動了)

    return CardService.newNavigation().pushCard(createDefaultCard()); // 新卡片會生效
  } catch (error) {
    console.log('錯誤：' + error.message);
    return createErrorCard(error.message);
  }
}

function onAItest() {
  const threads = GmailApp.search('is:unread', 0, 1);
  if (threads.length === 0) {
    return;
  }
  const thread = threads[0];
  const message = thread.getMessages()[thread.getMessages().length - 1];
  const subject = message.getSubject();
  const plainBody = message.getPlainBody();
  const htmlBody = message.getBody();

  console.log(`AItest ${subject}\nplainBody :\n${plainBody}`);
  const prompt = `
您是一位負責回覆商務郵件的助理。
以下是我收到的郵件內容。
我的寫作風格特色如下：

[我的電子郵件寫作特色]
---
◾內部郵件：
- 在開頭註明有出現在回文的收件人姓名（例如：致XX、YY、ZZ）
- 以「感謝大家花費寶貴時間的回覆。我是 ${Session.getEffectiveUser().getUsername()}」開頭。
- 使用清晰的指示、項目符號和連結組織資訊。
- 內容明確，給予具體的行動指示，並明確說明截止日期。
- 以「以上，感謝您的合作\n\nBest Regards\n\n${Session.getEffectiveUser().getUsername()}」結尾。

請為我建立一封自然流暢的商務郵件回覆。
*您無需包含收件人或簽名。
*請僅產生回覆正文。腳本將自動新增原始郵件的引用。

--- 收到的郵件內文 ---
${plainBody}
--- 結束 ---`;

  const result = generateReplyWithOpenAI(prompt);
  console.log(`AItest result :\n${result}`);
  return createInfoCard(`💡 提示詞:\n${prompt}\n\n\n🤖 AI 回應:\n\n${result}`);
}

function buildTextareaCard() {
  return updateCard(buildCardWithText(0, 'heLLo World\n這是預設文字\n換行\n\n你可以修改它\nHELLO WORLD'));
}

function buildCardWithText(idx, textValue) {
  const textInput = CardService.newTextInput()
    .setFieldName('myTextarea')         // 輸入框的識別名稱
    .setTitle('請輸入內容')             // 顯示在輸入框上方的標題文字
    .setHint('在這裡輸入多行文字…')     // 顯示在輸入框內的提示文字
    .setMultiline(true)               // ✅ 設為多行（Textarea）
    .setValue(textValue); // ✅ 設定預設值

  const button = CardService.newTextButton()
    .setText('World 置換成 Gmail')
    .setOnClickAction(
      CardService.newAction()
        .setFunctionName('handleChangeText').setParameters({idx: `${idx + 1}`})
    );
  // 按鈕：home
    const homeButton = createFilledButton({
      text: '首頁',
      functionName: 'homePage',
      color: '#ECB576',
      icon: 'keyboard_return'
    });

  const section = CardService.newCardSection().setHeader("第"+idx+"次置換")
    .addWidget(textInput)
    .addWidget(button);

  const footer = CardService.newFixedFooter().setPrimaryButton(homeButton);

  const card = CardService.newCardBuilder()
    .addSection(section)
    .setFixedFooter(footer)
    .build();

  return card;
}

function handleChangeText(e) {
  const userInput = e.formInput.myTextarea;
  const idx = parseInt(e.parameters.idx, 10);

  // 使用正規式將 Hello world 換成 Hello Gmail
  const newText = userInput.replace(/hello world/ig, 'Hello Gmail');

  const newCard = buildCardWithText(idx, newText);

  return CardService.newActionResponseBuilder()
      .setStateChanged(true)
      .setNavigation(CardService.newNavigation().updateCard(newCard))
      .build();
}