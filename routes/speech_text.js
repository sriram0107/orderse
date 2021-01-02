const router = require("express").Router();
const fs = require("fs");
const { IamAuthenticator } = require("ibm-watson/auth");
const SpeechToTextV1 = require("ibm-watson/speech-to-text/v1");
const { watson_speech_to_text_config } = require("../watson");

router.post("/", (req, res) => {
  const speechToText = new SpeechToTextV1({
    authenticator: new IamAuthenticator({
      apikey: watson_speech_to_text_config.apikey,
    }),
    serviceUrl: watson_speech_to_text_config.url,
  });
  console.log(req.body);

  const params = {
    objectMode: true,
    contentType: "audio/flac",
    model: "en-US_BroadbandModel",
  };
  const recognizeStream = speechToText.recognizeUsingWebSocket(params);
  fs.createReadStream(req.body.url).pipe(recognizeStream);
  recognizeStream.on("data", function (event) {
    onEvent("Data:", event);
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
