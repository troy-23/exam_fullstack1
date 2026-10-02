import { Flag, LoaderCircle, Plus } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { ApiError } from '../api';
import type { Priority, TaskInput } from '../types';

interface Props {
  onCreate: (task: TaskInput) => Promise<void>;
}

export function TaskForm({ onCreate }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);
  const inFlight = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    setError('');
    setErrors({});

    if (!title.trim()) {
      setErrors({ title: 'Title is required.' });
      titleRef.current?.focus();
      return;
    }

    inFlight.current = true;
    setSubmitting(true);
    try {
      await onCreate({ title: title.trim(), description: description.trim(), priority });
      setTitle('');
      setDescription('');
      setPriority('medium');
      requestAnimationFrame(() => titleRef.current?.focus());
    } catch (failure) {
      const apiError =
        failure instanceof ApiError
          ? failure
          : new ApiError('Your task couldn’t be saved. Please try again.');
      setErrors(apiError.fields);
      setError(apiError.message);
      if (apiError.fields.title) requestAnimationFrame(() => titleRef.current?.focus());
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  return (
    <aside className="form-column" aria-labelledby="new-task-heading">
      <section className="panel task-form-panel" id="new-task">
        <div className="form-heading">
          <h2 id="new-task-heading">Add task</h2>
        </div>
        <form onSubmit={submit} noValidate>
          <fieldset disabled={submitting} className="form-fields">
            <div className="field">
              <label htmlFor="task-title">
                Task title <span aria-hidden="true">*</span>
              </label>
              <input
                ref={titleRef}
                id="task-title"
                name="title"
                value={title}
                maxLength={255}
                required
                placeholder="Task title"
                autoComplete="off"
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? 'title-error' : undefined}
                onChange={(event) => setTitle(event.target.value)}
              />
              {errors.title && (
                <p className="field-error" id="title-error">
                  {errors.title}
                </p>
              )}
            </div>
            <div className="field">
              <label htmlFor="task-description">
                Description <span className="optional">Optional</span>
              </label>
              <textarea
                id="task-description"
                name="description"
                value={description}
                maxLength={5000}
                rows={4}
                placeholder="Add details"
                aria-invalid={Boolean(errors.description)}
                aria-describedby={errors.description ? 'description-error' : undefined}
                onChange={(event) => setDescription(event.target.value)}
              />
              {errors.description && (
                <p className="field-error" id="description-error">
                  {errors.description}
                </p>
              )}
            </div>
            <fieldset
              className="priority-field"
              aria-describedby={errors.priority ? 'priority-error' : undefined}
            >
              <legend>Priority</legend>
              <div className="priority-options">
                {(['low', 'medium', 'high'] as const).map((value) => (
                  <label className={`priority-option ${value}`} key={value}>
                    <input
                      type="radio"
                      name="priority"
                      value={value}
                      checked={priority === value}
                      onChange={() => setPriority(value)}
                    />
                    <span>
                      <Flag size={14} aria-hidden="true" />
                      {value}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            {errors.priority && (
              <p className="field-error" id="priority-error">
                {errors.priority}
              </p>
            )}
            <button className="button primary add-task-button" type="submit">
              {submitting ? (
                <LoaderCircle className="spin" size={18} aria-hidden="true" />
              ) : (
                <Plus size={18} aria-hidden="true" />
              )}
              {submitting ? 'Adding task…' : 'Add task'}
            </button>
          </fieldset>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </form>
      </section>
    </aside>
  );
}
