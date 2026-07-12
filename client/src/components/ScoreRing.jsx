import { motion } from 'motion/react';
import { useCountUp } from '../hooks/useCountUp';

const grade = (score) => {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  return 'D';
};

const ScoreRing = ({ score = 0, size = 160, label = 'Overall ESG', strokeWidth = 12 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animated = useCountUp(score, { duration: 1200, start: true });
  const offset = circumference * (1 - Math.min(100, Math.max(0, animated)) / 100);
  const center = size / 2;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(248,250,252,0.08)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#scoreRingGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.1 }}
        />
        <defs>
          <linearGradient id="scoreRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-3xl font-bold text-ink-50">{Math.round(animated)}</span>
        <span className="text-xs uppercase tracking-wider text-ink-400">{label}</span>
        <span className="mt-1 rounded-full bg-primary-500/15 px-2 py-0.5 text-xs font-semibold text-primary-400">
          {grade(score)}
        </span>
      </div>
    </div>
  );
};

export default ScoreRing;
