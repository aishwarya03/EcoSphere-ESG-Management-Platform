import { motion } from 'motion/react';
import { Leaf, Users, ShieldCheck } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

const carbonTrend = [{ v: 70 }, { v: 60 }, { v: 64 }, { v: 50 }, { v: 40 }, { v: 30 }];

const socialNodes = [
  { cx: 30, cy: 20 }, { cx: 70, cy: 15 }, { cx: 90, cy: 45 },
  { cx: 60, cy: 60 }, { cx: 20, cy: 55 }, { cx: 45, cy: 38 },
];
const socialLines = [[5, 0], [5, 1], [5, 2], [5, 3], [5, 4]];

const governanceChecks = ['Policy acknowledged', 'Audit passed', 'Issue resolved'];

const EnvironmentalVisual = () => (
  <motion.div variants={{ hover: { opacity: 1, height: 64 } }} initial={{ opacity: 0, height: 0 }} className="overflow-hidden">
    <ResponsiveContainer width="100%" height={64}>
      <AreaChart data={carbonTrend}>
        <defs>
          <linearGradient id="pillarCarbon" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke="#34d399" strokeWidth={2} fill="url(#pillarCarbon)" />
      </AreaChart>
    </ResponsiveContainer>
  </motion.div>
);

const SocialVisual = () => (
  <motion.svg
    variants={{ hover: { opacity: 1, height: 64 } }}
    initial={{ opacity: 0, height: 0 }}
    viewBox="0 0 100 70"
    className="w-full overflow-visible"
  >
    {socialLines.map(([a, b], i) => (
      <motion.line
        key={i}
        x1={socialNodes[a].cx} y1={socialNodes[a].cy}
        x2={socialNodes[b].cx} y2={socialNodes[b].cy}
        stroke="#38bdf8" strokeWidth="1"
        variants={{ hover: { pathLength: 1, opacity: 0.6 } }}
        initial={{ pathLength: 0, opacity: 0 }}
        transition={{ duration: 0.6, delay: i * 0.08 }}
      />
    ))}
    {socialNodes.map((n, i) => (
      <motion.circle
        key={i}
        cx={n.cx} cy={n.cy} r="4"
        fill="#38bdf8"
        variants={{ hover: { scale: 1, opacity: 1 } }}
        initial={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.4, delay: i * 0.06 }}
      />
    ))}
  </motion.svg>
);

const GovernanceVisual = () => (
  <motion.div variants={{ hover: { opacity: 1, height: 'auto' } }} initial={{ opacity: 0, height: 0 }} className="space-y-1.5 overflow-hidden">
    {governanceChecks.map((label, i) => (
      <motion.div
        key={label}
        variants={{ hover: { opacity: 1, x: 0 } }}
        initial={{ opacity: 0, x: -8 }}
        transition={{ duration: 0.35, delay: 0.1 + i * 0.12 }}
        className="flex items-center gap-2 text-xs text-ink-300"
      >
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent-500/20 text-accent-400">
          ✓
        </span>
        {label}
      </motion.div>
    ))}
  </motion.div>
);

const pillars = [
  {
    icon: Leaf,
    iconClass: 'bg-primary-500/15 text-primary-400',
    title: 'Environmental',
    body: 'Carbon accounting calculated automatically from operational data.',
    Visual: EnvironmentalVisual,
  },
  {
    icon: Users,
    iconClass: 'bg-blue-400/15 text-blue-400',
    title: 'Social',
    body: 'CSR, diversity and employee engagement, all measured.',
    Visual: SocialVisual,
  },
  {
    icon: ShieldCheck,
    iconClass: 'bg-accent-500/15 text-accent-400',
    title: 'Governance',
    body: 'Policies, audits and compliance issues, always accounted for.',
    Visual: GovernanceVisual,
  },
];

const PillarsSection = () => {
  return (
    <section id="pillars" className="mx-auto max-w-7xl px-6 py-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5 }}
        className="mx-auto mb-16 max-w-2xl text-center"
      >
        <h2 className="font-heading text-3xl font-bold tracking-tight text-ink-50 md:text-4xl">
          Three pillars, one platform
        </h2>
        <p className="mt-4 text-lg text-ink-400">
          Every ESG dimension your organization needs, integrated into daily
          operations.
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {pillars.map(({ icon: Icon, iconClass, title, body, Visual }, i) => (
          <motion.div
            key={title}
            initial="rest"
            whileHover="hover"
            animate="rest"
            className="glass group rounded-2xl p-7"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <motion.span
                variants={{ rest: { rotate: 0, scale: 1 }, hover: { rotate: -6, scale: 1.08 } }}
                className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${iconClass}`}
              >
                <Icon size={22} />
              </motion.span>
              <h3 className="mb-2 font-heading text-xl font-semibold text-ink-50">
                {title}
              </h3>
              <p className="mb-4 text-sm text-ink-400">{body}</p>
              <Visual />
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default PillarsSection;
