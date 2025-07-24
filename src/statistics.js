// 用關鍵詞擷取主題分類（可依需求擴展為 NLP）
function extractKeyword(subject) {
  if (subject.match(/数据库|database/i)) return "數據庫";
  if (subject.match(/OL環境|OL/i)) return "環境部屬 OL";
  if (subject.match(/PRE環境|PRE/i)) return "環境部屬 PRE";
  return "etc 其他";
}

// 信箱 domain 分類
function extractDomain(address) {
  const match = address.match(/@([\w.-]+)/);
  return match ? match[1].toLowerCase() : "未知";
}

/**
 * 取得各種分類
 * @param {GmailThread[]} GmailThread 信件陣列
 * @returns {[]} [subjects, domains] 分類物件陣列
 */
function getClassify(threads) {
  const subjects = {};
  const domains = {};

  for (const thread of threads) {
    const msg = thread.getMessages()[0]; // 取每組 thread 的第一封信
    const subject = msg.getSubject();
    const address = msg.getFrom();

    // 統計主題（可用簡單分群）
    const keyword = extractKeyword(subject);
    subjects[keyword] = (subjects[keyword] || 0) + 1;

    // 統計 email domain
    const domain = extractDomain(address);
    domains[domain] = (domains[domain] || 0) + 1;
  }

  return [subjects, domains];
}

// 建立統計區塊
function getStatisticSession(title, statistics) {
  const section = CardService.newCardSection().setHeader(title);
  if (!statistics || Object.keys(statistics).length === 0) {
    section.addWidget(CardService.newTextParagraph()
      .setText('---  0 封'));
  } else {
    // 使用 for ... in 來遍歷 subjects 物件，並用 TextParagraph 顯示統計
    for (var k in statistics) {
      section.addWidget(CardService.newTextParagraph()
        .setText(k + " " + statistics[k] + " 封"));  // 顯示主題及其封數
    }
  }

  return section;
}

// 按鈕功能：統計當日信件分類
function todayStats(e) {
  // 使用 Cache
  let subjects = getCache("todaySubjects");
  let domains = getCache("todayDomains");
  let isCache = true;
  if (subjects === null) {
    const after = getDateFormat(new Date())
    const threads = getAllThreadsAdvanced({
        query: `in:anywhere after:${after}`,
        // query:'in:trash',
        batchSize: 50
      });
    if (threads.length === 0) {
      console.log("createNoEmailCard")
      return createNoEmailCard();  // 若沒有信件則顯示「無信件」訊息
    }
    [subjects, domains] = getClassify(threads);
    setCache('todaySubjects', subjects);
    setCache('todayDomains', domains);
    isCache = false;
  }

  // return createMainCard(subjects, domains);
  // 不直接回傳 card，使用 updateCard 方法直接換掉(不會有上一頁產生)
  var notificaText = '';
  if (isCache) {
    notificaText = '當日統計操作完成！ (cache)';
  } else {
    notificaText = '當日統計操作完成！';
  }
  var notification = CardService.newNotification()
     .setText(notificaText)
     .setType(CardService.NotificationType.INFO);
  var openLink = CardService.newOpenLink()
     .setUrl('https://www.google.com')
     .setOpenAs(CardService.OpenAs.FULL_SIZE);
  var navigation = CardService.newNavigation()
      .updateCard(createMainCard(subjects, domains));
  var actionResponse = CardService.newActionResponseBuilder()
      .setNotification(notification)
      // .setOpenLink(openLink) // 同時跳出新視窗
      .setStateChanged(true)  // 通知系統狀態有變化
      .setNavigation(navigation);
  return actionResponse.build();
}

// 按鈕功能：統計全部信件分類
function allStats(e) {
  // 使用 Cache
  let subjects = getCache("allSubjects");
  let domains = getCache("allDomains");
  let isCache = true;
  if (subjects === null) {
    const threads = getAllThreadsAdvanced({
          query: `in:anywhere`,
          batchSize: 100
        });
    if (threads.length === 0) {
      console.log("createNoEmailCard")
      return createNoEmailCard();  // 若沒有信件則顯示「無信件」訊息
    }
    [subjects, domains] = getClassify(threads);
    setCache('allSubjects', subjects);
    setCache('allDomains', domains);
    isCache = false;
  }

  // return createMainCard(subjects, domains);
  // 不直接回傳 card，使用 updateCard 方法直接換掉(不會有上一頁產生)
  var notificaText = '';
  if (isCache) {
    notificaText = '全部統計操作完成！ (cache)';
  } else {
    notificaText = '全部統計操作完成！';
  }
  var notification = CardService.newNotification()
     .setText(notificaText)
     .setType(CardService.NotificationType.INFO);
  var navigation = CardService.newNavigation()
      .updateCard(createMainCard(subjects, domains));
  var actionResponse = CardService.newActionResponseBuilder()
      .setNotification(notification)
      .setStateChanged(true)  // 通知系統狀態有變化
      .setNavigation(navigation);
  return actionResponse.build();
}