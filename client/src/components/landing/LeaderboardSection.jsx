import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';

const departments = [
  { rank: 1, name: 'Engineering', score: 92 },
  { rank: 2, name: 'Marketing', score: 88 },
  { rank: 3, name: 'HR', score: 86 },
  { rank: 4, name: 'Finance', score: 81 },
];

const rankColor = {
  1: 'text-accent-400',
  2: 'text-ink-200',
  3: 'text-primary-400',
  4: 'text-ink-400',
};

const LeaderboardSection = () => {
  return (
    <section className="mx-auto max-w-3xl px-6 py-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <h2 className="font-heading text-3xl font-bold tracking-tight text-ink-50 md:text-4xl">
          Department leaderboard
        </h2>
        <p className="mt-4 text-lg text-ink-400">
          Live ESG scores, ranked across your organization.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass divide-y divide-border-subtle rounded-2xl"
      >
        {departments.map((d, i) => (
          <div key={d.rank} className="flex items-center gap-4 px-6 py-4">
            <span className={`flex w-8 items-center gap-1 font-heading text-lg font-bold ${rankColor[d.rank]}`}>
              {d.rank === 1 ? <Trophy size={18} /> : `#${d.rank}`}
            </span>
            <span className="flex-1 font-medium text-ink-50">{d.name}</span>
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-blue-400"
                initial={{ width: 0 }}
                whileInView={{ width: `${d.score}%` }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 1, delay: 0.2 + i * 0.12, ease: 'easeOut' }}
              />
            </div>
            <span className="w-8 text-right font-semibold text-ink-200">{d.score}</span>
          </div>
        ))}
      </motion.div>
    </section>
  );
};

export default LeaderboardSection;
