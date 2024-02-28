let media;

chrome.runtime.onMessage.addListener(async (message) => {
    if (message.target !== 'offscreen') return;

    if (message.type === 'start-recording') {
        media = await navigator.mediaDevices.getUserMedia({
            audio : {
                mandatory: {
                    chromeMediaSource: 'tab',
                    chromeMediaSourceId: message.data
                },
            },
            video: false
        });

        const ws = new WebSocket('ws://localhost:8000/api/v1/transcribe/transcribe')

        ws.addEventListener('open', () => {
            console.log('WebSocket connection opened');
        });

        const audioTracks = media.getAudioTracks();
        console.log('Audio tracks:', audioTracks)

        if (audioTracks.length > 0) {
            const audioTrack = audioTracks[0];
            console.log('Audio track:', audioTrack);
            const recorder = new MediaRecorder(media);
            console.log('Recorder:', recorder);

            recorder.onstart = () => {
                console.log('MediaRecorder started recording');
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
        };

        const output = new AudioContext();
        const source = output.createMediaStreamSource(media);
        source.connect(output.destination);

    } else if (message.type === 'stop-recording') {
        tracks = media.getTracks();
        tracks.forEach((track) => {
            track.stop();
        });
        chrome.runtime.sendMessage({
            type: 'recording-stopped'
        });
    }
});


