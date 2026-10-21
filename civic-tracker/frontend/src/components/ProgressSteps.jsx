import { FLOW, STATUS_MAP } from '../constants.js';

export default function ProgressSteps({ status }) {
  if (status === 'REJECTED') {
    return <div className="progress-note rejected">Closed without action</div>;
  }

  const current = FLOW.indexOf(status);
  return (
    <div className="progress" aria-label={`Progress: ${STATUS_MAP[status].label}`}>
      {FLOW.map((step, i) => (
        <div key={step} className="progress-step">
          <div className={`bar ${i <= current ? 'done' : ''}`} />
          <span className={`step-label ${i === current ? 'current' : ''}`}>{STATUS_MAP[step].label}</span>
        </div>
      ))}
    </div>
  );
}
