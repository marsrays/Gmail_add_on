// 按鈕功能：將主題包含 "Fwd" 的信件設為星號
function markFwdAsStarred(e) {
  const fwdThreads = GmailApp.search('subject:Fwd');
  let count = 0;

  fwdThreads.forEach(thread => {
    const subject = thread.getFirstMessageSubject();
    if (subject && subject.includes("Fwd")) {
      // 直接取得最新訊息
      const messages = thread.getMessages();
      const latestMessage = messages[messages.length - 1];
      GmailApp.starMessage(latestMessage);
      count++;
    }
  });

  return createInfoCard(`已將 ${count} 封信件標為星號 ✅`);
}

// 按鈕功能：將所有星號信件取消
function removeFwdStars(e) {
  const threads = GmailApp.getStarredThreads();
  let count = 0
  threads.forEach(thread => {
    const subject = thread.getFirstMessageSubject();
    if (subject.includes("Fwd")){
      GmailApp.unstarMessages(thread.getMessages());
      count++;
    }
  });

  return createInfoCard(`已取消 ${count} 封信件的星號 🟡`);
}