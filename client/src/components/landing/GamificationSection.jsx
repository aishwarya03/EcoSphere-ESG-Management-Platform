import { motion } from 'motion/react';
import { Medal, Award, TreePine, Recycle, Sparkle } from 'lucide-react';

const badges = [
  { icon: Medal, name: 'Green Warrior', color: '#34d399' },
  { icon: Award, name: 'Carbon Hero', color: '#fbbf24' },
  { icon: TreePine, name: 'Eco Champion', color: '#38bdf8' },
  { icon: Recycle, name: 'Sustainability Master', color: '#10b981' },
];

const sparklePositions = [
  { top: '-6px', left: '10%' },
  { top: '10%', right: '-8px' },
  { bottom: '-6px', left: '30%' },
  { top: '40%', left: '-8px' },
];

const BadgeCard = ({ icon: Icon, name, color }) => (
  <motion.div
    initial="rest"
    whileHover="hover"
    animate="rest"
    className="glass relative flex flex-col items-center rounded-2xl px-6 py-9 text-center"
  >
    {sparklePositions.map((pos, i) => (
      <motion.span
        key={i}
        variants={{ rest: { opacity: 0, scale: 0.4 }, hover: { opacity: 1, scale: 1 } }}
        transition={{ duration: 0.4, delay: i * 0.06 }}
        style={{ position: 'absolute', color, ...pos }}
      >
        <Sparkle size={14} />
      </motion.span>
    ))}

    <motion.span
      variants={{ rest: { rotate: 0, scale: 1 }, hover: { rotate: 8, scale: 1.1 } }}
      transition={{ duration: 0.4 }}
      className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
      style={{
        backgroundColor: `${color}22`,
        color,
      }}
    >
      <motion.span
        variants={{ rest: { boxShadow: `0 0 0px ${color}00` }, hover: { boxShadow: `0 0 28px ${color}66` } }}
        transition={{ duration: 0.4 }}
        className="flex h-16 w-16 items-center justify-center rounded-full"
      >
        <Icon size={28} />
      </motion.span>
    </motion.span>

    <span className="font-heading text-sm font-semibold text-ink-50">{name}</span>
  </motion.div>
);

const GamificationSection = () => {
  return (
    <section id="gamification" className="mx-auto max-w-7xl px-6 py-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5 }}
        className="mx-auto mb-14 max-w-2xl text-center"
      >
        <span className="mb-4 inline-flex items-center rounded-full bg-accent-500/15 px-3 py-1 text-xs font-semibold text-accent-400">
          Gamification
        </span>
        <h2 className="font-heading text-3xl font-bold tracking-tight text-ink-50 md:text-4xl">
          Sustainability, worth competing for
        </h2>
        <p className="mt-4 text-lg text-ink-400">
          Auto-awarded badges turn ESG milestones into something employees
          show off.
        </p>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {badges.map((badge, i) => (
          <motion.div
            key={badge.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <BadgeCard {...badge} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default GamificationSection;
