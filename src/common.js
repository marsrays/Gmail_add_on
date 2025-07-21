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