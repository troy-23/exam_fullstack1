import {
  Check,
  CheckCheck,
  CircleAlert,
  ClipboardList,
  LoaderCircle,
  Plus,
  RotateCw,
  Trash2,
  X,
} from 'lucide-react';
import type { Filter, Statistics, Task, TaskActionError } from '../types';

interface Props {
  tasks: Task[];
  statistics: Statistics | undefined;
  filter: Filter;
  onFilter: (filter: Filter) => void;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refreshError: string | null;
  actionError: TaskActionError | null;
  onDismissError: () => void;
  busyId: number | null;
  onComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
  onRetry: () => void;
  onNewTask: () => void;
}

const dateFormat = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' });
const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All tasks' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

export function TaskList(props: Props) {
  const {
    tasks,
    statistics,
    filter,
    onFilter,
    loading,
    refreshing,
    error,
    refreshError,
    actionError,
    onDismissError,
    busyId,
    onComplete,
    onDelete,
    onRetry,
    onNewTask,
  } = props;
  const emptyCopy =
    filter === 'completed'
      ? ['No completed tasks', 'Completed tasks will appear here.']
      : filter === 'pending' && (statistics?.total ?? 0) > 0
        ? ['No pending tasks', 'All tasks are completed.']
        : ['No tasks yet', 'Add a task to get started.'];

  return (
    <section className="panel task-list-panel" aria-labelledby="task-list-heading">
      <div className="list-heading">
        <h2 id="task-list-heading" tabIndex={-1}>
          Your tasks
        </h2>
      </div>
      <div className="list-toolbar">
        <div className="filters" role="group" aria-label="Filter tasks by status">
          {filters.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              className={filter === value ? 'filter active' : 'filter'}
              onClick={() => onFilter(value)}
            >
              {label}
              <span>{statistics ? statistics[value === 'all' ? 'total' : value] : '—'}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="task-list-content" aria-busy={loading || refreshing}>
        {loading ? (
          <div className="loading-state" role="status" aria-label="Loading tasks">
            {[1, 2, 3, 4].map((value) => (
              <div className="task-skeleton" key={value}>
                <div>
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            ))}
            <span className="sr-only">Loading your tasks…</span>
          </div>
        ) : error ? (
          <div className="empty-state error-state" role="alert">
            <div className="empty-icon">
              <CircleAlert size={28} aria-hidden="true" />
            </div>
            <h3>Unable to load tasks</h3>
            <p>{error}</p>
            <button className="button secondary" onClick={onRetry}>
              <RotateCw size={16} aria-hidden="true" />
              Retry
            </button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {filter === 'pending' ? (
                <CheckCheck size={30} aria-hidden="true" />
              ) : (
                <ClipboardList size={30} aria-hidden="true" />
              )}
            </div>
            <h3>{emptyCopy[0]}</h3>
            <p>{emptyCopy[1]}</p>
            {filter !== 'completed' && (
              <button className="button secondary" onClick={onNewTask}>
                <Plus size={16} aria-hidden="true" />
                Create a task
              </button>
            )}
          </div>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id} className={`task-row ${task.status}`} data-testid="task-row">
                <div className="task-content">
                  <div className="task-title-line">
                    <h3 id={`task-heading-${task.id}`} tabIndex={-1}>
                      {task.title}
                    </h3>
                    <span className={`priority-badge ${task.priority}`}>
                      <span aria-hidden="true" />
                      {task.priority}
                    </span>
                  </div>
                  {task.description && <p className="task-description">{task.description}</p>}
                  <div className="task-meta">
                    <span className={`status-label ${task.status}`}>
                      {task.status === 'completed' ? (
                        <CheckCheck size={14} aria-hidden="true" />
                      ) : (
                        <span className="status-dot" aria-hidden="true" />
                      )}
                      {task.status === 'completed' ? 'Completed' : 'Pending'}
                    </span>
                    <span className="meta-divider" aria-hidden="true">
                      ·
                    </span>
                    <time dateTime={task.created_at}>
                      Added {dateFormat.format(new Date(task.created_at))}
                    </time>
                  </div>
                </div>
                <div className="task-actions">
                  {task.status === 'pending' && (
                    <button
                      id={`task-complete-${task.id}`}
                      className="complete-button"
                      aria-label={`Complete ${task.title}`}
                      aria-describedby={
                        actionError?.taskId === task.id ? `task-error-${task.id}` : undefined
                      }
                      disabled={busyId !== null}
                      onClick={() => onComplete(task)}
                    >
                      {busyId === task.id ? (
                        <LoaderCircle size={16} className="spin" aria-hidden="true" />
                      ) : (
                        <Check size={16} aria-hidden="true" />
                      )}
                      <span>Complete</span>
                    </button>
                  )}
                  <button
                    className="delete-button"
                    aria-label={`Delete ${task.title}`}
                    disabled={busyId !== null}
                    onClick={() => onDelete(task)}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                    <span>Delete</span>
                  </button>
                  {actionError?.taskId === task.id && (
                    <div className="action-error" role="alert" id={`task-error-${task.id}`}>
                      <p>{actionError.message}</p>
                      <button
                        className="icon-button"
                        aria-label="Dismiss task error"
                        onClick={onDismissError}
                      >
                        <X size={16} aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {refreshError && (
        <div className="refresh-error" role="alert">
          <p>{refreshError} Showing the last loaded tasks.</p>
          <button className="button secondary" onClick={onRetry}>
            <RotateCw size={16} aria-hidden="true" />
            Retry
          </button>
        </div>
      )}
      <div className="list-footer">
        <span>
          {loading || refreshing
            ? refreshing
              ? 'Updating tasks…'
              : 'Loading tasks…'
            : error
              ? 'Check your connection and retry.'
              : `Showing ${tasks.length} ${filter === 'all' ? '' : `${filter} `}task${tasks.length === 1 ? '' : 's'}`}
        </span>
        <span>High → low · Oldest first</span>
      </div>
    </section>
  );
}
