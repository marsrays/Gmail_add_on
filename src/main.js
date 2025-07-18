var allThreads = [];

// 讀取全部信件放到暫存
function loadAllEmailBatch(isLog) {
  if (allThreads.length === 0) {
    allThreads = getAllThreadsAdvanced({
      query: 'in:anywhere',
      batchSize: 100,
      sort: false
    });
  }

  if (isLog) {
    allThreads.forEach((thread, index) => {
      const subject = thread.getFirstMessageSubject();
      const date = thread.getLastMessageDate();
      const globalIndex = index + 1;

      // 取得信件標籤（信件夾分類）
      const labels = thread.getLabels();
      const labelNames = labels.map(label => label.getName());
      let displayLabels = labelNames.length > 0 ? labelNames.join(', ') : '收件匣';
      displayLabels = thread.isInSpam() ? '垃圾郵件' : displayLabels;
      displayLabels = thread.isInTrash() ? '垃圾桶' : displayLabels;

      Logger.log(`${globalIndex}. "${subject}" (${date.toLocaleDateString()}) - 分類: ${displayLabels}`);
    });
  }
}

// 主入口，建立 Gmail Add-on UI
function buildAddOn(e) {
  Logger.log(e);
  try {
    loadAllEmailBatch(false);

    // 檢查是否有找到信件
    if (allThreads.length === 0) {
      Logger.log("createNoEmailCard")
      return createNoEmailCard();  // 若沒有信件則顯示「無信件」訊息
    }

    const [subjects, domains] = getClassify(allThreads);
    return createMainCard(subjects, domains);

  } catch (error) {
    Logger.log('錯誤：' + error.message);
    return createErrorCard(error.message);
  }
}

// 建立統計卡片 UI
function createMainCard(subjects, domains) {
  try {
    const card = CardService.newCardBuilder();

    card.addSection(getStatisticSession("📊 主題分類統計", subjects));
    card.addSection(getStatisticSession("👥 寄件人群組統計", domains));

    const section = CardService.newCardSection().setHeader("⭐ 各種操作");

    // 按鈕：重新統計
    const clearButton = CardService.newTextButton()
      .setText("當日統計")
      .setOnClickAction(CardService.newAction().setFunctionName("todayStats"));

    // 按鈕：加星號（主題含 Fwd）
    const starButton = CardService.newTextButton()
      .setText("標記 Fwd 星號")
      .setOnClickAction(CardService.newAction().setFunctionName("markFwdAsStarred"));

    // 按鈕：解除星號（主題含 Fwd）
    const unstarButton = CardService.newTextButton()
      .setText("取消 Fwd 星號")
      .setOnClickAction(CardService.newAction().setFunctionName("removeFwdStars"));

    // 按鈕：解除星號（主題含 Fwd）
    const exampleButton = CardService.newTextButton()
      .setText("官方示範卡片")
      .setOnClickAction(CardService.newAction().setFunctionName("createDefaultCard"));

    section.addWidget(clearButton);
    section.addWidget(starButton);
    section.addWidget(unstarButton);
    section.addWidget(exampleButton);

    card.addSection(section);

    return card.build();

  } catch (error) {
    Logger.log('錯誤：' + error.message);
    return createErrorCard(error.message);
  }
}

// Gmail Add-on 的進入點
function main(e) {
  return buildAddOn(e);
}
