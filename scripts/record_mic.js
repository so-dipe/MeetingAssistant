// chrome.runtime.onMessage.addListener(async (message) => {
//     console.log('Message:', message)
//     if (message.type === 'start-recording') {
//         console.log('Recording started')
//         const devices = await navigator.mediaDevices.enumerateDevices();
//         console.log('Devices:', devices);

//         const mic = await navigator.mediaDevices.getUserMedia({
//             audio: {
//                 mandatory: {
//                     deviceId: { exact: devices[0].deviceId }
//                 }
//             }
//         });
//         chrome.runtime.sendMessage({
//             type: 'recording-mic'
//         })
//         const ws = new WebSocket('ws://localhost:8000/api/v1/transcribe/transcribe')

//         ws.addEventListener('open', () => {
//             console.log('WebSocket connection opened');
//         });

//         const audioTracks = mic.getAudioTracks();
//         console.log('Audio tracks:', audioTracks)

//         if (audioTracks.length > 0) {
//             const audioTrack = audioTracks[0];
//             console.log('Audio track:', audioTrack);
//             const recorder = new MediaRecorder(mic);
//             console.log('Recorder:', recorder);

//             recorder.onstart = () => {
//                 console.log('MediaRecorder started recording');
//             };
//             recorder.onstop = () => {
//                 console.log('MediaRecorder stopped recording');
//                 ws.close();
//             };
//             recorder.ondataavailable = (event) => {
//                 console.log('Data available:', event);
//                 if (event.data.size > 0) {
//                     console.log('Data available:', event.data);
//                     ws.send(event.data);
//                 }
//             };
//             const timeSlice = 5000;
//             recorder.start(timeSlice);
//         } else {
//             console.error('No audio tracks found');
//         };

//     }
// });
async function recordMic() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log('Devices:', devices);

        const mic = await navigator.mediaDevices.getUserMedia({
            audio: {
                mandatory: {
                    deviceId: { exact: devices[0].deviceId }
                }
            }
        });
        
        console.log("Mic:", mic.getAudioTracks());
        return mic;
    } catch (error) {
        console.error("Error recording mic:", error);
        throw error; // Rethrow the error to handle it in the caller function
    }
}

function sendMessage(message) {
    chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError.message);
        } else {
            console.log('Message sent successfully:', response);
        }
    });
}

function establishWebSocket() {
    const ws = new WebSocket('ws://localhost:8000/api/v1/transcribe/transcribe');
    ws.addEventListener('open', () => {
        console.log('WebSocket connection opened');
    });
    return ws;
}

async function startRecording() {
    try {
        const mic = await recordMic();
        // sendMessage({ type: 'recording-mic' });
        const ws = establishWebSocket();

        const audioTracks = mic.getAudioTracks();
        console.log('Audio tracks:', audioTracks);

        if (audioTracks.length > 0) {
            const audioTrack = audioTracks[0];
            console.log('Audio track:', audioTrack);
            const recorder = new MediaRecorder(mic);
            console.log('Recorder:', recorder);

            recorder.onstart = () => {
                console.log('MediaRecorder started recording');
            };
            recorder.onstop = () => {
                console.log('MediaRecorder stopped recording');
                ws.close();
            };
            recorder.ondataavailable = (event) => {
                console.log('Data available:', event);
                if (event.data.size > 0) {
                    console.log('Data available:', event.data);
                    ws.send(event.data);
                }
            };
            const timeSlice = 5000;
            recorder.start(timeSlice);
        } else {
            console.error('No audio tracks found');
        }
    } catch (error) {
        console.error("Error starting recording:", error);
    }
}

startRecording();


