const stopMeetingBtn = document.getElementById('stopMeetingBtn')
const recordingStatus = document.getElementById('recordingStatus');
const meetingBtn = document.getElementById('meetingBtn');

stopMeetingBtn.addEventListener('click', async function() {
    chrome.runtime.sendMessage({
        type: 'stop-recording',
    })
});

meetingBtn.addEventListener('click', async function() {
    chrome.tabCapture.capture({
        audio: true,
    }, (stream) => {
        console.log("stream", stream)
        const audioTracks = stream.getAudioTracks();
        console.log('Audio tracks:', audioTracks)
    })
});

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'start-recording') {
        console.log('Recording started')
        const tabInfo = message.tabInfo;
        stopMeetingBtn.disabled = false;
        if (tabInfo) {
            recordingStatus.textContent = `Recording tab: ${tabInfo.title}`;
        } else {
            recordingStatus.textContent = 'Recording...';
        }
    } else if (message.type === 'recording-stopped') {
        console.log('Recording stopped')
        recordingStatus.textContent = 'Not capturing any tab, click the extension icon to start capturing a tab.';
        stopMeetingBtn.disabled = true;
    }
});
