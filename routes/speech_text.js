const router = require("express").Router();
const fs = require("fs");
const { IamAuthenticator } = require("ibm-watson/auth");
const SpeechToTextV1 = require("ibm-watson/speech-to-text/v1");
const { watson_speech_to_text_config } = require("../watson");

router.post("/", async function (req, res) {
  const speechToText = new SpeechToTextV1({
    authenticator: new IamAuthenticator({
      apikey: watson_speech_to_text_config.apikey,
    }),
    serviceUrl: watson_speech_to_text_config.url,
  });
  const params = {
    objectMode: true,
    contentType: "audio/wav",
    model: "en-US_BroadbandModel",
  };
  const recognizeStream = speechToText.recognizeUsingWebSocket(params);
  fs.createReadStream(req.body.data).pipe(recognizeStream);

  recognizeStream.on("data", function (event) {
    onEvent("Data:", event);
  });
  recognizeStream.on("error", function (event) {
    onEvent("Error:", event);
  });
  recognizeStream.on("close", function (event) {
    onEvent("Close:", event);
  });

  // Display events on the console.
  function onEvent(name, event) {
    console.log(name, JSON.stringify(event, null, 2));
  }

  // const recognizeStream = speechToText.recognizeUsingWebSocket(params);
  // fs.createReadStream("./co.wav").pipe(recognizeStream);
  // // file
  // //   .arrayBuffer()
  // //   .then((buf) => arrayBufferToBuffer(buf))
  // //   .then((buf) => fs.createReadStream(buf).pipe(recognizeStream))
  // //   .catch((err) => console.log(err));
  // recognizeStream.on("data", function (event) {
  //   onEvent("Data:", event.results[0].alternatives[0].transcript);
  // });
  // recognizeStream.on("error", function (event) {
  //   onEvent("Error:", event);
  //   res.send(event);
  // });
  // recognizeStream.on("close", function (event) {
  //   onEvent("Close:", event);
  // });

  // function onEvent(name, event) {
  //   console.log(name, JSON.stringify(event, null, 2));
  // }
});

module.exports = router;
