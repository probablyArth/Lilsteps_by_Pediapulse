import { expect, type Cookie, type Page } from '@playwright/test';

// One password grant per worker, then reuse the session cookies. Repeated
// signInWithPassword calls (13 tests × runs) trip Supabase's per-IP auth
// rate limit and the suite starts failing mid-run.
let sessionCookies: Cookie[] | null = null;

const queueHeading = (page: Page) =>
  page.getByRole('heading', { level: 1 }).filter({ hasText: /consultations/i });

export async function signInAsDoctor(page: Page) {
  if (sessionCookies) {
    await page.context().addCookies(sessionCookies);
    await page.goto('/');
    const reused = await queueHeading(page)
      .waitFor({ state: 'visible', timeout: 5_000 })
      .then(() => true)
      .catch(() => false);
    if (reused) return;
    sessionCookies = null; // session expired mid-run — fall through to fresh login
  }

  await page.goto('/login');
  await page.getByLabel(/email/i).fill(process.env.DOCTOR_EMAIL!);
  await page.getByLabel(/password/i).fill(process.env.DOCTOR_PASSWORD!);
  await page.getByRole('button', { name: /enter/i }).click();

  // The login page has its own h1, so waiting for "any h1" returns before the
  // server action finishes. Navigating away at that point drops the session
  // cookie and later page.goto() calls bounce back to /login. Wait for the
  // redirect to the queue instead.
  await page.waitForURL('/', { timeout: 15_000 });
  await expect(queueHeading(page)).toBeVisible({ timeout: 15_000 });

  sessionCookies = await page.context().cookies();
}
