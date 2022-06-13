import cliProgress from "cli-progress";

export function initialiseProgressBars(barLength: number) {
    // --- progress bars setup start
    const progressBars = new cliProgress.MultiBar(
      {
        clearOnComplete: false,
        hideCursor: true,
      },
      cliProgress.Presets.shades_grey
    );
    const screenshotBar = progressBars.create(
      barLength,
      0,
      {},
      {
        format:
          "taking screenshots [{bar}] {percentage}% | {value}/{total}",
      }
    );
    const thumbnailBar = progressBars.create(
      barLength,
      0,
      {},
      {
        format:
          "resizing screenshots [{bar}] {percentage}% | {value}/{total}",
      }
    );
    return { progressBars, screenshotBar, thumbnailBar };
  }