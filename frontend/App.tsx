import {
  ArrowUpRight,
  Check,
  CircleCheck,
  LayoutDashboard,
  ListTodo,
  Plus,
  Sparkles,
  X,
} from 'lucide-react';
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
              <span className="art-star">✦</span>
              <span className="art-dot" />
            </div>
            <h2>
              Small steps.
              <br />
              Good things.
            </h2>
            <p>
              A little more clarity.
              <br />A little more done.
            </p>
            <div className="sidebar-divider" />
            <span className="sidebar-signoff">Made for your everyday.</span>
          </div>
        </aside>
        <div className="main-shell">
          <header className="topbar">
            <div className="mobile-brand">
              <Brand />
            </div>
            <div className="breadcrumb">
              <LayoutDashboard size={16} aria-hidden="true" />
              <span>Workspace</span>
              <span className="breadcrumb-slash">/</span>
              <strong>Overview</strong>
            </div>
            <div className="topbar-right">
              <span className="today-label">
                <span />
                {date}
              </span>
              <span className="profile-mark" aria-label="Personal workspace">
                S
              </span>
            </div>
          </header>
          <main id="main" tabIndex={-1}>
            <section className="page-heading">
              <div>
                <div className="eyebrow">
                  <span />A LITTLE FOCUS GOES A LONG WAY
                </div>
                <h1>
                  Make room for <span>progress.</span>
                </h1>
                <p>Your tasks, a clearer head, and a good place to start.</p>
              </div>
              <button className="button primary new-task-shortcut" onClick={focusForm}>
                <Plus size={18} aria-hidden="true" />
                New task
              </button>
            </section>
            <Statistics statistics={result?.statistics} />
            <div className="section-intro">
              <span>
                <ListTodo size={17} aria-hidden="true" />
                Let’s get a little more done.
              </span>
              <span className="intro-detail">
                <Sparkles size={14} aria-hidden="true" />
                Your pace. Your progress.
              </span>
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
                <div className="list-note">
                  <CircleCheck size={15} aria-hidden="true" />
                  <span>Less juggling. More doing.</span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </div>
              </div>
              <TaskForm onCreate={createTask} />
            </div>
            <footer className="page-footer">
              <span>Simple Task Tracker</span>
              <span>A little more done. A little more you.</span>
            </footer>
          </main>
        </div>
      </div>
      <div className="toast-region" role="status" aria-live="polite" aria-atomic="true">
        {notice && (
          <div className="toast">
            <CircleCheck size={19} aria-hidden="true" />
            <span>{notice}</span>
            <button
              className="icon-button"
              aria-label="Dismiss notification"
              onClick={() => setNotice('')}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        )}
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
