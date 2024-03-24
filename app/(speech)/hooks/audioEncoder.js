const libmp3lame = require('libmp3lame.js');

function encodeAudioToMP3(audioBlob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const audioData = reader.result;
            console.log('Audio data loaded');
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContext.decodeAudioData(audioData, (buffer) => {
                console.log('Audio decoded');
                const samples = new Float32Array(buffer.length);
                const channelData = buffer.getChannelData(0);
                for (let i = 0; i < buffer.length; i++) {
                    samples[i] = channelData[i];
                }

                const mp3Encoder = new libmp3lame.Lame({
                    output: 'buffer',
                    bitrate: 128,
                    sampleRate: buffer.sampleRate,
                    channels: 1,
                });
                
                mp3Encoder.encode(samples);
                console.log('Audio encoded to MP3');
                const mp3Data = mp3Encoder.finish();

                const mp3Blob = new Blob([mp3Data], { type: 'audio/mp3' });
                const reader2 = new FileReader();
                reader2.onloadend = () => {
                    console.log('MP3 data loaded');
                    resolve(reader2.result);
                };
                reader2.onerror = reject;
                reader2.readAsArrayBuffer(mp3Blob);
            }, reject);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(audioBlob);
    });
}

module.exports = {
    encodeAudioToMP3,
};