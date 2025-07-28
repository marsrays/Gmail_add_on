/**
 * 建立觸發器設定卡片
 */
function buildTriggerCard(e) {
  const card = CardService.newCardBuilder();

  const input = CardService.newTextInput()
    .setFieldName('triggerTime')
    .setTitle('請輸入觸發時間 (0-23，代表幾點)')
    .setHint('例如：9 表示早上9點');

  const setButton = CardService.newTextButton()
    .setText('✅ 設定觸發器')
    .setOnClickAction(
      CardService.newAction()
        .setFunctionName('setTrigger')
        .setLoadIndicator(CardService.LoadIndicator.SPINNER)
    );

  const deleteButton = CardService.newTextButton()
    .setText('❌ 取消觸發器')
    .setOnClickAction(
      CardService.newAction()
        .setFunctionName('deleteTriggers')
        .setLoadIndicator(CardService.LoadIndicator.SPINNER)
    );

  const section = CardService.newCardSection()
    .addWidget(input)
    .addWidget(setButton)
    .addWidget(deleteButton);

  return card.addSection(section).build();
}

/**
 * 使用者按下「設定觸發器」時的處理函式
 */
function setTrigger(e) {
  const userTime = e.commonEventObject.formInputs.triggerTime.stringInputs.value[0];
  const hour = parseInt(userTime, 10);

  if (isNaN(hour) || hour < 0 || hour > 23) {
    return buildInfoCard(`⚠️ 請輸入 0 到 23 的整數時間`);
  }

  // 先刪除舊的觸發器（防重複）
  deleteTriggers();

  ScriptApp.newTrigger('markLabelDatabase')
    .timeBased()
    .everyDays(1)
    .atHour(hour)
    .create();

  return CardService.newActionResponseBuilder()
      .setNotification(
          CardService.newNotification().setText(`✅ 觸發器已設定在每天 ${hour}:00`))
      .setStateChanged(true)
      .build();
}

/**
 * 使用者按下「取消觸發器」時的處理函式
 */
function deleteTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'markLabelDatabase') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  return CardService.newActionResponseBuilder()
      .setNotification(
          CardService.newNotification().setText(`🗑️ 觸發器已刪除`))
      .setStateChanged(true)
      .build();
}