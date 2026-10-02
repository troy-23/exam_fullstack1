import type { Statistics as TaskStatistics } from '../types';

export function Statistics({ statistics }: { statistics: TaskStatistics | undefined }) {
  const percentage = statistics?.total
    ? Math.round((statistics.completed / statistics.total) * 100)
    : 0;
  const cards = [
    { label: 'Total tasks', value: statistics?.total },
    { label: 'Pending', value: statistics?.pending },
    { label: 'Completed', value: statistics?.completed },
  ];

  return (
    <section className="statistics" aria-label="Task statistics">
      {cards.map(({ label, value }) => (
        <div className="stat-card" key={label}>
          <span className="stat-top">{label}</span>
          <strong className="stat-value">{value ?? '—'}</strong>
        </div>
      ))}
      <div className="stat-card">
        <span className="stat-top">Completion rate</span>
        <strong className="stat-value">
          {statistics ? percentage : '—'}
          <span>%</span>
        </strong>
        <div
          className="progress-track"
          role="progressbar"
          aria-label="Tasks completed"
          aria-valuenow={statistics ? percentage : undefined}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ transform: `scaleX(${percentage / 100})` }} />
        </div>
      </div>
    </section>
  );
}
