const router = require("express").Router();
const { speechToText } = require('../services/speech_to_text_service');
const { translate } = require('../services/translate_service')
const { getOrderedFood } = require('../services/food_service')
const { langModels } = require("../config/languageModels");
const { langcode } = require("../config/languages");
require("dotenv").config();


router.post("/:lang/:to", async function (req, res) {
  try {
    const buffer = req.files[0].buffer; //Extract audio file as a hexadecimal buffer
    const translationModel = langModels[req.params.lang];
    const event = await speechToText(buffer, translationModel)
    const textData = typeof event.results[0].alternatives[0].transcript != "undefined"
        ? event.results[0].alternatives[0].transcript
        : ""
    const translatedText = await translate(textData, langcode[req.params.lang], langcode[req.params.to])
    const defaultTranslatedText = await translate(textData, langcode[req.params.lang], langcode[process.env.BASE_LANGUAGE_CODE] || "en")
    const dishes = await getOrderedFood({ text: defaultTranslatedText })
    res.status(200).json({ text: translatedText, dishes: dishes })
  } catch (err) {
    res.status(400).json({ text: "Could not recognize your voice", dishes: [] })
  }
});

module.exports = router;
