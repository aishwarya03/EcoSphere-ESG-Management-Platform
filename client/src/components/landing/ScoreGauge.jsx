import { motion } from 'motion/react';
import { useCountUp } from '../../hooks/useCountUp';

const RADIUS = 84;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const subScores = [
  { label: 'Environmental', value: 84, color: '#10b981' },
  { label: 'Social', value: 73, color: '#38bdf8' },
  { label: 'Governance', value: 91, color: '#fbbf24' },
];

const OVERALL_SCORE = 87;

const ScoreGauge = () => {
  const score = useCountUp(OVERALL_SCORE, { duration: 1800, start: true });
  const offset = CIRCUMFERENCE * (1 - score / 100);

  return (
    <div className="glass flex flex-col gap-8 rounded-2xl p-7 sm:flex-row sm:items-center">
      <div className="relative mx-auto h-48 w-48 flex-shrink-0">
        <svg viewBox="0 0 192 192" className="h-full w-full -rotate-90">
          <circle
            cx="96"
            cy="96"
            r={RADIUS}
            fill="none"
            stroke="rgba(248,250,252,0.08)"
            strokeWidth="12"
          />
          <motion.circle
            cx="96"
            cy="96"
            r={RADIUS}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.1 }}
          />
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-4xl font-bold text-ink-50">
            {Math.round(score)}
          </span>
          <span className="text-xs uppercase tracking-wider text-ink-400">
            Overall ESG
          </span>
          <span className="mt-1 rounded-full bg-primary-500/15 px-2.5 py-0.5 text-xs font-semibold text-primary-400">
            A+
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {subScores.map((s, i) => (
          <div key={s.label}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-ink-200">{s.label}</span>
              <span className="font-semibold text-ink-50">{s.value}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: s.color }}
                initial={{ width: 0 }}
                animate={{ width: `${s.value}%` }}
                transition={{ duration: 1.1, delay: 0.3 + i * 0.15, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreGauge;
