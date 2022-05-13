const fs = require("fs");
const puppeteer = require("puppeteer");
const sharp = require("sharp");
const { groupBy } = require("lodash");

const rawData = require("../explorer/src/format-data.2022-04-27T00:00:00Z_2022-05-11T09:12:00Z.json");

const OUTPUT_ROOT = process.env.SCREENSHOT_OUTPUT_ROOT || "screenshots";
const THUMBNAIL_WIDTH = process.env.SCREENSHOT_THUMBNAIL_WIDTH || 400;

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

async function captureScreenshots() {
  // make sure output dirs exist
  if (!fs.existsSync(`${OUTPUT_ROOT}/thumbnails/${THUMBNAIL_WIDTH}`)) {
    fs.mkdirSync(`${OUTPUT_ROOT}/thumbnails/${THUMBNAIL_WIDTH}`, {
      recursive: true,
    });
  }

  const browser = await puppeteer.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();

    page.setJavaScriptEnabled(false);

    await page.setViewport({ width: 1440, height: 1440 });

    for (const url of firstTenExamplesPerFormat) {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const id =
        pathname.length > 200
          ? pathname.slice(pathname.length - 100)
          : pathname;
      const filename = `${id.replaceAll("/", "-")}.webp`;
      console.log(filename);

      if (
        !fs.existsSync(`${OUTPUT_ROOT}/thumbnails/${THUMBNAIL_WIDTH}/${filename}`)
      ) {
        // set cookie to remove ad banner space at top
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
          path: `${OUTPUT_ROOT}/${filename}`,
          type: "webp",
          quality: 1,
        });

        // resizing images locally
        sharp(`${OUTPUT_ROOT}/${filename}`)
          .resize({ width: THUMBNAIL_WIDTH })
          .toFile(`${OUTPUT_ROOT}/thumbnails/${THUMBNAIL_WIDTH}/${filename}`);
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
