const router = require("express").Router();
const fs = require("fs");
const { IamAuthenticator } = require("ibm-watson/auth");
const SpeechToTextV1 = require("ibm-watson/speech-to-text/v1");
const { watson_speech_to_text_config } = require("../watson");
const fetch = require("node-fetch");
var toBuffer = require("blob-to-buffer");

router.post("/", async function (req, res) {
  const speechToText = new SpeechToTextV1({
    authenticator: new IamAuthenticator({
      apikey: watson_speech_to_text_config.apikey,
    }),
    serviceUrl: watson_speech_to_text_config.url,
  });

  const params = {
    objectMode: true,
    contentType: "audio/flac",
    model: "en-US_BroadbandModel",
  };
  const recognizeStream = speechToText.recognizeUsingWebSocket(params);
  let file = await fetch(req.body.data)
    .then((r) => r.blob())
    .catch((err) => console.log("api :", err));
  console.log("file -", file);
  toBuffer(file, function (err, buffer) {
    if (err) throw err;
    fs.createReadStream(blob).pipe(recognizeStream);
  });

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
