const router = require("express").Router();
require("dotenv").config();
const LanguageTranslatorV3 = require("ibm-watson/language-translator/v3");
const { IamAuthenticator } = require("ibm-watson/auth");
const languageTranslator = new LanguageTranslatorV3({
  version: "2018-05-01",
  authenticator: new IamAuthenticator({
    apikey: process.env.WATSON_TRANSLATOR_CONFIG_APIKEY,
  }),
  serviceUrl: process.env.WATSON_TRANSLATOR_CONFIG_URL,
});

router.post("/:from/:to/", (req, res) => {
  const data = req.body;
  if (req.params.from === req.params.to) {
    res.status(200).json({ text: data.text });
  }
  const translateParams = {
    text: data.text,
    modelId: `${req.params.from}-${req.params.to}`,
  };

  languageTranslator
    .translate(translateParams)
    .then((translationResult) => {
      res
        .status(200)
        .json({ text: translationResult.result.translations[0].translation });
    })
    .catch((err) => {
      console.log("translation error", err);
    });
});

module.exports = router;
