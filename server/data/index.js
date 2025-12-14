const herbs = require("./herbs.json");
const vegetables = require("./vegetables.json");
const fruits = require("./fruits.json");
const indoorPlants = require("./indoor_plants.json");
const outdoorPlants = require("./outdoor_plants.json");
const flowers = require("./flowers.json");

// FULL CATALOG (100+ plants)
const FULL_CATALOG = [
  ...herbs,
  ...vegetables,
  ...fruits,
  ...indoorPlants,
  ...outdoorPlants,
  ...flowers
];

// Category map (future use)
const CATEGORY_MAP = {
  herbs,
  vegetables,
  fruits,
  indoor: indoorPlants,
  outdoor: outdoorPlants,
  flowers
};

module.exports = {
  FULL_CATALOG,
  CATEGORY_MAP
};
