const router = require("express").Router();
const fs = require("fs");
const { IamAuthenticator } = require("ibm-watson/auth");
const SpeechToTextV1 = require("ibm-watson/speech-to-text/v1");
const { watson_speech_to_text_config } = require("../watson");
var multer = require("multer");
var upload = multer({ dest: "uploads/" });

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
  fs.open("./uploads/audio.wav", "w", function (err, fd) {
    if (err) {
      throw "could not open file: " + err;
    }
    var buffer = req.files[0].buffer;
    // write the contents of the buffer, from position 0 to the end, to the file descriptor returned in opening our file
    fs.write(fd, buffer, 0, buffer.length, null, function (err) {
      if (err) throw "error writing file: " + err;
      fs.close(fd, function () {
        console.log("wrote the file successfully");
        const recognizeStream = speechToText.recognizeUsingWebSocket(params);
        fs.createReadStream("./uploads/audio.wav").pipe(recognizeStream);
        recognizeStream.on("data", function (event) {
          onEvent("Data:", event);
        });
        recognizeStream.on("error", function (event) {
          onEvent("Error:", event);
        });
        recognizeStream.on("close", function (event) {
          onEvent("Close:", event);
        });
        function onEvent(name, event) {
          console.log(name, JSON.stringify(event, null, 2));
          res.send(name);
        }
      });
    });
  });
});

module.exports = router;
