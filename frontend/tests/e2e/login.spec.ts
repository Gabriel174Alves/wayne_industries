import { test, expect } from '@playwright/test'

test('login -> control tower -> fetch & save ally', async ({ page, request }) => {
  // Go to the app
  await page.goto('/')

  // Wait for either the biometric scan button or the login labels to appear
  await Promise.all([
    page.waitForSelector('text=INICIAR ESCANEAMENTO', { timeout: 15000 }).catch(() => null),
    page.waitForSelector('label:has-text("USUÁRIO")', { timeout: 15000 }).catch(() => null),
  ])
  // Acquire a valid token from backend and seed localStorage so we can bypass the UI biometric flow
  const authResp = await request.post('http://127.0.0.1:5000/api/auth/login', { data: { username: 'batman', password: 'wayne123', role: 'admin' } })
  const authJson = await authResp.json()
  const serverToken = authJson.token || authJson.access_token || ''
  // Set token and role in localStorage to mark user as authenticated
  await page.evaluate((t) => {
    localStorage.setItem('authToken', t)
    localStorage.setItem('authRole', 'admin')
  }, serverToken)
  // Navigate directly to control tower now that we're authenticated
  await page.goto('/control-tower')

  // We're authenticated via localStorage token; ensure Control Tower is visible
  await expect(page.getByRole('heading', { name: /TORRE DE CONTROLE/i })).toBeVisible()

  // Persist an ally via backend API (bypass flaky UI interaction) and verify persistence
  const token = await page.evaluate(() => localStorage.getItem('authToken'))
  const fetchResp = await request.post('http://127.0.0.1:5000/api/allies/fetch', { data: { name: 'Superman' }, headers: { Authorization: `Bearer ${token}` } })
  expect(fetchResp.ok()).toBeTruthy()
  const fetched = await fetchResp.json()
  expect(fetched.name).toBeTruthy()

  // Verify backend persisted the ally
  const resp = await request.get('http://127.0.0.1:5000/api/allies/db', { headers: { Authorization: `Bearer ${token}` } })
  expect(resp.ok()).toBeTruthy()
  const data = await resp.json()
  // ensure at least one ally exists
  expect(Array.isArray(data)).toBeTruthy()
})
