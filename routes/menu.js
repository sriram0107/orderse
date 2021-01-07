const router = require("express").Router();
const { dishes, dishesId } = require("../config/dishes");

router.get("/:convo", (req, res) => {
  var ordered = [];
  for (const dish in dishesId) {
    if (req.params.convo.toLowerCase().includes(dish.toLowerCase())) {
      ordered.push(dishes[dishesId[dish]]);
    }
  }
  res.status(200).json({
    text: req.params.convo,
    dishes: ordered,
  });
});

// router.post("/", (req, res) => {});
module.exports = router;
