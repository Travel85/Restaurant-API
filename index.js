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
    let reg = new RegExp("[a-zA-Z0-9,:]");
    function filterABC() {
      return reg.test($(this).text());
    }

    const dishes = [];
    $("div.imTALeft > span.fs14lh1-5")
      .filter(filterABC)
      .each(function () {
        const food = $(this).text().trim();
        dishes.push({
          food,
        });
      });
    // console.log(dishes);

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
    console.log(food);
  } catch (error) {
    console.error(error);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
