const fs = require("fs");
const puppeteer = require("puppeteer");
const sharp = require("sharp");
const { groupBy } = require("lodash");

const rawData = require("../explorer/src/format-data.2022-04-27T00:00:00Z_2022-05-11T09:12:00Z.json");

const groupedExamples = groupBy(
  rawData,
  (a) => `${a.format.design}${a.format.display}${a.format.theme}`
);

const firstTenExamplesPerFormat = Object.entries(groupedExamples)
  .map((examples) =>
    [...examples[1]]
      .sort((a, b) => (a.webUrl > b.webUrl ? 1 : -1))
      .slice(0, 10)
      .map((article) => article.webUrl)
  )
  .flat();

const thumbnailWidth = 400;

async function captureScreenshots() {
  // make sure output dirs exist
  if (!fs.existsSync("screenshots")) {
    fs.mkdirSync("screenshots");
  }
  if (!fs.existsSync("screenshots/thumbnails")) {
    fs.mkdirSync("screenshots/thumbnails");
  }
  if (!fs.existsSync(`screenshots/thumbnails/${thumbnailWidth}`)) {
    fs.mkdirSync(`screenshots/thumbnails/${thumbnailWidth}`);
  }

  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();

    page.setJavaScriptEnabled(false);

    await page.setViewport({ width: 1440, height: 1440 });

    for (const url of firstTenExamplesPerFormat) {
      // console.log(url)
      // console.log("!!!!!!!!!!!!!")
      // set cookie to remove ad banner space at top
      const filename = `${encodeURIComponent(
        url.length > 200 ? url.slice(url.length - 100) : url
      )}.webp`;
      console.log(filename);
      if (!fs.existsSync(`screenshots/thumbnails/${thumbnailWidth}/${filename}`)) {
        console.log(filename)
        await page.setCookie({
          name: "GU_AF1",
          value: "true",
          domain: "www.theguardian.com",
          path: "/",
          httpOnly: false,
          secure: true,
        });

        await page.goto(url);
        await page.screenshot({
          path: `screenshots/${filename}`,
          type: "webp",
          quality: 1,
        });

        // resizing images locally
        sharp(`screenshots/${filename}`)
          .resize({ width: thumbnailWidth })
          .toFile(`screenshots/thumbnails/${thumbnailWidth}/${filename}`);
      }
    }
  } catch (err) {
    console.log(`Error: ${err.message}`);
  } finally {
    await browser.close();
    console.log(`Screenshots captured.`);
  }
}

captureScreenshots();
