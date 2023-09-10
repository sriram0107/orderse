const router = require("express").Router();
const { getOrderedFood } = require('../services/food_service')

router.post("/", (req, res) => {
  const data = req.body;
  res.status(200).json({
    text: data.text,
    dishes: getOrderedFood(data),
  });
});

module.exports = router;
