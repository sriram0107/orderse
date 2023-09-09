const router = require("express").Router();
const fsp = require("fs-promise");
require('dotenv').config();

const { Readable } = require('stream');
const { IamAuthenticator } = require("ibm-watson/auth");
const SpeechToTextV1 = require("ibm-watson/speech-to-text/v1");
const { langModels } = require("../config/languageModels");
const fetch = require("node-fetch");
const { langcode } = require("../config/languages");
require("dotenv").config();
const BASE_URL = process.env.BASE_URL + process.env.PORT;

const speechToText = new SpeechToTextV1({
  authenticator: new IamAuthenticator({
    apikey: process.env.WATSON_SPEECH_TO_TEXT_CONFIG_APIKEY,
  }),
  serviceUrl: process.env.WATSON_SPEECH_TO_TEXT_CONFIG_URL,
});

router.post("/:lang/:to/:by", async function (req, res) {
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
    const dataBuffer = Buffer.from(buffer, 'hex');
    const bufferStream = Readable.from(dataBuffer);
    bufferStream.pipe(recognizeStream);
  } catch (err) {
    console.log("Error with reading the audio file", err);
  }
  const onEvent = async (name, event) => {
    try {
      textData =
        typeof event.results[0].alternatives[0].transcript != "undefined"
          ? event.results[0].alternatives[0].transcript
          : "";
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
