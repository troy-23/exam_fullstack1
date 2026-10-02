import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { Task } from '../../frontend/types';

test('creates, persists after reload, filters, completes, and deletes through the UI', async ({
  page,
  request,
}) => {
  const title = `Plan a focused day ${Date.now()}`;
  const consoleErrors: string[] = [];
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  try {
    await page.goto('/');
    await page.getByRole('button', { name: 'Add task', exact: true }).click();
    await expect(page.getByText('Title is required.')).toBeVisible();
    await expect(page.getByLabel('Task title')).toBeFocused();
    await page.getByLabel('Task title').fill(title);
    await page.getByLabel('Description').fill('Keep the important things in sight.');
    await page.getByRole('radio', { name: /^high$/i }).check();
    await page.getByRole('button', { name: 'Add task', exact: true }).click();
    const row = page
      .getByTestId('task-row')
      .filter({ has: page.getByRole('heading', { name: title, exact: true }) });
    await expect(row).toBeVisible();
    await expect(page.getByLabel('Task title')).toBeEmpty();
    await expect(page.getByLabel('Task title')).toBeFocused();
    await page.reload();
    await expect(row).toBeVisible();
    await page.getByRole('button', { name: /^Pending/ }).click();
    await expect(row).toBeVisible();
    await row.getByRole('button', { name: `Complete ${title}`, exact: true }).click();
    await expect(row).toHaveCount(0);
    await page.getByRole('button', { name: /^Completed/ }).click();
    await expect(row).toBeVisible();
    await expect(row.getByText('Completed', { exact: true })).toBeVisible();
    await row.getByRole('button', { name: `Delete ${title}`, exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(row.getByRole('button', { name: `Delete ${title}`, exact: true })).toBeFocused();
    await row.getByRole('button', { name: `Delete ${title}`, exact: true }).click();
    await page.getByRole('button', { name: 'Delete task', exact: true }).click();
    await expect(row).toHaveCount(0);
    await expect(page.locator('#task-list-heading')).toBeFocused();
    expect(consoleErrors).toEqual([]);
  } finally {
    const tasks: Task[] = (await (await request.get('/api/tasks')).json()).data;
    for (const task of tasks.filter((task) => task.title === title))
      await request.delete(`/api/tasks/${task.id}`);
  }
});

test('keeps form input after a failed save and can recover from a failed list request', async ({
  page,
}) => {
  await page.route('**/api/tasks**', (route) =>
    route.fulfill({
      status: 500,
      json: { message: 'Tasks are unavailable right now. Please try again.' },
    }),
  );
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Unable to load tasks' })).toBeVisible();
  await page.getByLabel('Task title').fill('Keep this draft');
  await page.getByRole('button', { name: 'Add task', exact: true }).click();
  await expect(page.getByLabel('Task title')).toHaveValue('Keep this draft');
  await expect(page.locator('.form-error')).toBeVisible();
  await expect(page.locator('.form-error')).toBeFocused();
  await expect(page.locator('.form-error')).toBeInViewport();
  await page.unroute('**/api/tasks**');
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Unable to load tasks' })).not.toBeVisible();
  await expect(page.locator('.task-list-content')).toHaveAttribute('aria-busy', 'false');
});

test('shows loading feedback then an intentional empty state', async ({ page }) => {
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/tasks', async (route) => {
    await gate;
    await route.fulfill({ json: { data: [], statistics: { total: 0, pending: 0, completed: 0 } } });
  });
  await page.goto('/');
  await expect(page.getByRole('status', { name: 'Loading tasks' })).toBeVisible();
  release();
  await expect(page.getByRole('heading', { name: 'No tasks yet' })).toBeVisible();
  await page.getByRole('button', { name: 'Create a task', exact: true }).click();
  await expect(page.getByLabel('Task title')).toBeFocused();
});

