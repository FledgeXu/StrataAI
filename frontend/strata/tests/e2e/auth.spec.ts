import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

const validCredentials = {
  email: 'analyst@strata.ai',
  password: 'Passw0rd!',
}

async function login(page: Page) {
  await page.goto('/login')
  await page.getByTestId('email-input').fill(validCredentials.email)
  await page.getByTestId('password-input').fill(validCredentials.password)
  await page.getByTestId('login-submit').click()
  await expect(page).toHaveURL(/\/app$/)
  await expect(page.getByTestId('app-shell')).toBeVisible()
}

test('logs in and reaches the protected app', async ({ page }) => {
  await page.goto('/login')
  await page.getByTestId('email-input').fill(validCredentials.email)
  await page.getByTestId('password-input').fill(validCredentials.password)
  await page.getByTestId('login-submit').click()

  await expect(page).toHaveURL(/\/app$/)
  await expect(page.getByTestId('app-shell')).toBeVisible()
  await expect(page.getByTestId('protected-status')).toContainText('Ready to check the protected API.')
})

test('rejects invalid credentials with a stable error message', async ({ page }) => {
  await page.goto('/login')
  await page.getByTestId('email-input').fill(validCredentials.email)
  await page.getByTestId('password-input').fill('wrong-password')
  await page.getByTestId('login-submit').click()

  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByTestId('login-alert')).toContainText('Email or password is incorrect.')
})

test('redirects anonymous protected URLs to /login and restores query and hash after login', async ({ page }) => {
  await page.goto('/app?tab=2#metrics')

  await expect(page).toHaveURL(/\/login\?redirect=%2Fapp%3Ftab%3D2%23metrics$/)
  await page.getByTestId('email-input').fill(validCredentials.email)
  await page.getByTestId('password-input').fill(validCredentials.password)
  await page.getByTestId('login-submit').click()

  await expect(page).toHaveURL(/\/app\?tab=2#metrics$/)
  await expect(page.getByTestId('app-shell')).toBeVisible()
})

test('restores the session on app entry with only the refresh cookie', async ({ browser, page }) => {
  await login(page)
  const storageState = await page.context().storageState()

  const restoredContext = await browser.newContext({ storageState })
  const restoredPage = await restoredContext.newPage()
  await restoredPage.route('**/api/v1/auth/refresh', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 250))
    await route.continue()
  })

  await restoredPage.goto('/app')
  await expect(restoredPage).toHaveURL(/\/app$/)
  await expect(restoredPage.getByTestId('app-shell')).toBeVisible()
  await expect(restoredPage.getByTestId('protected-status')).toContainText('Ready to check the protected API.')

  await restoredContext.close()
})

test('forces a login redirect when refresh fails after concurrent protected requests', async ({ page }) => {
  await login(page)

  let refreshRequestCount = 0
  page.on('request', (request) => {
    if (request.url().endsWith('/api/v1/auth/refresh') && request.method() === 'POST') {
      refreshRequestCount += 1
    }
  })

  await page.context().clearCookies()
  await page.waitForTimeout(6_000)
  await page.getByTestId('protected-concurrent-button').click()

  await expect(page).toHaveURL(/\/login$/)
  expect(refreshRequestCount).toBe(1)
})

test('logs out and returns to /login', async ({ page }) => {
  await login(page)
  await page.getByTestId('logout-button').click()

  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByTestId('email-input')).toBeVisible()
})

test('clears local auth state even when backend logout fails', async ({ page }) => {
  await login(page)

  await page.route('**/api/v1/auth/logout', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'logout failed' }),
    })
  })

  await page.getByTestId('logout-button').click()

  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByTestId('email-input')).toBeVisible()
})
