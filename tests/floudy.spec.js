import { test, expect } from '@playwright/test';

// utils

/**
 * @param {import("playwright-core").Page} page
 */
async function open(page) 
{
  await page.goto('http://localhost:5173');
  await page.waitForSelector('.home__cta');
}

/**
 * @param {import("playwright-core").Page} page
 */
async function login(page) 
{
  await open(page);

  await page.click('.home__cta');
  await page.waitForSelector('.auth__card');
  await page.fill('input[placeholder="username"]', 'tester');
  await page.fill('input[placeholder="password"]', 'secret123');
  await page.click('.auth__btn.primary');
  await page.waitForSelector('.dash');
}

/**
 * @param {import("playwright-core").Page} page
 * @param {any[]} names
 */
async function uploadFiles(page, names) 
{
  const buffers = names.map(n => 
  ({
      name: n,
      mimeType: 'text/plain',
      buffer: Buffer.from(`content of ${n}`),
  }));

  const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.click('.dash__upload')]);
  await fc.setFiles(buffers);
}

// actual tests

test.describe('authentication tests', () => 
{
  test('home page renders and navigates to login', async ({ page }) => 
  {
    await open(page);
    await expect(page.locator('.home__title')).toHaveText('Floudy');

    await page.click('.home__cta');
    await expect(page.locator('.auth__heading')).toHaveText('Sign in');
  });

  test('login with empty fields shows error', async ({ page }) => 
  {
    await open(page);
    await page.click('.home__cta');
    await page.click('.auth__btn.primary');
    await expect(page.locator('.err-msg')).toBeVisible();
  });

  test('login with only username shows error', async ({ page }) => 
  {
    await open(page);
    await page.click('.home__cta');
    await page.fill('input[placeholder="username"]', 'someone');
    await page.click('.auth__btn.primary');
    await expect(page.locator('.err-msg')).toBeVisible();
  });

  test('valid login reaches dashboard', async ({ page }) => 
  {
    await login(page);
    await expect(page.locator('.dash__upload').first()).toBeVisible();
    await expect(page.locator('.dash__status')).toContainText('personal dashboard');
  });

  test('logout returns to home', async ({ page }) => 
  {
    await login(page);
    await page.click('.navbar__logout');
    await expect(page.locator('.home__cta')).toBeVisible();
  });
});

test.describe('registration tests', () => 
{
  /**
   * @param {import("playwright-core").Page} page
   */
  async function goRegister(page) 
  {
    await open(page);
    await page.click('.home__cta');
    await page.click('.auth__btn.secondary');
    await page.waitForSelector('.auth__card h1');
  }

  test('rejects short username', async ({ page }) => 
  {
    await goRegister(page);

    await page.fill('input[placeholder="username"]', 'ab');
    await page.fill('input[placeholder="e-mail"]', 'a@b.com');
    await page.fill('input[placeholder="password"]', 'password1');
    await page.fill('input[placeholder="confirm password"]', 'password1');

    await page.click('.auth__btn.primary');
    await expect(page.locator('.err-msg').first()).toBeVisible();
  });

  test('rejects invalid email', async ({ page }) => 
  {
    await goRegister(page);
    await page.fill('input[placeholder="username"]', 'validuser');
    await page.fill('input[placeholder="e-mail"]', 'not-an-email');
    await page.fill('input[placeholder="password"]', 'password1');
    await page.fill('input[placeholder="confirm password"]', 'password1');
    await page.click('.auth__btn.primary');

    await expect(page.locator('.err-msg').first()).toBeVisible();
  });

  test('rejects password without a digit', async ({ page }) => 
  {
    await goRegister(page);
    await page.fill('input[placeholder="username"]', 'validuser');
    await page.fill('input[placeholder="e-mail"]', 'a@b.com');
    await page.fill('input[placeholder="password"]', 'nodigitshere');
    await page.fill('input[placeholder="confirm password"]', 'nodigitshere');
    await page.click('.auth__btn.primary');

    await expect(page.locator('.err-msg').first()).toBeVisible();
  });

  test('rejects mismatched passwords', async ({ page }) => 
  {
    await goRegister(page);
    await page.fill('input[placeholder="username"]', 'validuser');
    await page.fill('input[placeholder="e-mail"]', 'a@b.com');
    await page.fill('input[placeholder="password"]', 'password1');
    await page.fill('input[placeholder="confirm password"]', 'different1');
    await page.click('.auth__btn.primary');

    await expect(page.locator('.err-msg').first()).toBeVisible();
  });

  test('valid registration reaches dashboard', async ({ page }) => 
  {
    await goRegister(page);
    await page.fill('input[placeholder="username"]', 'alice99');
    await page.fill('input[placeholder="e-mail"]', 'alice@example.com');
    await page.fill('input[placeholder="password"]', 'secret123');
    await page.fill('input[placeholder="confirm password"]', 'secret123');
    await page.click('.auth__btn.primary');
    await expect(page.locator('.dash')).toBeVisible();
  });
});

