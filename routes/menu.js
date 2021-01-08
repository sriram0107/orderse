const router = require("express").Router();
const { dishes, dishesId } = require("../config/dishes");

router.post("/", (req, res) => {
  console.log(req.body);
  const data = req.body;
  var ordered = [];
  var taken = [];
  for (const dish in dishesId) {
    if (
      data.text.toLowerCase().includes(dish.toLowerCase()) &&
      !taken.includes(dishesId[dish])
    ) {
      ordered.push(dishes[dishesId[dish]]);
      taken.push(dishesId[dish]);
    }
  }
  res.status(200).json({
    text: data.text,
    dishes: ordered,
  });
});

module.exports = router;
