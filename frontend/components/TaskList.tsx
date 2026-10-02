import {
  ArrowDownWideNarrow,
  Check,
  CheckCheck,
  CircleAlert,
  ClipboardList,
  LoaderCircle,
  Plus,
  RotateCw,
  Trash2,
} from 'lucide-react';
import type { Filter, Statistics, Task } from '../types';

interface Props {
  tasks: Task[];
  statistics: Statistics | undefined;
  filter: Filter;
  onFilter: (filter: Filter) => void;
  loading: boolean;
  error: string | null;
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
    error,
    busyId,
    onComplete,
    onDelete,
    onRetry,
    onNewTask,
  } = props;
  const emptyCopy =
    filter === 'completed'
      ? ['Good things are in progress', 'Complete your first task and it will appear here.']
      : filter === 'pending' && (statistics?.total ?? 0) > 0
        ? ['All caught up. Nicely done!', 'Take a breath. You’ve earned a little space.']
        : [
            'A fresh page. A little possibility.',
            'Add your first task and give your day some direction.',
          ];

  return (
    <section className="panel task-list-panel" aria-labelledby="task-list-heading">
      <div className="list-heading">
        <div>
          <h2 id="task-list-heading" tabIndex={-1}>
            Your tasks <span className="heading-count">{statistics?.total ?? '—'}</span>
          </h2>
          <p>A clear view of what’s next.</p>
        </div>
        <span className="sort-label">
          <ArrowDownWideNarrow size={15} aria-hidden="true" />
          Priority first
        </span>
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
      <div className="task-list-content" aria-busy={loading}>
        {loading ? (
          <div className="loading-state" role="status" aria-label="Loading tasks">
            {[1, 2, 3, 4].map((value) => (
              <div className="task-skeleton" key={value}>
                <span />
                <div>
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
            <h3>Let’s try that again</h3>
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
                    <h3>{task.title}</h3>
                    <span className={`priority-badge ${task.priority}`}>
                      <span aria-hidden="true" />
                      {task.priority}
                    </span>
                  </div>
                  {task.description && <p className="task-description">{task.description}</p>}
                  <div className="task-meta">
                    <span className={`status-label ${task.status}`}>
                      {task.status === 'completed' ? (
                        <CheckCheck size={13} aria-hidden="true" />
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
                      className="complete-button"
                      aria-label={`Complete ${task.title}`}
                      disabled={busyId !== null}
                      onClick={() => onComplete(task)}
                    >
                      {busyId === task.id ? (
                        <LoaderCircle size={15} className="spin" aria-hidden="true" />
                      ) : (
                        <Check size={15} aria-hidden="true" />
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
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="list-footer">
        <span>
          {loading
            ? 'Getting things in order…'
            : error
              ? 'Your tasks will be here when the connection returns.'
              : `Showing ${tasks.length} ${filter === 'all' ? '' : `${filter} `}task${tasks.length === 1 ? '' : 's'}`}
        </span>
        <span>High → low · Oldest first</span>
      </div>
    </section>
  );
}
