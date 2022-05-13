import fs from "fs";
import { chunk, zip } from "lodash";
import puppeteer from "puppeteer";

import {
  createBrowser,
  ScreenshotOptions,
  screenshotPathFactory,
  screenshotSettingsFactory,
  snap,
} from "./utils/screenshots";

import { firstTenExamplesPerFormat } from "./utils/process-data";

// TODO
import sharp from "sharp";

const OUTPUT_ROOT =
  process.env.SCREENSHOT_OUTPUT_ROOT || "async-test-screenshots";
const THUMBNAIL_WIDTH = parseInt(
  process.env.SCREENSHOT_THUMBNAIL_WIDTH || "400"
);
const POOL_COUNT = parseInt(process.env.PUPPETEER_POOL_COUNT || "5");

interface PageData {
  url: string;
  name?: string;
}


const urls = firstTenExamplesPerFormat
  .slice(280, 320)
  .map((url) => ({ url: url }));



async function run(): Promise<string[][]> {
  // config
  const outputDir = `${OUTPUT_ROOT}/screenshots`;
  const fileType = "webp";
  const screenshotSettings = screenshotSettingsFactory({
    type: fileType,
    quality: 1,
  });
  const screenshotPath = screenshotPathFactory(outputDir, fileType);

  // make sure output dirs exist
  if (!fs.existsSync(`${outputDir}/thumbnails/${THUMBNAIL_WIDTH}`)) {
    console.log("making dir...");
    fs.mkdirSync(`${outputDir}/thumbnails/${THUMBNAIL_WIDTH}`, {
      recursive: true,
    });
  }

  // batch urls, create puppeteer browser pool, assign batch to pool member
  const batchLength = Math.ceil(urls.length / POOL_COUNT);
  if (batchLength == 0) throw new Error("URL array is empty");
  const urlBatches = chunk(urls, batchLength);
  const puppeteerPool = await Promise.all(
    urlBatches.map((_) => createBrowser())
  );
  const batches = zip([...urlBatches], puppeteerPool).map(
    ([urlBatch, browserInstance]) => ({ urlBatch, browserInstance })
  );

  // take screenshots
  console.time("time elapsed");
  const outputPaths = await Promise.all(
    batches.map(({ urlBatch, browserInstance }) => {
      if (urlBatch && urlBatch.length > 0 && browserInstance) {
        // TODO how to narrow types earlier in the process?
        return Promise.all(
          urlBatch.map((url) =>
            snap(
              url,
              screenshotSettings({
                path: screenshotPath(url.url),
              }),
              browserInstance
            )
          )
        ).then((results) => {
          browserInstance.close();
          return results;
        });
      } else {
        return ["empty array"];
      }
    })
  );
  console.timeEnd("time elapsed");
  return outputPaths;
}

run().then((results) => console.table(results));
