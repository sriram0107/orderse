const { dishes, dishesId } = require("../config/dishes");

const getOrderedFood = (data) => {
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
    return ordered
}

module.exports = { getOrderedFood }