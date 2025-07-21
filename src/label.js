// createLabel(name)	GmailLabel	建立指定名稱的新使用者標籤。
function addLabel(labelName, query) {
  let label = GmailApp.getUserLabelByName(labelName);

  if (!label) {
    console.log('Label not found. Create the label first.');
    label = GmailApp.createLabel(labelName);
  }

  const threads = getAllThreadsAdvanced({query});

  // label.addToThreads(threads);
  for (const thread of threads) {
    GmailApp.moveThreadToArchive(thread); // 從收件匣移除（等同於「移動」到標籤）
    label.addToThread(thread);            // 加上標籤
  }

  return CardService.newActionResponseBuilder()
      .setNotification(
          CardService.newNotification().setText(`完成加入標籤 : ${labelName} 共 ${threads.length} 封`),
          )
      .build();
}

// deleteLabel(label)	GmailApp	刪除指定的標籤。
function removeLabel(labelName, isDeleteLabel) {
  const label = GmailApp.getUserLabelByName(labelName);
  if (!label) {
    return CardService.newActionResponseBuilder()
      .setNotification(
          CardService.newNotification().setText(`找不到標籤 : ${labelName} , 移除標籤 ${isDeleteLabel}`),
          )
      .build();
  }
  threads = label.getThreads();

  label.removeFromThreads(threads);
  for (const thread of threads) {
    // label.removeFromThread(thread);     // 可選：移除原來的標籤
    GmailApp.moveThreadToInbox(thread); // 移回 inbox
  }

  if (isDeleteLabel) {
    GmailApp.deleteLabel(label);
  }

  return CardService.newActionResponseBuilder()
      .setNotification(
          CardService.newNotification().setText(`完成移除標籤 : ${labelName} 共 ${threads.length} 封 , 移除標籤 ${isDeleteLabel}`),
          )
      .build();
}

// 測試標籤用按鈕
function markLabelDatabase(e) {
  return addLabel('數據庫', 'in:anywhere 数据库');
}

// 測試標籤用按鈕
function removeLabelDatabase(e) {
  const isDeleteLabel = (e && e.formInput) ? e.formInput.isDeleteLabel === 'true' : false;
  return removeLabel('數據庫', isDeleteLabel);
}