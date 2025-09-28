const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const response = await page.goto('https://dcartdevelopment.com/dreadarchiejr/assets/videos/dread_intro_video.mp4');
  console.log('status', response.status());
  console.log('headers', await response.allHeaders());
  const size = (await response.body()).length;
  console.log('size', size);
  await browser.close();
})();
