function getIDMessage(userName) {
    return {
        "text":`\u003c${userName}\u003e 您在 google chat 的使用者ID是 ${userName}`
    };
}

function getEchoMessage(userName, text) {
    return {
        "text":`\u003c${userName}\u003e 你刚刚是说：${text}`,
        "cards": [
            {
                "sections": [
                    {
                        "widgets": [
                            {
                                "buttons": [
                                    {
                                        "textButton": {
                                            "text": "确认",
                                            "onClick": {
                                                "action": {
                                                    "actionMethodName": "eventConfirmation",
                                                    "parameters": [
                                                        {
                                                            "key": "answer",
                                                            "value": "confirm"
                                                        },{
                                                            "key": "callbackFunction",
                                                            "value": "handleEventResponse"
                                                        },{
                                                            "key": "key",
                                                            "value": "event123"
                                                        }
                                                    ]
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "textButton": {
                                            "text": "取消",
                                            "onClick": {
                                                "action": {
                                                    "actionMethodName": "eventConfirmation",
                                                    "parameters":[
                                                        {
                                                            "key": "answer",
                                                            "value": "concel"
                                                        },{
                                                            "key": "callbackFunction",
                                                            "value": "handleEventResponse"
                                                        },{
                                                            "key": "key",
                                                            "value": "event123"
                                                        }
                                                    ]
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };
}

function getEmailAlertMessage() {
    return {
        text: `🚨 重要郵件通知`,
        cards: [{
            header: {
                title: "Gmail 每日檢查",
                subtitle: "關鍵字：緊急",
                imageUrl: "https://www.gstatic.com/images/branding/product/1x/gmail_48dp.png"
            },
            sections: [{
                header: `🚨 <font color=#FF0000><b>重要郵件通知</b></font>`,
                widgets: [{
                    keyValue: {
                        topLabel: "主旨",
                        content: '<font color=#fb4c2f>【緊急】有可疑訂單</font>',
                        contentMultiline: true
                    }
                }, {
                    keyValue: {
                        topLabel: "寄件人",
                        content: 'alert@test.com'
                    }
                }, {
                    keyValue: {
                        topLabel: "收件時間",
                        content: 'today'
                    }
                }, {
                    keyValue: {
                        topLabel: "內容預覽",
                        content: "用戶: qwerasdf 未完成支付...",
                        contentMultiline: true
                    }
                },{
                    textParagraph: {
                        text: '<font color=#FF0000>1</font><font color=#FF8800>2</font><font color=#FFFF00>3</font><font color=#00FF00>4</font><font color=#0088FF>5</font><font color=#4B0082>6</font><font color=#8800FF>7</font>'
                    }
                }, {
                    buttons: [{
                        textButton: {
                            text: "開啟 Gmail",
                            onClick: {
                                openLink: {
                                    url: "https://mail.google.com"
                                }
                            }
                        }
                    },{
                        textButton: {
                            text: "確認",
                            onClick: {
                                action: {
                                    actionMethodName: "eventConfirmation",
                                    parameters:[{
                                        key: "answer",
                                        value: "confirm"
                                    },{
                                        key: "callbackFunction",
                                        value: "handleEventResponse"
                                    },{
                                        key: "key",
                                        value: "event123"
                                    }]
                                }
                            }
                        }
                    },{
                        textButton: {
                            text: "取消",
                            onClick: {
                                action: {
                                    actionMethodName: "eventConfirmation",
                                    parameters:[{
                                        key: "answer",
                                        value: "cancel"
                                    },{
                                        key: "callbackFunction",
                                        value: "handleEventResponse"
                                    },{
                                        key: "key",
                                        value: "event123"
                                    }]
                                }
                            }
                        }
                    }]
                }]
            }]
        }]
    };
}