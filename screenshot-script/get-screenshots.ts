import fs from "fs";
import puppeteer from "puppeteer";
import sharp from "sharp";
import { groupBy } from "lodash";

import rawData from "../explorer/src/format-data.2022-04-27T00:00:00Z_2022-05-11T09:12:00Z.json";

type ArticleData = typeof rawData[number];

type GroupedArticleData = {
  [key: string]: ArticleData[];
};

interface PageData {
  url: string;
  name?: string;
}

const OUTPUT_ROOT = process.env.SCREENSHOT_OUTPUT_ROOT || "test-screenshots";
const THUMBNAIL_WIDTH = parseInt(
  process.env.SCREENSHOT_THUMBNAIL_WIDTH || "400"
);

const truncateUrl = (
  url: string,
  maxLength: number,
  pathOnly = true
): string => {
  const segmentToTruncate = pathOnly ? new URL(url).pathname : url;
  return segmentToTruncate.slice(0 - maxLength);
};

const urls = [
  { url: "https://www.google.com/" },
  { url: "https://www.theguardian.com" },
];

const groupedExamples: GroupedArticleData = groupBy(
  rawData,
  (a: ArticleData) => `${a.format.design}${a.format.display}${a.format.theme}`
);

const firstTenExamplesPerFormat = Object.values(groupedExamples)
  .map((examples: ArticleData[]) =>
    [...examples]
      .sort((a, b) => (a.webUrl > b.webUrl ? 1 : -1))
      .slice(0, 10)
      .map((article) => article.webUrl)
  )
  .flat();

async function captureScreenshots(pageData: PageData[]) {
  // make sure output dirs exist
  if (!fs.existsSync(`${OUTPUT_ROOT}/thumbnails/${THUMBNAIL_WIDTH}`)) {
    console.log("making dir...");
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

    for (const url of pageData) {
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
  } catch (err: any) {
    // TODO !
    console.log(`Error: ${err.message}`);
  } finally {
    await browser.close();
    console.log(`Screenshots captured.`);
  }
}

captureScreenshots(urls);
