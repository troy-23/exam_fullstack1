import { CircleCheck, Plus, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { tasksApi } from './api';
import { DeleteDialog } from './components/DeleteDialog';
import { Statistics } from './components/Statistics';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import type { Filter, Task, TaskInput } from './types';
import { useTasks } from './useTasks';

export default function App() {
  const [filter, setFilter] = useState<Filter>('all');
  const { result, loading, error, refresh } = useTasks(filter);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const mutationLock = useRef(false);

  function focusForm() {
    document.getElementById('task-title')?.focus();
  }

  async function createTask(input: TaskInput) {
    setNotice('');
    await tasksApi.create(input);
    setNotice(
      filter === 'completed' ? 'Task added. View it under All tasks or Pending.' : 'Task added.',
    );
    refresh();
  }

  async function completeTask(task: Task) {
    if (mutationLock.current) return;
    mutationLock.current = true;
    setBusyId(task.id);
    setNotice('');
    setActionError('');
    try {
      await tasksApi.complete(task.id);
      setNotice('Task completed.');
      refresh();
    } catch (failure) {
      setActionError(
        failure instanceof Error ? failure.message : 'Unable to complete the task. Try again.',
      );
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
        <div className="toast-region" role="status" aria-live="polite" aria-atomic="true">
          {notice && (
            <div className="toast">
              <CircleCheck size={20} aria-hidden="true" />
              <span>{notice}</span>
              <button
                className="icon-button"
                aria-label="Dismiss notification"
                onClick={() => setNotice('')}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
        <div className="workspace-grid">
          <div className="list-column">
            {actionError && (
              <div className="action-error" role="alert">
                <p>{actionError}</p>
                <button
                  className="icon-button"
                  aria-label="Dismiss error"
                  onClick={() => setActionError('')}
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
            )}
            <TaskList
              tasks={result?.data ?? []}
              statistics={result?.statistics}
              filter={filter}
              onFilter={setFilter}
              loading={loading}
              error={error}
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
