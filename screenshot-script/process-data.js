// this is just for testing really


const { groupBy } = require("lodash");

const rawData = require("../explorer/src/format-data.2022-04-27T00:00:00Z_2022-05-11T09:12:00Z.json");

const grouped = groupBy(
  rawData,
  (a) => `${a.format.design}${a.format.display}${a.format.theme}`
);

const firstTenExamples = Object.entries(grouped).map((examples) =>
  [...examples[1]]
    .sort((a, b) => (a.webUrl > b.webUrl ? 1 : -1))
    .slice(0, 10)
    .map((article) => article.webUrl.length > 200 ? article.webUrl.slice(article.webUrl.length - 100) : article.webUrl)
).flat();

console.log(firstTenExamples.length);

// rawData.forEach(entry => {
//     console.log(entry.webUrl)
// });
