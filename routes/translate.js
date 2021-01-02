const router = require("express").Router();
const LanguageTranslatorV3 = require("ibm-watson/language-translator/v3");
const { watson_translator_config } = require("../watson");
const { IamAuthenticator } = require("ibm-watson/auth");

const langcode = {
  Tamil: "ta",
  English: "en",
  Spanish: "es",
  Hindi: "hi",
  Portuguese: "pt",
  French: "fr",
  Afrikaans: "af",
  Bosnian: "bs",
  Chinese: "zh",
  Croatian: "hr",
  Czech: "cs",
  Danish: "da",
  Dutch: "nl",
  Estonian: "et",
  German: "de",
  Hungarian: "hu",
  Norwegian: "no",
  Polish: "pl",
  Russian: "ru",
  Swedish: "sv",
};
router.get("/:from/:to", (req, res) => {
  const languageTranslator = new LanguageTranslatorV3({
    version: "2018-05-01",
    authenticator: new IamAuthenticator({
      apikey: watson_translator_config.apikey,
    }),
    serviceUrl: watson_translator_config.url,
  });

  const translateParams = {
    text: req.body.text,
    modelId: `${req.params.from}-${req.params.to}`,
  };

  languageTranslator
    .translate(translateParams)
    .then((translationResult) => {
      res.send(translationResult.result.translations[0].translation);
    })
    .catch((err) => {
      res.send("error:", err);
    });
});

module.exports = router;
