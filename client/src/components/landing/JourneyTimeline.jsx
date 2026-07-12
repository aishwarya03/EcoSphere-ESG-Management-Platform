import { motion } from 'motion/react';
import { Settings, Calculator, Users, ShieldCheck, BarChart3, FileText } from 'lucide-react';

const steps = [
  { icon: Settings, label: 'Operations' },
  { icon: Calculator, label: 'Carbon Calculation' },
  { icon: Users, label: 'Employee Participation' },
  { icon: ShieldCheck, label: 'Governance' },
  { icon: BarChart3, label: 'Analytics' },
  { icon: FileText, label: 'Reports' },
];

const JourneyTimeline = () => {
  return (
    <section id="journey" className="mx-auto max-w-7xl px-6 py-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5 }}
        className="mx-auto mb-16 max-w-2xl text-center"
      >
        <h2 className="font-heading text-3xl font-bold tracking-tight text-ink-50 md:text-4xl">
          One journey, fully connected
        </h2>
        <p className="mt-4 text-lg text-ink-400">
          From daily operations to board-ready reports, automatically.
        </p>
      </motion.div>

      <div className="relative flex flex-col gap-10 md:flex-row md:items-start md:justify-between md:gap-4">
        <div className="absolute left-6 top-6 hidden h-px w-[calc(100%-3rem)] bg-border-subtle md:block" />
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          style={{ transformOrigin: 'left' }}
          className="absolute left-6 top-6 hidden h-px w-[calc(100%-3rem)] bg-gradient-to-r from-primary-500 via-blue-400 to-accent-500 md:block"
        />

        {steps.map(({ icon: Icon, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="relative z-10 flex flex-1 flex-col items-center text-center"
          >
            <motion.span
              initial={{ backgroundColor: 'rgba(248,250,252,0.05)', color: '#64748b' }}
              whileInView={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#34d399' }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.4, delay: i * 0.15 + 0.1 }}
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-border-subtle"
            >
              <Icon size={20} />
            </motion.span>
            <span className="max-w-[7rem] text-xs font-medium text-ink-300">
              {label}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default JourneyTimeline;
