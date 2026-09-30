import { LoaderCircle, Trash2, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { Task } from '../types';

interface Props {
  task: Task;
  deleting: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteDialog({ task, deleting, error, onCancel, onConfirm }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog?.showModal();
    cancelRef.current?.focus();
    return () => {
      dialog?.close();
      previousFocus?.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="delete-dialog"
      aria-labelledby="delete-heading"
      aria-describedby="delete-description"
      onCancel={(event) => {
        event.preventDefault();
        if (!deleting) onCancel();
      }}
    >
      <button
        className="icon-button dialog-close"
        aria-label="Close delete confirmation"
        onClick={onCancel}
        disabled={deleting}
      >
        <X size={19} aria-hidden="true" />
      </button>
      <div className="delete-dialog-icon">
        <Trash2 size={24} aria-hidden="true" />
      </div>
      <h2 id="delete-heading">Let this task go?</h2>
      <p id="delete-description">
        “<strong>{task.title}</strong>” will be permanently deleted. This can’t be undone.
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="dialog-actions">
        <button ref={cancelRef} className="button secondary" onClick={onCancel} disabled={deleting}>
          Keep task
        </button>
        <button className="button danger" onClick={onConfirm} disabled={deleting}>
          {deleting && <LoaderCircle size={16} className="spin" aria-hidden="true" />}
          {deleting ? 'Deleting…' : 'Delete task'}
        </button>
      </div>
    </dialog>
  );
}
