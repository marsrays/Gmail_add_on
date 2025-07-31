/**
 * 從 Gmail 附件中擷取圖片 → 轉成 Base64 → 傳送給 Google Vision API → 做圖片辨識
 */
function analyzeGmailImageOCR() {
  //const threads = GmailApp.search('has:attachment newer_than:1d');
  const threads = GmailApp.search('has:attachment', 0, 10);

  for (const thread of threads) {
    Logger.log(`🔍郵件名稱：${thread.getFirstMessageSubject()}`);
    const messages = thread.getMessages();
    const latestMessage = messages[messages.length - 1];
    const attachments = latestMessage.getAttachments();
    for (const file of attachments) {
      if (isImageMimeType(file.getContentType())) {
        const base64Img = Utilities.base64Encode(file.getBytes());
        // const text = 'Not implement';
        const text = callVisionOCR(base64Img);

        Logger.log(`📸 圖片名稱：${file.getName()} 圖片大小:${file.getBytes().length} Bytes`);
        Logger.log(`📝 OCR 辨識結果：\n${text}`);
      } else {
        Logger.log(`📝 不是圖檔，名稱：${file.getName()} 檔案大小:${file.getBytes().length} Bytes`);
      }
    }

    // 一般回覆信會重複內容，包含圖檔，所以 loop 跑會浪費算力在重複圖上
    // for (const message of thread.getMessages()) {
    // }
  }
}

function isImageMimeType(mimeType) {
  return [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/bmp',
    'image/webp',
    'image/svg+xml'
  ].includes(mimeType);
}