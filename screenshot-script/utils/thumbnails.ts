import fs from "fs";
import path from "path";
import sharp from "sharp";

const cliProgress = require("cli-progress");

// create a new progress bar instance and use shades_classic theme

// const bar2 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
// bar2.start(100, 0);
// for (let i = 0; i < 100; i++) {
//   bar2.update(i);
// }

const thumbnailProgress = new cliProgress.SingleBar(
  {},
  cliProgress.Presets.shades_classic
);

// export async function createThumbnail(inputPath, outputPath, width) {
//   await sharp(inputPath)
//     .resize({ width: width })
//     .toFile(`${OUTPUT_ROOT}/thumbnails/${THUMBNAIL_WIDTH}/${filename}`);
// }

// interface thumbnailDetails {
//     inputPath: string;
//     outputPath: string;
//     width: number;
// }

// const files thumbnailDetails[] = [
//     {
//         inputPath: 'async-test-screenshots/screenshots'
//     }
// ]

const inputDir = "async-test-screenshots/screenshots";
const outputDir = "async-test-screenshots/async-resize-test";
const width = 400;

exportThumbnails(inputDir, outputDir, width);

export function exportThumbnails(inputDir: string , outputDir: string, width: number) {
  
  // get a list of all the non-directory files in the inputDir
  // feels like there's probably a better way of doing this
  const screenshots = fs
    .readdirSync(inputDir)
    .map((filename) => path.join(inputDir, filename))
    .filter((record) => !fs.lstatSync(record).isDirectory());

  thumbnailProgress.start(screenshots.length, 0);

  screenshots.forEach((inputFilepath, i) => {
    const inputFilename = path.parse(inputFilepath).name;
    const outputFilepath = path.join(
      outputDir,
      `${inputFilename}_${width}.webp`
    );

    sharp(inputFilepath)
      .resize({ width })
      .toFile(outputFilepath)
      .then(
        () => {
          thumbnailProgress.update(i + 1);
          if (i >= screenshots.length - 1) {
            thumbnailProgress.stop();
          }
        },
        (err) =>
          console.log(`Error processing screenshot ${inputFilename}: ${err}`)
      );
  });
}
