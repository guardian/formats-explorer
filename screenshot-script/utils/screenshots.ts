import puppeteer from "puppeteer";

export interface ScreenshotOptions extends puppeteer.ScreenshotOptions {
  path: string;
}
export interface PageData {
  url: string;
  name?: string;
}

export function truncateUrl(
  url: string,
  maxLength: number,
  pathOnly = false
): string {
  const segmentToTruncate = pathOnly ? new URL(url).pathname : url;
  return segmentToTruncate.slice(0 - maxLength);
}

export const screenshotSettingsFactory = (
  defaults: puppeteer.ScreenshotOptions = {}
) => {
  // given current usage it seems to make sense to pass a path
  // for every specific initialisation?
  return (overrides: ScreenshotOptions): ScreenshotOptions => ({
    ...defaults,
    ...overrides,
  });
};

export async function createBrowser() {
  console.log("creating browser instance");
  const browserInstance = await puppeteer.launch({
    headless: true,
  });
  return browserInstance;
}

export async function snap(
  url: PageData,
  screenshotOptions: ScreenshotOptions,
  browserInstance: null | puppeteer.Browser = null
) {
  const browser = browserInstance ?? (await createBrowser());

  console.log(`opening page for ${url.url}`);
  const page = await browser.newPage();
  page.setJavaScriptEnabled(false);
  await page.setViewport({ width: 1440, height: 1440 });

  // set cookie to remove ad banner space at top
  await page.setCookie({
    name: "GU_AF1",
    value: "true",
    domain: "www.theguardian.com",
    path: "/",
    httpOnly: false,
    secure: true,
  });

  console.log(`going to url for ${url.url}`);
  await page.goto(url.url);

  console.log(`saving screenshot for ${url.url}`);
  await page.screenshot(screenshotOptions);
  return screenshotOptions.path;
}

export function screenshotPathFactory(dir: string, fileType: string) {
  return (url: string) =>
    `${dir}/${truncateUrl(url, 100).replaceAll(/[/:.]/g, "-")}.${fileType}`;
}
