import { expect, test, type APIRequestContext } from '@playwright/test';
import type { Task } from '../../frontend/types';

async function createTask(request: APIRequestContext, title: string, priority = 'medium') {
  const response = await request.post('/api/tasks', { data: { title, priority } });
  expect(response.status()).toBe(201);
  return (await response.json()).data as Task;
}

test('persists, sorts, filters, completes idempotently, and deletes tasks', async ({ request }) => {
  const ids: number[] = [];
  try {
    const low = await createTask(request, 'API: low priority', 'low');
    ids.push(low.id);
    const high = await createTask(request, 'API: high priority', 'high');
    ids.push(high.id);
    const medium = await createTask(request, 'API: medium priority');
    ids.push(medium.id);
    expect(high.status).toBe('pending');
    expect(high.created_at).toMatch(/Z$/);

    const list = await request.get('/api/tasks');
    expect(list.status()).toBe(200);
    const tasks: Task[] = (await list.json()).data;
    expect(tasks.filter((task) => ids.includes(task.id)).map((task) => task.id)).toEqual([
      high.id,
      medium.id,
      low.id,
    ]);

    const completed = await request.patch(`/api/tasks/${high.id}/complete`);
    expect(completed.status()).toBe(200);
    const updated = (await completed.json()).data;
    expect(updated.status).toBe('completed');
    const repeated = await request.patch(`/api/tasks/${high.id}/complete`);
    expect(repeated.status()).toBe(200);
    expect((await repeated.json()).data.updated_at).toBe(updated.updated_at);

    const filtered = await request.get('/api/tasks?status=completed');
    const body = await filtered.json();
    expect(body.data.some((task: Task) => task.id === high.id)).toBe(true);
    expect(body.data.every((task: Task) => task.status === 'completed')).toBe(true);
    expect(body.statistics.pending).toBeGreaterThanOrEqual(2);
    expect(body.statistics.total).toBe(body.statistics.pending + body.statistics.completed);

    expect((await request.delete(`/api/tasks/${low.id}`)).status()).toBe(200);
    expect((await request.delete(`/api/tasks/${low.id}`)).status()).toBe(404);
    const reloaded = (await (await request.get('/api/tasks')).json()).data as Task[];
    expect(reloaded.find((task) => task.id === high.id)?.status).toBe('completed');
    expect(reloaded.some((task) => task.id === low.id)).toBe(false);
  } finally {
    for (const id of ids) await request.delete(`/api/tasks/${id}`);
  }
});

test('rejects invalid input without adding tasks', async ({ request }) => {
  const before = (await (await request.get('/api/tasks')).json()).statistics.total;
  for (const data of [
    {},
    { title: '   ' },
    { title: '\u00a0' },
    { title: 12 },
    { title: [] },
    { title: 'Valid', priority: 'urgent' },
    { title: 'Valid', priority: {} },
    { title: 'Valid', description: 12 },
    { title: 'a'.repeat(256) },
    { title: 'Valid', description: 'a'.repeat(5001) },
  ]) {
    const response = await request.post('/api/tasks', { data });
    expect(response.status()).toBe(400);
    expect((await response.json()).errors).toBeTruthy();
  }
  for (const data of ['{broken', '[]', 'null']) {
    const response = await request.post('/api/tasks', {
      data,
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status()).toBe(400);
  }
  expect((await request.post('/api/tasks', { data: 'title=test' })).status()).toBe(400);
  expect((await request.get('/api/tasks?status=invalid')).status()).toBe(400);
  expect((await request.get('/api/tasks?status[]=pending')).status()).toBe(400);
  expect((await (await request.get('/api/tasks')).json()).statistics.total).toBe(before);
});

test('returns clear not-found and method-not-allowed responses', async ({ request }) => {
  expect((await request.patch('/api/tasks/999999999/complete')).status()).toBe(404);
  expect((await request.delete('/api/tasks/not-an-id')).status()).toBe(404);
  expect((await request.get('/api/unknown')).status()).toBe(404);
  expect((await request.put('/api/tasks', { data: {} })).status()).toBe(405);
  expect((await request.get('/api/tasks/1/complete')).headers().allow).toBe('PATCH');
  expect((await request.get('/.env')).status()).toBe(404);
});
