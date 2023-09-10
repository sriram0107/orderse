const router = require("express").Router();
require("dotenv").config();
const { translate } = require('../services/translate_service')

router.post("/:from/:to/", async (req, res) => {
  const data = req.body;
  const translatedText = await translate(data.text, req.params.from, req.params.to)
  res
    .status(200)
    .json({ text: translatedText });
});

module.exports = router;
