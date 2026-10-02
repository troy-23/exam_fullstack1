import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { Task, TaskInput } from '../../frontend/types';

function sampleTask(id: number, title: string): Task {
  return {
    id,
    title,
    description: 'Saved task details.',
    priority: 'medium',
    status: 'pending',
    created_at: '2026-01-01T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z',
  };
}

test('preserves a long mobile list and keeps save feedback and input visible during refresh', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const tasks = Array.from({ length: 20 }, (_, index) =>
    sampleTask(index + 1, `Saved task ${index + 1}`),
  );
  let saved = false;
  let releaseRefresh = () => {};
  const refreshGate = new Promise<void>((resolve) => {
    releaseRefresh = resolve;
  });

  await page.route('**/api/tasks', async (route) => {
    if (route.request().method() === 'POST') {
      const input = route.request().postDataJSON() as TaskInput;
      const task = { ...sampleTask(21, input.title), ...input };
      tasks.push(task);
      saved = true;
      await route.fulfill({ status: 201, json: { data: task } });
    } else {
      if (saved) await refreshGate;
      await route.fulfill({
        json: {
          data: tasks,
          statistics: { total: tasks.length, pending: tasks.length, completed: 0 },
        },
      });
    }
  });

  try {
    await page.goto('/');
    await expect(page.getByTestId('task-row')).toHaveCount(20);
    await page.getByRole('button', { name: 'New task', exact: true }).click();
    await page.getByLabel('Task title').fill('New mobile task');
    await page.getByRole('button', { name: 'Add task', exact: true }).click();
    await expect(page.getByText('Updating tasks…', { exact: true })).toBeVisible();
    await expect(page.getByTestId('task-row')).toHaveCount(20);
    await expect(page.locator('.form-notice')).toHaveText('Task added.');
    await expect(page.locator('.form-notice')).toBeInViewport();
    await expect(page.getByLabel('Task title')).toBeFocused();
    await expect(page.getByLabel('Task title')).toBeInViewport();
    releaseRefresh();
    await expect(page.getByTestId('task-row')).toHaveCount(21);
    await expect(page.getByLabel('Task title')).toBeInViewport();
    await expect(page.locator('.form-notice')).toBeInViewport();
  } finally {
    releaseRefresh();
  }
});

test('retains loaded tasks after a refresh error and hides stale rows when changing filters', async ({
  page,
}) => {
  const task = sampleTask(1, 'Previously loaded task');
  const newTask = sampleTask(2, 'Newly saved task');
  let saved = false;
  let failRefresh = true;
  let releaseFilter = () => {};
  const filterGate = new Promise<void>((resolve) => {
    releaseFilter = resolve;
  });
  await page.route('**/api/tasks**', async (route) => {
    if (route.request().method() === 'POST') {
      saved = true;
      await route.fulfill({ status: 201, json: { data: newTask } });
    } else if (new URL(route.request().url()).searchParams.get('status') === 'completed') {
      await filterGate;
      await route.fulfill({
        json: { data: [], statistics: { total: 2, pending: 2, completed: 0 } },
      });
    } else if (saved && failRefresh) {
      await route.fulfill({
        status: 500,
        json: { message: 'Refresh is temporarily unavailable.' },
      });
    } else {
      const tasks = saved ? [task, newTask] : [task];
      await route.fulfill({
        json: {
          data: tasks,
          statistics: { total: tasks.length, pending: tasks.length, completed: 0 },
        },
      });
    }
  });

  try {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: task.title, exact: true })).toBeVisible();
    await page.getByLabel('Task title').fill(newTask.title);
    await page.getByRole('button', { name: 'Add task', exact: true }).click();
    await expect(page.locator('.refresh-error')).toContainText('Showing the last loaded tasks.');
    await expect(page.getByRole('heading', { name: task.title, exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Unable to load tasks' })).toHaveCount(0);
    failRefresh = false;
    await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await expect(page.getByRole('heading', { name: newTask.title, exact: true })).toBeVisible();
    await expect(page.locator('.refresh-error')).toHaveCount(0);
    await page.getByRole('button', { name: /^Completed/ }).click();
    await expect(page.getByRole('status', { name: 'Loading tasks' })).toBeVisible();
    await expect(page.getByRole('heading', { name: task.title, exact: true })).toHaveCount(0);
    releaseFilter();
    await expect(page.getByRole('heading', { name: 'No completed tasks' })).toBeVisible();
  } finally {
    releaseFilter();
  }
});

