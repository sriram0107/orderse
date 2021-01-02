const router = require("express").Router();

router.get("/", (req, res) => {
  res.send("convert api");
});

// router.post("/", (req, res) => {});
module.exports = router;
