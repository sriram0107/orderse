const router = require("express").Router();

router.post("/:from/:to", (req, res) => {
  req.session.langSales = req.params.from;
  req.session.langCust = req.params.to;
  req.session.current = req.params.from;
  res.send("Session created!");
});

module.exports = router;
