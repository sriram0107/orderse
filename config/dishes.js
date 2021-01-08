const dishes = [
  {
    id: 0,
    name: "burger",
    other: [],
    cost: "$5",
    picture: "photos/burger.jpg",
  },
  {
    id: 1,
    name: "french fries",
    other: ["fries", "potato fries"],
    cost: "$3",
    picture: "photos/fries.jpg",
  },
  {
    id: 2,
    name: "pizza",
    other: ["pan pizza"],
    cost: "$20",
    picture: "photos/food.jpg",
  },
  {
    id: 3,
    name: "ice cream",
    other: ["cream"],
    cost: "$1",
    picture: "photos/icecream.jpg",
  },
  {
    id: 4,
    name: "sandwich",
    other: ["bread"],
    cost: "$2",
    picture: "photos/sandwich.jpg",
  },
  {
    id: 5,
    name: "tea",
    other: [],
    cost: "$1",
    picture: "photos/tea.jpg",
  },
  {
    id: 6,
    name: "coffee",
    other: ["cafe", "caffeine", "latte", "espresso"],
    cost: "$1",
    picture: "photos/coffee.jpg",
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
