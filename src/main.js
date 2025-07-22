// 主入口，建立 Gmail Add-on UI
function buildAddOn(e) {
  console.log(e);
  try {
    // logAllEmailBatch();
    // simpleGetRequest('https://www.stdtime.gov.tw/Home/GetServerTime');

    clearAllCache();
    const [subjects, domains] = getClassify([]);
    return createMainCard(subjects, domains);
  } catch (error) {
    console.log('錯誤：' + error.message);
    return createErrorCard(error.message);
  }
}

// 讀取全部信件放到暫存
function logAllEmailBatch(isLog) {
  let allThreads = getAllThreadsAdvanced({
      query: 'in:anywhere',
      batchSize: 100,
      sort: false
    });

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

      console.log(`${globalIndex}. "${subject}" (${date.toLocaleDateString()}) - 分類: ${displayLabels}`);
    });
  }

  return allThreads;
}

// 建立統計卡片 UI
function createMainCard(subjects, domains) {
  try {
    const card = CardService.newCardBuilder();

    card.addSection(getStatisticSession("📊 主題分類統計", subjects));
    card.addSection(getStatisticSession("👥 寄件人群組統計", domains));

    const section = CardService.newCardSection().setHeader("⭐ 各種操作");

    // 按鈕：重新統計
    const todayButton = createFilledButton({
      text: '當日統計',
      functionName: 'todayStats',
      icon: 'stacks'
    });

    // 按鈕：全部統計
    const allButton = createFilledButton({
      text: '全部統計',
      functionName: 'allStats',
      icon: 'view_timeline'
    });

    // 按鈕：加星號（主題含 Fwd）
    const starButton = CardService.newTextButton()
      .setText("標記 Fwd 星號")
      .setOnClickAction(CardService.newAction().setFunctionName("markFwdAsStarred"));

    // 按鈕：解除星號（主題含 Fwd）
    const unstarButton = CardService.newTextButton()
      .setText("取消 Fwd 星號")
      .setOnClickAction(CardService.newAction().setFunctionName("removeFwdStars"));

    // 按鈕：新增標籤（資料庫）
    const addLabelButton = createFilledButton({
      text: '新增標籤:資料庫',
      functionName: 'markLabelDatabase',
      color: '#34A853',
      icon: 'add'
    });

    const switchDecoratedText = CardService.newDecoratedText()
      .setTopLabel('控制開關(預設:關閉)')
      .setText('移除標籤時，是否同時刪除標籤')
      .setWrapText(true)
      .setSwitchControl(
          CardService.newSwitch()
              .setFieldName('isDeleteLabel')
              .setValue('true')
      );

    // 按鈕：移除標籤（資料庫）
    const removeLabelButton = createFilledButton({
      text: '移除標籤:資料庫',
      functionName: 'removeLabelDatabase',
      color: '#FF0000',
      icon: 'delete'
    });

    // 按鈕：解除星號（主題含 Fwd）
    const exampleButton = CardService.newTextButton()
      .setText("官方示範卡片")
      .setOnClickAction(CardService.newAction().setFunctionName("createDefaultCard"));

    section.addWidget(todayButton);
    section.addWidget(allButton);

    section.addWidget(CardService.newButtonSet()
      .addButton(starButton)
      .addButton(unstarButton)
      .addButton(exampleButton));

    card.addSection(section);

    const sectionLabel = CardService.newCardSection().setHeader("🏷️ 標籤操作");
    sectionLabel.addWidget(addLabelButton);
    sectionLabel.addWidget(removeLabelButton);
    sectionLabel.addWidget(switchDecoratedText);

    card.addSection(sectionLabel);

    return card.build();

  } catch (error) {
    console.log('錯誤：' + error.message);
    return createErrorCard(error.message);
  }
}


