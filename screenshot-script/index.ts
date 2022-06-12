import fs from "fs";
import path from "path";

import { chunk } from "lodash";
import sharp from "sharp";

import {
  createBrowser,
  screenshotPathFactory,
  screenshotSettingsFactory,
  snap,
} from "./utils/screenshots";
import { firstTenExamplesPerFormat } from "./utils/process-data";
import { initialiseProgressBars } from "./utils/progress-bar";

const OUTPUT_ROOT =
  process.env.SCREENSHOT_OUTPUT_ROOT || "async-test-screenshots";
const THUMBNAIL_WIDTH = parseInt(
  process.env.SCREENSHOT_THUMBNAIL_WIDTH || "400"
);
const MAX_POOL_COUNT = parseInt(process.env.PUPPETEER_POOL_COUNT || "5");

const urls = firstTenExamplesPerFormat
  .slice(100, 110)
  .map((url) => ({ url: url }));

// main function
async function run(): Promise<string[][]> {
  console.log("initialising..");

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

  // batch urls, create puppeteer browser pool, assign each batch to a pool member
  const batchLength = Math.ceil(urls.length / MAX_POOL_COUNT);
  if (batchLength == 0) throw new Error("URL array is empty");
  const urlBatches = chunk(urls, batchLength);
  console.log("batch length:", batchLength);
  console.log("batches:", urlBatches.length);
  // (sometimes urlBatches.length < MAX_POOL_COUNT; using a map here means that
  // we only get as many browser instances as we need.)
  const batches = await Promise.all(
    urlBatches.map(async (urlBatch) => ({
      urlBatch,
      browserInstance: await createBrowser(),
    }))
  );

  // take screenshots
  console.log("starting..");
  const { progressBars, screenshotBar, thumbnailBar } = initialiseProgressBars(
    urls.length
  );
  const outputPaths = await Promise.all(
    batches.map(async ({ urlBatch, browserInstance }) => {
      // TODO how to narrow types earlier in the process? (Presumably in the
      // initial construction of the pool/batches, above?)
      if (urlBatch.length === 0) return ["empty array"];
      // Using Promise.all() because we're inside a map(), but
      // are there any good alternatives here?
      const resultPromises: Promise<string>[] = urlBatch.map(async (url) => {
        const screenshotFilepath = await snap(
          url.url,
          screenshotSettings({
            path: screenshotPath(url.url),
          }),
          browserInstance
        );
        screenshotBar.increment();
        // resizing images locally
        const screenshotFilename = path.parse(screenshotFilepath).base;
        await sharp(screenshotFilepath)
          .resize({ width: THUMBNAIL_WIDTH })
          .toFile(
            `${outputDir}/thumbnails/${THUMBNAIL_WIDTH}/${screenshotFilename}`
          );
        thumbnailBar.increment();
        return screenshotFilename;
      });
      const results = await Promise.all(resultPromises);
      browserInstance.close();
      return results;
    })
  );
  progressBars.stop();

  return outputPaths;
}

run().then((results) => console.group(results));
