const { IamAuthenticator } = require("ibm-watson/auth");
const SpeechToTextV1 = require("ibm-watson/speech-to-text/v1");
const { Readable } = require('stream');
require('dotenv').config();

const speechToTextService = new SpeechToTextV1({
    authenticator: new IamAuthenticator({
      apikey: process.env.WATSON_SPEECH_TO_TEXT_CONFIG_APIKEY,
    }),
    serviceUrl: process.env.WATSON_SPEECH_TO_TEXT_CONFIG_URL,
});

const speechToText = async (buffer, translationModel) => {
    return new Promise((resolve, reject) => {
        const params = {
            objectMode: true,
            contentType: "audio/wav",
            model: translationModel,
        };
    
        const recognizeStream = speechToTextService.recognizeUsingWebSocket(params);
        recognizeStream.on("data", (event) => {
            resolve(event)
        });
        recognizeStream.on("error", (event) => {
            reject(event)
        });
        recognizeStream.on("close", (event) => {
            reject(event)
        });
    
        const dataBuffer = Buffer.from(buffer, 'hex');
        const bufferStream = Readable.from(dataBuffer);
        bufferStream.pipe(recognizeStream);
    })
}

module.exports = { speechToText }
