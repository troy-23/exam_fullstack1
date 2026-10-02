import { useEffect, useReducer } from 'react';
import { tasksApi } from './api';
import type { Filter, TaskResponse } from './types';

interface State {
  result: TaskResponse | null;
  loading: boolean;
  error: string | null;
  loadedFilter: Filter | null;
  requestedFilter: Filter;
}

type Action =
  | { type: 'loading'; filter: Filter }
  | { type: 'loaded'; result: TaskResponse; filter: Filter }
  | { type: 'failed'; error: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, loading: true, error: null, requestedFilter: action.filter };
    case 'loaded':
      return {
        result: action.result,
        loading: false,
        error: null,
        loadedFilter: action.filter,
        requestedFilter: action.filter,
      };
    case 'failed':
      return { ...state, loading: false, error: action.error };
  }
}

export function useTasks(filter: Filter) {
  const [state, dispatch] = useReducer(reducer, {
    result: null,
    loading: true,
    error: null,
    loadedFilter: null,
    requestedFilter: filter,
  });
  const [revision, refresh] = useReducer((value: number) => value + 1, 0);

  useEffect(() => {
    const controller = new AbortController();
    dispatch({ type: 'loading', filter });

    tasksApi.list(filter, controller.signal).then(
      (result) => {
        if (!controller.signal.aborted) dispatch({ type: 'loaded', result, filter });
      },
      (error: Error) => {
        if (!controller.signal.aborted) dispatch({ type: 'failed', error: error.message });
      },
    );

    return () => controller.abort();
  }, [filter, revision]);

  const hasCurrentResult = state.result !== null && state.loadedFilter === filter;
  const requestMatchesFilter = state.requestedFilter === filter;

  return {
    result: state.result,
    loading: !hasCurrentResult && (state.loading || !requestMatchesFilter),
    refreshing: hasCurrentResult && (state.loading || !requestMatchesFilter),
    error: !hasCurrentResult && requestMatchesFilter ? state.error : null,
    refreshError: hasCurrentResult && requestMatchesFilter ? state.error : null,
    refresh,
  };
}
