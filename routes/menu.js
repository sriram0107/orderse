const router = require("express").Router();

router.get("/", (req, res) => {
  res.send("menu");
});

// router.post("/", (req, res) => {});
module.exports = router;