test.describe('file upload and table tests', () => 
{
  test('empty state shows nothing', async ({ page }) => {
    await login(page);
    await expect(page.locator('.dash__panel').first()).toHaveText("#NameSizeFile TypeUpload DateActions")
  });

  test('uploading a file shows it in the table', async ({ page }) => {
    await login(page);
    await uploadFiles(page, ['hello.txt']);
    await expect(page.locator('.ftable tbody tr')).toHaveCount(1);
    await expect(page.locator('.ftable tbody')).toContainText('hello.txt');
  });

  test('uploading multiple files shows all rows', async ({ page }) => {
    await login(page);
    await uploadFiles(page, ['a.txt', 'b.txt', 'c.txt']);
    await expect(page.locator('.ftable tbody tr')).toHaveCount(3);
  });

  test('selecting a file in table activates VIEW AS TEXT button', async ({ page }) => {
    await login(page);
    await uploadFiles(page, ['sample.txt']);
    // Button should be inactive before selection
    await expect(page.locator('.dash__view-text')).not.toHaveClass(/active/);
    await page.locator('.ftable tbody tr').first().click();
    await expect(page.locator('.dash__view-text')).toHaveClass(/active/);
  });

  test('VIEW AS TEXT shows file content', async ({ page }) => {
    await login(page);
    await uploadFiles(page, ['sample.txt']);
    await page.locator('.ftable tbody tr').first().click();
    await page.click('.dash__view-text.active');
    await expect(page.locator('.tviewer__content')).toContainText('content of sample.txt');
  });

  test('status bar shows selected filename', async ({ page }) => {
    await login(page);
    await uploadFiles(page, ['pick-me.txt']);
    await page.locator('.ftable tbody tr').first().click();
    await expect(page.locator('.dash__status')).toContainText('pick-me.txt');
  });
});

test.describe('crud tests', () => 
{
  test('deleting a file removes it from the list', async ({ page }) => 
  {
    await login(page);
    await uploadFiles(page, ['remove-me.txt']);
    await expect(page.locator('.ftable tbody tr')).toHaveCount(1);
    await page.locator('.act-btn.del').click();

    await expect(page.locator('.dash__panel').first()).toHaveText("#NameSizeFile TypeUpload DateActions");
  });

  test('renaming a file updates its name', async ({ page }) => 
  {
    await login(page);
    await uploadFiles(page, ['old-name.txt']);
    
    await page.locator('.act-btn.ren').click();
    const input = page.locator('.ftable__rename');
    await expect(input).toBeVisible();
    await input.fill('new-name.txt');
    await input.press('Enter');

    await expect(page.locator('.ftable tbody')).toContainText('new-name.txt');
    await expect(page.locator('.ftable tbody')).not.toContainText('old-name.txt');
  });

  test('rename rejects empty filename', async ({ page }) => 
  {
    await login(page);
    await uploadFiles(page, ['valid.txt']);
    await page.locator('.act-btn.ren').click();
    const input = page.locator('.ftable__rename');
    await input.fill('');
    await input.press('Enter');

    await expect(page.locator('.err-msg')).toBeVisible();
  });

  test('rename rejects invalid characters', async ({ page }) => 
  {
    await login(page);
    await uploadFiles(page, ['valid.txt']);
    await page.locator('.act-btn.ren').click();
    await page.locator('.ftable__rename').fill('bad/name.txt');
    await page.locator('.ftable__rename').press('Enter');

    await expect(page.locator('.err-msg')).toBeVisible();
  });

});

