const router = require("express").Router();
const fsp = require("fs-promise");
const { IamAuthenticator } = require("ibm-watson/auth");
const SpeechToTextV1 = require("ibm-watson/speech-to-text/v1");
const { watson_speech_to_text_config } = require("../watson");
const { langModels } = require("../languageModels");

const speechToText = new SpeechToTextV1({
  authenticator: new IamAuthenticator({
    apikey: watson_speech_to_text_config.apikey,
  }),
  serviceUrl: watson_speech_to_text_config.url,
});

router.post("/", async function (req, res) {
  const buffer = req.files[0].buffer; //Extract audio file as a hexadecimal buffer
  const translationModel = "en-US_BroadbandModel";
  const params = {
    objectMode: true,
    contentType: "audio/wav",
    model: translationModel,
  };
  var textData = null;
  const recognizeStream = speechToText.recognizeUsingWebSocket(params);
  recognizeStream.on("data", (event) => {
    onEvent("Data:", event);
  });
  recognizeStream.on("error", (event) => {
    onEvent("Error:", event);
  });
  recognizeStream.on("close", (event) => {
    onEvent("Close:", event);
  });
  const onEvent = (name, event) => {
    textData = event.results ? event.results[0].alternatives[0].transcript : "";
    console.log(textData);
  };

  try {
    const file = await fsp.open("./uploads/audio.wav", "w");
    await fsp.write(file, buffer, 0, buffer.length, null);
    await fsp.close(file);
    await fsp.createReadStream("./uploads/audio.wav").pipe(recognizeStream);
  } catch (err) {
    console.log("Error with reading the audio file", err);
  }
  res.send(textData);
});

module.exports = router;
