const router = require("express").Router();
const { dishes, dishesId } = require("../config/dishes");
// avoid duplication
router.get("/:convo", (req, res) => {
  var ordered = [];
  var taken = [];
  for (const dish in dishesId) {
    if (
      req.params.convo.toLowerCase().includes(dish.toLowerCase()) &&
      !taken.includes(dishesId[dish])
    ) {
      ordered.push(dishes[dishesId[dish]]);
      taken.push(dishesId[dish]);
    }
  }
  res.status(200).json({
    text: req.params.convo,
    dishes: ordered,
  });
});

module.exports = router;
