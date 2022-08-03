import fs from "fs";
const cliProgress = require("cli-progress");
import puppeteer from "puppeteer";
import sharp from "sharp";

import { PageData, truncateUrl } from "./utils/screenshots";
import { firstTenExamplesPerFormat } from "./utils/process-data";
import { initialiseProgressBars } from "./utils/progress-bar";

const OUTPUT_ROOT =
  process.env.SCREENSHOT_OUTPUT_ROOT || "sync-test-screenshots";
const THUMBNAIL_WIDTH = parseInt(
  process.env.SCREENSHOT_THUMBNAIL_WIDTH || "400"
);

const urls = firstTenExamplesPerFormat
  .slice(500, 510)
  .map((url) => ({ url: url }));

const { progressBars, screenshotBar, thumbnailBar } = initialiseProgressBars(
  urls.length
);

async function captureScreenshots(pageData: PageData[]) {
  console.log("Capturing screenshots...");
  // make sure output dirs exist
  if (!fs.existsSync(`${OUTPUT_ROOT}/thumbnails/${THUMBNAIL_WIDTH}`)) {
    console.log("making dir...");
    fs.mkdirSync(`${OUTPUT_ROOT}/thumbnails/${THUMBNAIL_WIDTH}`, {
      recursive: true,
    });
  }
  // console.time("time elapsed");
  const browser = await puppeteer.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();

    page.setJavaScriptEnabled(false);

    await page.setViewport({ width: 1440, height: 1440 });

    for (const url of pageData) {
      const id = truncateUrl(url.url, 200, false);
      const filename = `${id.replaceAll("/", "-")}.webp`;

      if (
        !fs.existsSync(
          `${OUTPUT_ROOT}/thumbnails/${THUMBNAIL_WIDTH}/${filename}`
        )
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

        await page.goto(url.url);
        await page.screenshot({
          path: `${OUTPUT_ROOT}/${filename}`,
          type: "webp",
          quality: 1,
        });
        screenshotBar.increment();

        // resizing images locally
        sharp(`${OUTPUT_ROOT}/${filename}`)
          .resize({ width: THUMBNAIL_WIDTH })
          .toFile(`${OUTPUT_ROOT}/thumbnails/${THUMBNAIL_WIDTH}/${filename}`)
          .then(() => thumbnailBar.increment());
      }
    }
    // console.timeEnd("time elapsed");
  } catch (err: any) {
    // TODO !
    console.log(`Error: ${err.message}`);
  } finally {
    await browser.close();
    progressBars.stop();
    console.log(`Screenshots captured.`);
  }
}

captureScreenshots(urls);
