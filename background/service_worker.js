chrome.sidePanel
    .setPanelBehavior({openPanelOnActionClick : false})
    .catch((error) => console.error(error));

let capturing = false;

chrome.action.onClicked.addListener(async (tab) => {
    chrome.sidePanel.open({windowId: tab.windowId});
    if (capturing) {
        console.log('Audio is already being captured')
        return;
    }
    console.log('Clicked')
    const existingContexts = await chrome.runtime.getContexts({});
    
    const offScreenDocument = existingContexts.find(
        (context) => context.contextType === 'OFFSCREEN_DOCUMENT'
    );

    if (!offScreenDocument) {
        await chrome.offscreen.createDocument({
            url: './offscreen/record.html',
            reasons: ['USER_MEDIA'],
            justification: 'I want to record from chrome.tabCapture API'
        });
    }

    const streamId = await chrome.tabCapture.getMediaStreamId({
        targetTabId: tab.id
    });

    chrome.runtime.sendMessage({
        type: 'start-recording',
        target: 'offscreen',
        data: streamId,
        tabInfo: tab
    });
    capturing = true;
});

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'stop-recording') {
        capturing = false;
        chrome.runtime.sendMessage({
            type: 'stop-recording',
            target: 'offscreen',
        });
    }
});


