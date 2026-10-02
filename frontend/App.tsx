import { Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { tasksApi } from './api';
import { DeleteDialog } from './components/DeleteDialog';
import { Statistics } from './components/Statistics';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import type { Filter, Task, TaskActionError, TaskInput } from './types';
import { useTasks } from './useTasks';

export default function App() {
  const [filter, setFilter] = useState<Filter>('all');
  const { result, loading, refreshing, error, refreshError, refresh } = useTasks(filter);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState<TaskActionError | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const mutationLock = useRef(false);
  const actionFocus = useRef<{ id: number; action: 'complete' | 'delete' } | null>(null);

  useEffect(() => {
    const focus = actionFocus.current;
    if (!focus || !result) return;
    const task = result.data.find((task) => task.id === focus.id);
    if (focus.action === 'delete' ? task !== undefined : task?.status === 'pending') return;

    actionFocus.current = null;
    if (document.activeElement === document.body) {
      const target =
        (focus.action === 'complete' && document.getElementById(`task-heading-${focus.id}`)) ||
        document.getElementById('task-list-heading');
      target?.focus();
    }
  }, [result]);

  function focusForm() {
    document.getElementById('task-title')?.focus();
  }

  function dismissTaskError() {
    if (actionError) {
      document
        .getElementById(`task-complete-${actionError.taskId}`)
        ?.focus({ preventScroll: true });
    }
    setActionError(null);
  }

  async function createTask(input: TaskInput) {
    setNotice('');
    await tasksApi.create(input);
    refresh();
    return filter === 'completed'
      ? 'Task added. View it under All tasks or Pending.'
      : 'Task added.';
  }

  async function completeTask(task: Task) {
    if (mutationLock.current) return;
    mutationLock.current = true;
    setBusyId(task.id);
    setNotice('');
    setActionError(null);
    try {
      await tasksApi.complete(task.id);
      setNotice('Task completed.');
      actionFocus.current = { id: task.id, action: 'complete' };
      refresh();
    } catch (failure) {
      setActionError({
        taskId: task.id,
        message:
          failure instanceof Error ? failure.message : 'Unable to complete the task. Try again.',
      });
      requestAnimationFrame(() => {
        if (document.activeElement === document.body) {
          document.getElementById(`task-error-${task.id}`)?.scrollIntoView({ block: 'nearest' });
          document.getElementById(`task-complete-${task.id}`)?.focus({ preventScroll: true });
        }
      });
    } finally {
      mutationLock.current = false;
      setBusyId(null);
    }
  }

  async function deleteTask() {
    if (!deleteTarget || mutationLock.current) return;
    mutationLock.current = true;
    setBusyId(deleteTarget.id);
    setNotice('');
    setDeleteError('');
    try {
      await tasksApi.delete(deleteTarget.id);
      actionFocus.current = { id: deleteTarget.id, action: 'delete' };
      setDeleteTarget(null);
      setNotice('Task deleted.');
      refresh();
    } catch (failure) {
      setDeleteError(
        failure instanceof Error ? failure.message : 'Unable to delete the task. Try again.',
      );
    } finally {
      mutationLock.current = false;
      setBusyId(null);
    }
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to tasks
      </a>
      <main id="main" tabIndex={-1}>
        <header className="page-heading">
          <div>
            <h1>Simple Task Tracker</h1>
            <p>Create tasks, set priorities, and track progress.</p>
          </div>
          <button className="button secondary new-task-shortcut" onClick={focusForm}>
            <Plus size={18} aria-hidden="true" />
            New task
          </button>
        </header>
        <Statistics statistics={result?.statistics} />
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {notice}
        </div>
        <div className="workspace-grid">
          <div className="list-column">
            <TaskList
              tasks={result?.data ?? []}
              statistics={result?.statistics}
              filter={filter}
              onFilter={setFilter}
              loading={loading}
              refreshing={refreshing}
              error={error}
              refreshError={refreshError}
              actionError={actionError}
              onDismissError={dismissTaskError}
              busyId={busyId}
              onComplete={completeTask}
              onDelete={(task) => {
                setDeleteTarget(task);
                setDeleteError('');
              }}
              onRetry={refresh}
              onNewTask={focusForm}
            />
          </div>
          <TaskForm onCreate={createTask} />
        </div>
      </main>
      {deleteTarget && (
        <DeleteDialog
          task={deleteTarget}
          deleting={busyId === deleteTarget.id}
          error={deleteError}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={deleteTask}
        />
      )}
    </>
  );
}
