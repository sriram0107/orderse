const router = require("express").Router();
const fsp = require("fs-promise");
const { IamAuthenticator } = require("ibm-watson/auth");
const SpeechToTextV1 = require("ibm-watson/speech-to-text/v1");
const { watson_speech_to_text_config } = require("../config/watson");
const { langModels } = require("../config/languageModels");
const fetch = require("node-fetch");
const { langcode } = require("../config/languages");
require("dotenv").config();
const BASE_URL = process.env.BASE_URL;

const speechToText = new SpeechToTextV1({
  authenticator: new IamAuthenticator({
    apikey: watson_speech_to_text_config.apikey,
  }),
  serviceUrl: watson_speech_to_text_config.url,
});

router.post("/:lang/:to/:by", async function (req, res) {
  /*
    req.params.lang - Language received from the audio file
    req.params.to - Language to be converted to
    req.params.by - Can be either staff or cust 
  */

  console.log("converting from", req.params.lang, "to", req.params.to);
  const buffer = req.files[0].buffer; //Extract audio file as a hexadecimal buffer
  const translationModel = langModels[req.params.lang];
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
    console.log("speech to text model error", event);
  });
  recognizeStream.on("close", (event) => {
    console.log("speech to text model closed");
  });

  try {
    const file = await fsp.open("./uploads/audio.wav", "w");
    await fsp.write(file, buffer, 0, buffer.length, null);
    await fsp.close(file);
    await fsp.createReadStream("./uploads/audio.wav").pipe(recognizeStream);
  } catch (err) {
    console.log("Error with reading the audio file", err);
  }
  const onEvent = async (name, event) => {
    try {
      textData =
        typeof event.results[0].alternatives[0].transcript != "undefined"
          ? event.results[0].alternatives[0].transcript
          : "";
      console.log(textData);
      req.params.by === "cust"
        ? handleCustomer(textData)
        : handleSales(textData);
    } catch (err) {
      res
        .status(400)
        .json({ text: "Could not recognize your voice", dishes: [] });
    }
  };

  const handleCustomer = async (txt) => {
    try {
      const translatedTextData = await fetch(
        BASE_URL +
          `/translate/${langcode[req.params.lang]}/${langcode[req.params.to]}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: txt,
          }),
        }
      );
      const translatedText = await translatedTextData.json();
      console.log("here", translatedText);
      const resultData = await fetch(BASE_URL + `/menu`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: translatedText.text,
        }),
      });
      const result = await resultData.json();
      res.status(200).json(result);
    } catch (err) {
      console.log("Error in translation handlecust", err);
    }
  };
  const handleSales = async (txt) => {
    try {
      const resultdata = await fetch(BASE_URL + `/menu`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: txt,
        }),
      });
      const result = await resultdata.json();
      const translatedTextData = await fetch(
        BASE_URL +
          `/translate/${langcode[req.params.lang]}/${langcode[req.params.to]}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: txt,
          }),
        }
      );
      const translatedText = await translatedTextData.json();
      result.text = translatedText.text;
      res.status(200).json(result);
    } catch (err) {
      console.log("Error in translation handlesales", err);
    }
  };
});

module.exports = router;
