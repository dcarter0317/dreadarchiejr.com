const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://dcartdevelopment.com/dreadarchiejr/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(20000);
  const result = await page.evaluate(() => {
    const video = document.querySelector('#introVideo');
    if (!video) return { present: false };
    return {
      readyState: video.readyState,
      networkState: video.networkState,
      currentTime: video.currentTime,
      duration: video.duration,
      buffered: video.buffered.length ? video.buffered.end(video.buffered.length - 1) : 0
    };
  });
  console.log(result);
  await browser.close();
})();