for (const width of [320, 375, 390, 414, 768, 1024, 1280]) {
  test(`fits and remains operable at ${width}px`, async ({ page, request }) => {
    const title = `Responsive ${width} ${'longunbrokentitle'.repeat(10)}`;
    const response = await request.post('/api/tasks', {
      data: {
        title,
        description: 'A long description with content that should wrap comfortably on a phone.',
        priority: 'high',
      },
    });
    const task: Task = (await response.json()).data;
    try {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      const row = page
        .getByTestId('task-row')
        .filter({ has: page.getByRole('heading', { name: title, exact: true }) });
      await expect(row).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      for (const control of await page.getByRole('button').all()) {
        if (!(await control.isVisible())) continue;
        const bounds = await control.boundingBox();
        expect(bounds!.width, await control.innerText()).toBeGreaterThanOrEqual(44);
        expect(bounds!.height, await control.innerText()).toBeGreaterThanOrEqual(44);
      }
      for (const control of await page.getByRole('radio').all()) {
        const bounds = await control.boundingBox();
        expect(bounds!.width).toBeGreaterThanOrEqual(44);
        expect(bounds!.height).toBeGreaterThanOrEqual(44);
      }
      await page.getByRole('button', { name: 'New task', exact: true }).click();
      await expect(page.getByLabel('Task title')).toBeFocused();
      await row.getByRole('button', { name: `Delete ${title}`, exact: true }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      const dialog = await page.getByRole('dialog').boundingBox();
      expect(dialog!.x).toBeGreaterThanOrEqual(0);
      expect(dialog!.x + dialog!.width).toBeLessThanOrEqual(width);
      await page.getByRole('button', { name: 'Cancel' }).click();
      await page.screenshot({ path: `artifacts/responsive-${width}.png`, fullPage: true });
    } finally {
      await request.delete(`/api/tasks/${task.id}`);
    }
  });
}

test('has no automated WCAG A/AA violations on the dashboard and delete dialog', async ({
  page,
  request,
}) => {
  const response = await request.post('/api/tasks', {
    data: { title: 'Accessibility check', priority: 'high' },
  });
  const task: Task = (await response.json()).data;
  const additionalIds: number[] = [];
  try {
    for (const priority of ['medium', 'low']) {
      const extra = await request.post('/api/tasks', {
        data: { title: `Accessibility ${priority}`, priority },
      });
      const extraTask: Task = (await extra.json()).data;
      additionalIds.push(extraTask.id);
      if (priority === 'low') await request.patch(`/api/tasks/${extraTask.id}/complete`);
    }
    await page.goto('/');
    await expect(page.getByRole('heading', { name: task.title, exact: true })).toBeVisible();
    const scan = () =>
      new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect((await scan()).violations).toEqual([]);
    await page.getByRole('button', { name: `Delete ${task.title}`, exact: true }).click();
    expect((await scan()).violations).toEqual([]);
  } finally {
    await request.delete(`/api/tasks/${task.id}`);
    for (const id of additionalIds) await request.delete(`/api/tasks/${id}`);
  }
});

test('supports enlarged text, landscape, and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('/');
  await expect(page.locator('.task-list-content')).toHaveAttribute('aria-busy', 'false');
  await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
  await expect(page.locator('html')).toHaveCSS('font-size', '32px');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
  await page.getByRole('button', { name: 'New task', exact: true }).click();
  await expect(page.getByLabel('Task title')).toBeFocused();
  await expect(page.getByLabel('Task title')).toBeInViewport();
  expect(
    await page
      .locator('.progress-track > span')
      .evaluate((element) => Number.parseFloat(getComputedStyle(element).transitionDuration)),
  ).toBeLessThan(0.001);
  await page.addStyleTag({ content: 'html { font-size: 100% !important; }' });
  await expect(page.locator('html')).toHaveCSS('font-size', '16px');
  await page.setViewportSize({ width: 812, height: 375 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(812);
  await page.getByRole('button', { name: 'New task', exact: true }).click();
  await expect(page.getByLabel('Task title')).toBeInViewport();
});
