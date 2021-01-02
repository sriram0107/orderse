const router = require("express").Router();
const LanguageTranslatorV3 = require("ibm-watson/language-translator/v3");
const { watson_translator_config } = require("../watson");
const { IamAuthenticator } = require("ibm-watson/auth");

router.get("/:from/:to/:text", (req, res) => {
  if (req.params.from === req.params.to) {
    res.status(200).send(req.params.text);
  }
  const languageTranslator = new LanguageTranslatorV3({
    version: "2018-05-01",
    authenticator: new IamAuthenticator({
      apikey: watson_translator_config.apikey,
    }),
    serviceUrl: watson_translator_config.url,
  });

  const translateParams = {
    text: req.params.text,
    modelId: `${req.params.from}-${req.params.to}`,
  };

  languageTranslator
    .translate(translateParams)
    .then((translationResult) => {
      res
        .status(200)
        .send(translationResult.result.translations[0].translation);
    })
    .catch((err) => {
      res.status(200).send(err);
    });
});

module.exports = router;

/*
todos

Request Workflow
1. If same language no translation
2. When salesperson talks 
    -> Record
    -> Extract food details if any
    -> Convert to language of choice
    -> Display
3. When customer talks
   ->Record
   ->Trnslate
   ->Extract
   ->Display
*/
