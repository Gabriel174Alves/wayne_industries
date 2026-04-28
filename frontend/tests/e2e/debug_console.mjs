import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGEERROR', err.message));
  try {
    // Acquire backend token first
    let token = '';
    try {
      const loginResp = await fetch('http://127.0.0.1:5000/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'batman', password: 'wayne123', role: 'admin' }) });
      const js = await loginResp.json();
      token = js.token || js.access_token || '';
    } catch (e) {
      console.log('Auth request failed', e.message)
    }

    if (token) {
      await page.context().addInitScript((t) => {
        localStorage.setItem('authToken', t)
        localStorage.setItem('authRole', 'admin')
      }, token)
    }

    await page.goto('http://localhost:5173/control-tower', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    const html = await page.content();
    console.log('USUARIO present?', html.includes('USUÁRIO'));
    const scanCount = await page.locator('text=INICIAR ESCANEAMENTO').count();
    const placeholderCount = await page.locator('input[placeholder="Nome ou ID do herói"]').count().catch(() => 0);
    console.log('scanCount=', scanCount, 'placeholderCount=', placeholderCount);
    console.log('PAGE HTML START:\n', html.slice(0, 8000));
  } catch (err) {
    console.error('DEBUG ERR', err);
  } finally {
    await browser.close();
  }
})();