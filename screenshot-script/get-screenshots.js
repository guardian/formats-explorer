const fs = require("fs");
const puppeteer = require("puppeteer");
const sharp = require('sharp');

const urls = [
  "https://www.theguardian.com/world/2022/may/10/hopes-raised-for-eu-oil-ban-on-russia-despite-hungary-comparing-plan-to-nuclear-bomb",
  "https://www.theguardian.com/society/2022/may/10/bill-banning-conversion-practices-england-wales-under-18s",
  "https://www.theguardian.com/business/2022/may/10/grant-shapps-law-seafarers-minimum-wage-queens-speech",
];

const thumbnailWidth = 400

async function captureScreenshots() {
  // make sure output dirs exist
  if (!fs.existsSync("screenshots")) {
    fs.mkdirSync("screenshots");
  }
  if (!fs.existsSync("screenshots/thumbnails")) {
    fs.mkdirSync("screenshots/thumbnails");
  }

  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();

    page.setJavaScriptEnabled(false);

    await page.setViewport({ width: 1440, height: 1440 });

    for (const url of urls) {
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
        path: `screenshots/${encodeURIComponent(url)}.webp`,
        type: "webp",
        quality: 1,
      });

      // resizing images locally
      sharp(`screenshots/${encodeURIComponent(url)}.webp`)
        .resize({ width: thumbnailWidth })
        .toFile(`screenshots/thumbnails/${encodeURIComponent(url)}-${thumbnailWidth}.webp`)
    }
  } catch (err) {
    console.log(`Error: ${err.message}`);
  } finally {
    await browser.close();
    console.log(`Screenshots captured.`);
  }
}

captureScreenshots();
