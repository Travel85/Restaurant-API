const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const apicache = require("apicache");

const app = express();

let cache = apicache.middleware;
const port = 3000;

app.use(cache("5 minutes"));

app.get("/", (req, res) => {
  res.send("API running.");
});

app.get("/week", async (req, res) => {
  res.send("API running.");

  const url = `https://www.thaiorchid-karlsruhe.de/wochenkarte.html`;
  try {
    const result = await axios.get(url);
    const data = result.data;
    //console.log(data);
    const $ = cheerio.load(data);

    //TODO: day is not exact yet, needs rework
    // const $day = $("span.fs14lh1-5:contains(':')").text();
    //console.log($day);

    //const dish = $("span.fs14lh1-5.ff2:contains(',')").text().trim();
    // console.log(dish);
    let reg = new RegExp("[a-zA-Z:]");
    function filterABC() {
      return reg.test($(this).text());
    }

    //get all dishes for each day
    const dishes = [];
    $("span.fs14lh1-5.ff2")
      .filter(filterABC)
      .each(function () {
        const food = $(this).text().trim();
        dishes.push({
          food,
        });
      });
    //console.log(dishes);

    //remove not needed information
    const modDishes = dishes.slice(4);
    // console.log(modDishes);

    //find indexOf element

    const targetFood = "Alle Gerichte auch zum Mitnehmen !!!";
    const index = modDishes.findIndex((food) => food.food === targetFood);

    if (index !== -1) {
      console.log(`Found ${targetFood} at index ${index}`);
    } else {
      console.log(`${targetFood} not found`);
    }
    const modDishes2 = modDishes.slice(0, index);
    console.log(modDishes2);

    //days of week
    const days = [
      {
        Montag: null,
        Dienstag: null,
        Mittwoch: null,
        Donnerstag: null,
        Freitag: null,
      },
    ];

    //parsing week dates
    const food = [];
    $("span.fs20lh1-5.cf2.ff2").each(function () {
      const weekDate = $(this).text();
      food.push({
        weekDate,
        week: {},
      });
    });

    //adding days to every week
    for (let index = 0; index < food.length; index++) {
      for (let z = 0; z < days.length; z++) {
        food[index].week = days[z];
      }
    }
    //console.log(food);
  } catch (error) {
    console.error(error);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
