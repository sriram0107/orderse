const router = require("express").Router();
const { dishes } = require("../config/dishes");

router.get("/:convo", (req, res) => {
  //extract menu items from req.params.convo
  const words = req.params.convo.split(" "); // separates the words for parsing dishes;
  res.send(getDishes(words));
});

const getDishes = (txt) => {
  var result = [];
  return {
    text: txt,
    dishes: result,
  };
};
// router.post("/", (req, res) => {});
module.exports = router;
