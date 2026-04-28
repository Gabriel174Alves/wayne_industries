const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGEERROR', err.message));
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    const html = await page.content();
    console.log('PAGE HTML START:\n', html.slice(0, 2000));
  } catch (err) {
    console.error('DEBUG ERR', err);
  } finally {
    await browser.close();
  }
})();