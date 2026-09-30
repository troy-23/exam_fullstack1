import { ArrowUpRight, CheckCheck, CircleDashed, Layers3 } from 'lucide-react';
import type { Statistics as TaskStatistics } from '../types';

export function Statistics({ statistics }: { statistics: TaskStatistics | undefined }) {
  const percentage = statistics?.total
    ? Math.round((statistics.completed / statistics.total) * 100)
    : 0;
  const cards = [
    {
      label: 'Total tasks',
      value: statistics?.total,
      icon: Layers3,
      tone: 'blue',
      detail: 'Everything in one place',
    },
    {
      label: 'In progress',
      value: statistics?.pending,
      icon: CircleDashed,
      tone: 'amber',
      detail: 'One step at a time',
    },
    {
      label: 'Completed',
      value: statistics?.completed,
      icon: CheckCheck,
      tone: 'green',
      detail: 'Look at you go',
    },
  ];

  return (
    <section className="statistics" aria-label="Task statistics">
      {cards.map(({ label, value, icon: Icon, tone, detail }) => (
        <div className="stat-card" key={label}>
          <div className="stat-top">
            <span>{label}</span>
            <span className={`stat-icon ${tone}`}>
              <Icon size={18} aria-hidden="true" />
            </span>
          </div>
          <strong className="stat-value">{value ?? '—'}</strong>
          <span className="stat-detail">{detail}</span>
        </div>
      ))}
      <div className="stat-card progress-card">
        <div className="stat-top">
          <span>Completion rate</span>
          <ArrowUpRight size={19} aria-hidden="true" />
        </div>
        <strong className="stat-value">
          {statistics ? percentage : '—'}
          <span>%</span>
        </strong>
        <div
          className="progress-track"
          role="progressbar"
          aria-label="Tasks completed"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ width: `${percentage}%` }} />
        </div>
        <span className="stat-detail">A little progress adds up.</span>
      </div>
    </section>
  );
}
