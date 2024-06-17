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
  const url = `https://www.thaiorchid-karlsruhe.de/wochenkarte.html`;
  try {
    const result = await axios.get(url);
    const data = result.data;

    const $ = cheerio.load(data);

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
        dishes.push(food);
      });
    //console.log(dishes);

    //remove not needed information
    const modDishes = dishes.slice(4);
    //onsole.log(modDishes);

    //find indexOf element

    const targetFood = "Alle Gerichte auch zum Mitnehmen !!!";
    const index = modDishes.findIndex((food) => food === targetFood);

    if (index !== -1) {
      // console.log(`Found ${targetFood} at index ${index}`);
    } else {
      console.log(`${targetFood} not found`);
    }
    const modDishes2 = modDishes.slice(0, index);
    //console.log(modDishes2);

    const regDay = new RegExp("(Mittwoch)|(tag)");
    const regFood = new RegExp("(Paprika)|(verschiedenem)|(Basilikum)");
    const regRice = new RegExp("(Reis)");

    let weekDish = [];

    //merge elements of days to previous line, if regexes match
    for (let index = 0; index < modDishes2.length; index++) {
      if (regDay.test(modDishes2[index])) {
        weekDish[index] = modDishes2[index];
      } else if (regRice.test(modDishes2[index])) {
        weekDish[index - 1] += " " + modDishes2[index];
      } else {
        weekDish[index] = modDishes2[index];
      }
    }

    //removing empty elements:
    let weekDish2 = [];

    parseFood(weekDish, weekDish2);
    let weekDish3 = [];
    parseFood(weekDish2, weekDish3);
    //console.log(weekDish3);
    let weekDish4 = [];
    parseFood(weekDish3, weekDish4);

    const filteredArray = weekDish4.filter(
      (element) => element != null || element != undefined
    );
    filteredArray[0] = filteredArray[0].replace(/\s+/g, " ");

    //console.log(filteredArray);
    const regWeekDays =
      /(Montag:)|(Dienstag:)|(Mittwoch:)|(Donnerstag:)|(Freitag:)/gi;
    const trimmedArray = filteredArray.map((element) => {
      // Replace 'tag' or 'Mittwoch' with a space
      return element.replace(regWeekDays, "").trim();
    });

    // console.log(trimmedArray);

    function parseFood(foodArray, emptyArray) {
      for (let index = 0; index < foodArray.length; index++) {
        if (regDay.test(foodArray[index])) {
          emptyArray[index] = foodArray[index];
        } else if (regRice.test(foodArray[index])) {
          emptyArray[index - 1] += " " + foodArray[index];
        } else {
          emptyArray[index] = foodArray[index];
        }
      }
      return emptyArray;
    }

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

    const foodWeekOne = food.slice(0, 1);

    Object.keys(foodWeekOne[0].week).forEach((key, index) => {
      // Assign the corresponding value from the 'trimmedArray' array to each day
      foodWeekOne[0].week[key] = trimmedArray[index];
    });

    //console.log(foodWeekOne);
    res.json(foodWeekOne);
  } catch (error) {
    console.error(error);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
