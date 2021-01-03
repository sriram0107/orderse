const router = require("express").Router();
const fs = require("fs");
const { IamAuthenticator } = require("ibm-watson/auth");
const SpeechToTextV1 = require("ibm-watson/speech-to-text/v1");
const { watson_speech_to_text_config } = require("../watson");
const fetch = require("node-fetch");
var arrayBufferToBuffer = require("arraybuffer-to-buffer");

router.post("/", async function (req, res) {
  const speechToText = new SpeechToTextV1({
    authenticator: new IamAuthenticator({
      apikey: watson_speech_to_text_config.apikey,
    }),
    serviceUrl: watson_speech_to_text_config.url,
  });

  const params = {
    objectMode: true,
    contentType: "audio/mpeg3",
    model: "en-US_BroadbandModel",
  };
  const recognizeStream = speechToText.recognizeUsingWebSocket(params);
  fs.createReadStream("./co.mp3").pipe(recognizeStream);
  // file
  //   .arrayBuffer()
  //   .then((buf) => arrayBufferToBuffer(buf))
  //   .then((buf) => fs.createReadStream(buf).pipe(recognizeStream))
  //   .catch((err) => console.log(err));
  recognizeStream.on("data", function (event) {
    onEvent("Data:", event.results[0].alternatives[0].transcript);
  });
  recognizeStream.on("error", function (event) {
    onEvent("Error:", event);
    res.send(event);
  });
  recognizeStream.on("close", function (event) {
    onEvent("Close:", event);
  });

  function onEvent(name, event) {
    console.log(name, JSON.stringify(event, null, 2));
  }
});

module.exports = router;
