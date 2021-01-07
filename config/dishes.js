const dishes = [
  {
    id: 0,
    name: "burger",
    other: [],
    cost: 5,
    picture: "./pictures/food.jpg",
  },
  {
    id: 1,
    name: "french fries",
    other: ["fries", "potato fries"],
    cost: 3,
    picture: "./pictures/food.jpg",
  },
  {
    id: 2,
    name: "pizza",
    other: ["pan pizza"],
    cost: 20,
    picture: "./pictures/food.jpg",
  },
  {
    id: 3,
    name: "ice cream",
    other: ["cream"],
    cost: 1,
    picture: "./pictures/food.jpg",
  },
  {
    id: 4,
    name: "sandwich",
    other: ["bread"],
    cost: 2,
    picture: "./pictures/food.jpg",
  },
  {
    id: 5,
    name: "tea",
    other: [],
    cost: 1,
    picture: "./pictures/food.jpg",
  },
  {
    id: 6,
    name: "coffee",
    other: ["cafe", "caffeine", "latte", "espresso"],
    cost: 1,
    picture: "./pictures/food.jpg",
  },
];

var dishesId = {};
dishes.forEach((dish) => {
  dishesId[dish.name] = dish.id;
  dish.other.forEach((altname) => {
    dishesId[altname] = dish.id;
  });
});

module.exports = { dishes, dishesId };