test('shows completion errors beside the task and restores keyboard focus after completion', async ({
  page,
  request,
}) => {
  const ids: number[] = [];
  const stamp = Date.now();
  try {
    for (const title of [`Keyboard complete ${stamp}`, `Keyboard pending ${stamp}`]) {
      const response = await request.post('/api/tasks', { data: { title, priority: 'high' } });
      expect(response.status()).toBe(201);
      ids.push(((await response.json()).data as Task).id);
    }
    const title = `Keyboard complete ${stamp}`;
    const row = page
      .getByTestId('task-row')
      .filter({ has: page.getByRole('heading', { name: title }) });
    const complete = row.getByRole('button', { name: `Complete ${title}`, exact: true });
    await page.route(`**/api/tasks/${ids[0]}/complete`, (route) =>
      route.fulfill({ status: 500, json: { message: 'Completion is temporarily unavailable.' } }),
    );
    await page.goto('/');
    await complete.focus();
    await complete.press('Enter');
    await expect(row.getByRole('alert')).toHaveText('Completion is temporarily unavailable.');
    await expect(complete).toBeFocused();
    const dismiss = row.getByRole('button', { name: 'Dismiss task error' });
    await dismiss.focus();
    await dismiss.press('Enter');
    await expect(row.getByRole('alert')).toHaveCount(0);
    await expect(complete).toBeFocused();
    await page.unroute(`**/api/tasks/${ids[0]}/complete`);
    await complete.press('Enter');
    await expect(row.getByText('Completed', { exact: true })).toBeVisible();
    await expect(row.getByRole('heading', { name: title })).toBeFocused();
    await page.getByRole('button', { name: /^Pending/ }).click();
    const pendingTitle = `Keyboard pending ${stamp}`;
    const pendingRow = page
      .getByTestId('task-row')
      .filter({ has: page.getByRole('heading', { name: pendingTitle }) });
    const pendingComplete = pendingRow.getByRole('button', {
      name: `Complete ${pendingTitle}`,
      exact: true,
    });
    await pendingComplete.focus();
    await pendingComplete.press('Enter');
    await expect(pendingRow).toHaveCount(0);
    await expect(page.locator('#task-list-heading')).toBeFocused();
  } finally {
    for (const id of ids) await request.delete(`/api/tasks/${id}`);
  }
});

test('keeps a failed delete dialog accessible and restores focus after a successful retry', async ({
  page,
  request,
}) => {
  const title = `Delete retry ${Date.now()}`;
  const response = await request.post('/api/tasks', { data: { title } });
  expect(response.status()).toBe(201);
  const task: Task = (await response.json()).data;
  try {
    await page.route(`**/api/tasks/${task.id}`, (route) =>
      route.fulfill({ status: 500, json: { message: 'Deletion is temporarily unavailable.' } }),
    );
    await page.goto('/');
    const row = page
      .getByTestId('task-row')
      .filter({ has: page.getByRole('heading', { name: title }) });
    await row.getByRole('button', { name: `Delete ${title}`, exact: true }).click();
    await page.getByRole('button', { name: 'Delete task', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog').getByRole('alert')).toHaveText(
      'Deletion is temporarily unavailable.',
    );
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.unroute(`**/api/tasks/${task.id}`);
    await page.getByRole('button', { name: 'Delete task', exact: true }).click();
    await expect(row).toHaveCount(0);
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.locator('#task-list-heading')).toBeFocused();
  } finally {
    await request.delete(`/api/tasks/${task.id}`);
  }
});
