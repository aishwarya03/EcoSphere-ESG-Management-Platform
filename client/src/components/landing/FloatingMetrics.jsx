import { motion } from 'motion/react';
import { Leaf, Users, FileCheck2, Trophy } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';

const metrics = [
  { icon: Leaf, value: 12450, suffix: ' kg', label: 'CO₂ Saved', color: 'text-primary-400' },
  { icon: Users, value: 842, suffix: '', label: 'Employees Engaged', color: 'text-blue-400' },
  { icon: FileCheck2, value: 98, suffix: '%', label: 'Compliance', color: 'text-accent-400' },
  { icon: Trophy, value: 148, suffix: '', label: 'Challenges Completed', color: 'text-primary-400' },
];

const MetricChip = ({ icon: Icon, value, suffix, label, color, delay }) => {
  const count = useCountUp(value, { duration: 1600, start: true });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="glass flex items-center gap-3 rounded-xl px-4 py-3"
    >
      <motion.span
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.5 + delay, repeat: Infinity, ease: 'easeInOut' }}
        className={`flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 ${color}`}
      >
        <Icon size={18} />
      </motion.span>
      <div>
        <div className="font-heading text-lg font-bold text-ink-50">
          {Math.round(count).toLocaleString()}
          {suffix}
        </div>
        <div className="text-xs text-ink-400">{label}</div>
      </div>
    </motion.div>
  );
};

const FloatingMetrics = () => {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {metrics.map((m, i) => (
        <MetricChip key={m.label} {...m} delay={0.6 + i * 0.12} />
      ))}
    </div>
  );
};

export default FloatingMetrics;
