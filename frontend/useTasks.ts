import { useEffect, useReducer } from 'react';
import { tasksApi } from './api';
import type { Filter, TaskResponse } from './types';

interface State {
  result: TaskResponse | null;
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: 'loading' }
  | { type: 'loaded'; result: TaskResponse }
  | { type: 'failed'; error: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, loading: true, error: null };
    case 'loaded':
      return { result: action.result, loading: false, error: null };
    case 'failed':
      return { ...state, loading: false, error: action.error };
  }
}

export function useTasks(filter: Filter) {
  const [state, dispatch] = useReducer(reducer, { result: null, loading: true, error: null });
  const [revision, refresh] = useReducer((value: number) => value + 1, 0);

  useEffect(() => {
    const controller = new AbortController();
    dispatch({ type: 'loading' });

    tasksApi.list(filter, controller.signal).then(
      (result) => {
        if (!controller.signal.aborted) dispatch({ type: 'loaded', result });
      },
      (error: Error) => {
        if (!controller.signal.aborted) dispatch({ type: 'failed', error: error.message });
      },
    );

    return () => controller.abort();
  }, [filter, revision]);

  return { ...state, refresh };
}
