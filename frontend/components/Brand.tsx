import { Check } from 'lucide-react';

export function Brand() {
  return (
    <a className="brand" href="#main" aria-label="Simple Task Tracker home">
      <span className="brand-mark">
        <Check size={25} strokeWidth={3} aria-hidden="true" />
      </span>
      <span>
        simple<span className="brand-subtitle">TASK TRACKER</span>
      </span>
    </a>
  );
}
