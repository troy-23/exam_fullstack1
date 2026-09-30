import type { Filter, Task, TaskInput, TaskResponse } from './types';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const timeout = AbortSignal.timeout(15_000);
  const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;
  let response: Response;

  try {
    response = await fetch(`/api/tasks${path}`, {
      ...options,
      signal,
      headers: { Accept: 'application/json', ...options.headers },
    });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new ApiError('We couldn’t connect. Check your connection and try again.');
  }

  const body = await response.json().catch(() => {
    throw new ApiError('The server returned an unexpected response. Please try again.');
  });

  if (!response.ok) {
    throw new ApiError(body.message ?? 'Something went wrong. Please try again.', body.errors);
  }

  return body as T;
}

export const tasksApi = {
  list: (filter: Filter, signal: AbortSignal) =>
    request<TaskResponse>(filter === 'all' ? '' : `?status=${filter}`, { signal }),
  create: (input: TaskInput) =>
    request<{ data: Task }>('', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),
  complete: (id: number) => request<{ data: Task }>(`/${id}/complete`, { method: 'PATCH' }),
  delete: (id: number) => request<{ message: string }>(`/${id}`, { method: 'DELETE' }),
};
