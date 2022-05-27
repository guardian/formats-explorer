import fs from "fs";
import path from "path";

const cliProgress = require("cli-progress");
import { chunk, zip } from "lodash";
import sharp from "sharp";

import {
  createBrowser,
  ScreenshotOptions,
  screenshotPathFactory,
  screenshotSettingsFactory,
  snap,
} from "./utils/screenshots";
import { firstTenExamplesPerFormat } from "./utils/process-data";


const OUTPUT_ROOT =
  process.env.SCREENSHOT_OUTPUT_ROOT || "async-test-screenshots";
const THUMBNAIL_WIDTH = parseInt(
  process.env.SCREENSHOT_THUMBNAIL_WIDTH || "400"
);
const MAX_POOL_COUNT = parseInt(process.env.PUPPETEER_POOL_COUNT || "5");

const urls = firstTenExamplesPerFormat
  .slice(480, 500)
  .map((url) => ({ url: url }));

// progress bars setup start
const progressBars = new cliProgress.MultiBar(
  {
    clearOnComplete: false,
    hideCursor: true,
  },
  cliProgress.Presets.shades_grey
);
const screenshotBar = progressBars.create(urls.length, 0, {
  format: "taking screenshots [{bar}] {percentage}% | {value}/{total}",
});
const thumbnailBar = progressBars.create(urls.length, 0, {
  format: "resizing screenshots [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}",
});
// progress bars setup end

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

  // batch urls, create puppeteer browser pool, assign each batch to a pool member
  const batchLength = Math.ceil(urls.length / MAX_POOL_COUNT);
  if (batchLength == 0) throw new Error("URL array is empty");
  const urlBatches = chunk(urls, batchLength);
  // (sometimes urlBatches.length < MAX_POOL_COUNT; using a map here means that
  // we only get as many browser instances as we need.)
  const puppeteerPool = await Promise.all(
    urlBatches.map((_) => createBrowser())
  );
  const batches = zip([...urlBatches], puppeteerPool).map(
    ([urlBatch, browserInstance]) => ({ urlBatch, browserInstance })
  );

  // take screenshots
  const outputPaths = await Promise.all(
    batches.map(({ urlBatch, browserInstance }) => {
      // TODO how to narrow types earlier in the process? (Presumably in the
      // initial construction of the pool/batches, above?)
      if (urlBatch && urlBatch.length > 0 && browserInstance) {
        // Using Promise.all() because we're inside a map(), but
        // are there any good alternatives here?
        return Promise.all(
          urlBatch.map((url) =>
            snap(
              url.url,
              screenshotSettings({
                path: screenshotPath(url.url),
              }),
              browserInstance
            ).then((screenshotFilepath) => {
              screenshotBar.increment();
              // resizing images locally
              const screenshotFilename = path.parse(screenshotFilepath).base;
              sharp(screenshotFilepath)
                .resize({ width: THUMBNAIL_WIDTH })
                .toFile(
                  `${outputDir}/thumbnails/${THUMBNAIL_WIDTH}/${screenshotFilename}`
                )
                .then(() => thumbnailBar.increment());
              return screenshotFilename;
            })
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
  progressBars.stop();

  return outputPaths;
}

run().then((results) => console.group(results));
