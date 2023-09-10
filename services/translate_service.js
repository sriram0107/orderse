const LanguageTranslatorV3 = require("ibm-watson/language-translator/v3");
const { IamAuthenticator } = require("ibm-watson/auth");
const languageTranslator = new LanguageTranslatorV3({
  version: "2018-05-01",
  authenticator: new IamAuthenticator({
    apikey: process.env.WATSON_TRANSLATOR_CONFIG_APIKEY,
  }),
  serviceUrl: process.env.WATSON_TRANSLATOR_CONFIG_URL,
});

const translate = async (text, from, to) => {
    if (from === to) {
        return text
    }
    const translateParams = {
        text: text,
        modelId: `${from}-${to}`,
    }
      
    try {
      const translationResult = await languageTranslator.translate(translateParams)
      return translationResult?.result?.translations[0].translation
    } catch (err) {
      console.log("translation error", err)
    }
}

module.exports = { translate }