import { CalendarDays, Check, CircleCheck, LayoutDashboard, Plus, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { tasksApi } from './api';
import { Brand } from './components/Brand';
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
      filter === 'completed'
        ? 'Task added. Find it in All tasks or Pending.'
        : 'Task added. A little closer already.',
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
      setNotice('Task completed. That’s one thing off your mind.');
      refresh();
    } catch (failure) {
      setActionError(
        failure instanceof Error ? failure.message : 'The task couldn’t be completed. Try again.',
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
      setNotice('Task deleted. Room for what’s next.');
      refresh();
    } catch (failure) {
      setDeleteError(
        failure instanceof Error ? failure.message : 'The task couldn’t be deleted. Try again.',
      );
    } finally {
      mutationLock.current = false;
      setBusyId(null);
    }
  }

  const date = new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to your tasks
      </a>
      <div className="app-shell">
        <aside className="sidebar">
          <Brand />
          <div className="workspace-label">YOUR WORKSPACE</div>
          <nav aria-label="Workspace">
            <a className="sidebar-link selected" href="#main" aria-current="page">
              <LayoutDashboard size={18} aria-hidden="true" />
              Overview
              <span className="nav-dot" />
            </a>
          </nav>
          <div className="sidebar-bottom">
            <div className="sidebar-art" aria-hidden="true">
              <div className="art-orbit" />
              <span className="art-check">
                <Check size={30} strokeWidth={3} />
              </span>
              <span className="art-dot" />
            </div>
            <h2>
              Small steps.
              <br />
              Big progress.
            </h2>
            <p>
              Start with one task.
              <br />
              Build from there.
            </p>
            <div className="sidebar-divider" />
            <span className="sidebar-signoff">A little more done, every day.</span>
          </div>
        </aside>
        <div className="main-shell">
          <header className="topbar">
            <div className="mobile-brand">
              <Brand />
            </div>
            <div className="breadcrumb">
              <LayoutDashboard size={16} aria-hidden="true" />
              <strong>Your workspace</strong>
            </div>
            <div className="topbar-right">
              <span className="today-label">
                <CalendarDays size={16} aria-hidden="true" />
                {date}
              </span>
            </div>
          </header>
          <main id="main" tabIndex={-1}>
            <section className="page-heading">
              <div>
                <div className="eyebrow">
                  <span />A FRESH PERSPECTIVE ON YOUR DAY
                </div>
                <h1>
                  Make room for <span>progress.</span>
                </h1>
                <p>Plan your day. Set your priorities. Take the next step.</p>
              </div>
              <button className="button primary new-task-shortcut" onClick={focusForm}>
                <Plus size={18} aria-hidden="true" />
                New task
              </button>
            </section>
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
            <Statistics statistics={result?.statistics} />
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
            <footer className="page-footer">
              <span>Simple Task Tracker</span>
              <span>Small steps. Steady progress.</span>
            </footer>
          </main>
        </div>
      </div>
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
