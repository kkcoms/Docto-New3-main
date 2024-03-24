const WebSocket = require("ws");
const { createClient, LiveTranscriptionEvents } = require("@deepgram/sdk");

const deepgramClient = createClient("a20da2ba7bf9668fd4382e77ba212d7ac929f71a");


let keepAlive;
let wss;

export async function setupWebsocketServer() {
    if (wss) {    
      console.log('Socket is already running', wss);
    } else {
      try {
        console.log('creating socket server...');
        wss = new WebSocket.Server({ noServer: true })
        wss.on("connection", (ws) => {
          console.log("socket: client connected");
          let deepgram = setupDeepgram(ws);
        
          ws.on("message", (message) => {
            console.log("socket: client data received");
        
            if (deepgram.getReadyState() === 1 /* OPEN */) {
              console.log("socket: data sent to deepgram");
              deepgram.send(message);
            } else if (deepgram.getReadyState() >= 2 /* 2 = CLOSING, 3 = CLOSED */) {
              console.log("socket: data couldn't be sent to deepgram");
              console.log("socket: retrying connection to deepgram");
              /* Attempt to reopen the Deepgram connection */
              deepgram.finish();
              deepgram.removeAllListeners();
              deepgram = setupDeepgram(socket);
            } else {
              console.log("socket: data couldn't be sent to deepgram");
            }
          });
        
          ws.on("close", () => {
            console.log("socket: client disconnected");
            deepgram.finish();
            deepgram.removeAllListeners();
            deepgram = null;
          });
        });
      } catch (err) {
        console.error("Error in /api/speechToText:", err);
      }
    }
}
  
  const setupDeepgram = (ws) => {
    const deepgram = deepgramClient.listen.live({
      language: "en",
      punctuate: true,
      smart_format: true,
      diarize: true,
      multichannel: true,
      model: "nova",
    });
  
    if (keepAlive) clearInterval(keepAlive);
    keepAlive = setInterval(() => {
      console.log("deepgram: keepalive");
      deepgram.keepAlive();
    }, 10 * 1000);
  
    deepgram.addListener(LiveTranscriptionEvents.Open, async () => {
      console.log("deepgram: connected");
  
      deepgram.addListener(LiveTranscriptionEvents.Transcript, (data) => {
        console.log("deepgram: packet received");
        console.log("deepgram: transcript received");
        console.log("socket: transcript sent to client");
        console.log("result", JSON.stringify(data));
        ws.send(JSON.stringify(data));
      });
  
      deepgram.addListener(LiveTranscriptionEvents.Close, async () => {
        console.log("deepgram: disconnected");
        clearInterval(keepAlive);
        deepgram.finish();
      });
  
      deepgram.addListener(LiveTranscriptionEvents.Error, async (error) => {
        console.log("deepgram: error received");
        console.error(error);
      });
  
      deepgram.addListener(LiveTranscriptionEvents.Warning, async (warning) => {
        console.log("deepgram: warning received");
        console.warn(warning);
      });
  
      deepgram.addListener(LiveTranscriptionEvents.Metadata, (data) => {
        console.log("deepgram: packet received");
        console.log("deepgram: metadata received");
        console.log("ws: metadata sent to client");
        ws.send(JSON.stringify({ metadata: data }));
      });
    });
  
    return deepgram;
  };