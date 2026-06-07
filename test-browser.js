import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  console.log('Navigating to http://localhost:4173...');
  try {
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle0', timeout: 10000 });
  } catch (e) {
    console.log('Navigation timeout or error:', e.message);
  }

  const rootHTML = await page.evaluate(() => document.getElementById('root')?.innerHTML);
  console.log('Root HTML length:', rootHTML?.length);

  await browser.close();
  process.exit(0);
})();
