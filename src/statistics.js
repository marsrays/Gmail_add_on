// 用關鍵詞擷取主題分類（可依需求擴展為 NLP）
function extractKeyword(subject) {
  if (subject.match(/数据库|database/i)) return "数据库";
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

  for (var i in threads) {
    const thread = threads[i];
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

  // 使用 for ... in 來遍歷 subjects 物件，並用 TextParagraph 顯示統計
  for (var k in statistics) {
    section.addWidget(CardService.newTextParagraph()
        .setText(k + " " + statistics[k] + " 封"));  // 顯示主題及其封數
  }

  return section;
}

// 按鈕功能：統計當日信件分類
function todayStats(e) {
  const after = getDateFormat(new Date())
  const threads = getAllThreadsAdvanced({
      query: `in:anywhere after:${after}`,
      batchSize: 50
    });

  const [subjects, domains] = getClassify(threads);

  const card = CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader().setTitle('📝 當日統計'));
  card.addSection(getStatisticSession("📊 主題分類統計", subjects));
  card.addSection(getStatisticSession("👥 寄件人群組統計", domains));

  return card.build();
}