test.describe('view mode tests', () => 
{
  test('switching to icon view renders file icons', async ({ page }) => 
  {
    await login(page);
    await uploadFiles(page, ['icon-test.txt']);
    await page.locator('.dash__icon-btn.view-toggle').nth(1).click();

    await expect(page.locator('.fgrid__item')).toHaveCount(1);
    await expect(page.locator('.fgrid__name')).toContainText('icon-test.txt');
  });

  test('icon view shows file details panel on selection', async ({ page }) => 
  {
    await login(page);
    await uploadFiles(page, ['details-test.txt']);
    await page.locator('.dash__icon-btn.view-toggle').nth(1).click();

    await expect(page.locator('.fgrid__details')).toContainText('--');

    await page.locator('.fgrid__item').first().click();
    await expect(page.locator('.fgrid__details')).not.toContainText('size:   --');
  });

  test('switching back to table view shows table', async ({ page }) => 
  {
    await login(page);
    await uploadFiles(page, ['back.txt']);

    await page.locator('.dash__icon-btn.view-toggle').nth(1).click();
    await expect(page.locator('.fgrid')).toBeVisible();

    await page.locator('.dash__icon-btn.view-toggle').first().click();
    await expect(page.locator('.ftable')).toBeVisible();
  });

});

test.describe('stats tests', () => 
{
  test('stats page shows "no data" charts when empty', async ({ page }) => 
  {
    await login(page);
    await page.locator('.navbar__link', { hasText: 'Stats' }).first().click();

    await expect(page.locator('.stats__panel')).toBeVisible();
    await expect(page.locator('.stats__half svg')).toHaveCount(2);
  });

  test('uploading files updates stats donut', async ({ page }) => 
  {
    await login(page);
    await uploadFiles(page, ['data.txt', 'image.png']);
    await page.locator('.navbar__link', { hasText: 'Stats' }).first().click();

    await expect(page.locator('.donut-legend')).not.toHaveCount(0);
  });
});

test.describe('recent files tests', () => 
{
  test('shows empty state with no uploads', async ({ page }) => 
  {
    await login(page);
    await page.locator('.navbar__link', { hasText: 'Recent Files' }).first().click();

    await expect(page.locator('.recent__panel')).toContainText('No files uploaded yet.');
  });

  test('shows uploaded files sorted newest first', async ({ page }) => 
  {
    await login(page);
    await uploadFiles(page, ['first.txt']);
    await uploadFiles(page, ['second.txt']);
    await page.locator('.navbar__link', { hasText: 'Recent Files' }).first().click();
    const rows = page.locator('.ftable tbody tr');
    
    await expect(rows).toHaveCount(2);
    await expect(rows.first()).toContainText('second.txt');
  });
});

test.describe('pagination tests', () => 
{
  test('10 files fit on one page, 11 require two', async ({ page }) => 
  {
    await login(page);

    const names = Array.from({ length: 11 }, (_, i) => `file-${i}.txt`);
    await uploadFiles(page, names);

    await expect(page.locator('.ftable tbody tr')).toHaveCount(10);
    await expect(page.locator('.pagination__current')).toHaveText('1/2');
  });

  test('next page button navigates to page 2', async ({ page }) => 
  {
    await login(page);
    const names = Array.from({ length: 11 }, (_, i) => `p-${i}.txt`);
    await uploadFiles(page, names);

    await page.locator('.pagination__btn.arrow').nth(2).click();
    await expect(page.locator('.pagination__current')).toHaveText('2/2');
    await expect(page.locator('.ftable tbody tr')).toHaveCount(1);
  });
});