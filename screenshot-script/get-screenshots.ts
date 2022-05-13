import fs from "fs";
import puppeteer from "puppeteer";

import { PageData, truncateUrl } from "./utils/screenshots";

import { firstTenExamplesPerFormat } from "./utils/process-data";
import sharp from "sharp";

const OUTPUT_ROOT =
  process.env.SCREENSHOT_OUTPUT_ROOT || "sync-test-screenshots";
const THUMBNAIL_WIDTH = parseInt(
  process.env.SCREENSHOT_THUMBNAIL_WIDTH || "400"
);

const urls = firstTenExamplesPerFormat
  .slice(160, 200)
  .map((url) => ({ url: url }));

async function captureScreenshots(pageData: PageData[]) {
  console.log("starting main function");
  // make sure output dirs exist
  if (!fs.existsSync(`${OUTPUT_ROOT}/thumbnails/${THUMBNAIL_WIDTH}`)) {
    console.log("making dir...");
    fs.mkdirSync(`${OUTPUT_ROOT}/thumbnails/${THUMBNAIL_WIDTH}`, {
      recursive: true,
    });
  }
  console.time("time elapsed");
  const browser = await puppeteer.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();

    page.setJavaScriptEnabled(false);

    await page.setViewport({ width: 1440, height: 1440 });

    for (const url of pageData) {
      console.log(`starting for ${url.url}`);
      const id = truncateUrl(url.url, 200, false);
      const filename = `${id.replaceAll("/", "-")}.webp`;
      console.log(filename);

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
        console.log(`taking screenshot for ${url.url}`);
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
    console.timeEnd("time elapsed");
  } catch (err: any) {
    // TODO !
    console.log(`Error: ${err.message}`);
  } finally {
    await browser.close();
    console.log(`Screenshots captured.`);
  }
}

captureScreenshots(urls);
