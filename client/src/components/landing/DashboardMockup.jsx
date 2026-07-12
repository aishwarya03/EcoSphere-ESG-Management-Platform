import { motion } from 'motion/react';
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

const pieData = [
  { name: 'Environmental', value: 84, color: '#10b981' },
  { name: 'Social', value: 73, color: '#38bdf8' },
  { name: 'Governance', value: 91, color: '#fbbf24' },
];

const carbonData = [{ v: 58 }, { v: 52 }, { v: 60 }, { v: 46 }, { v: 38 }, { v: 30 }, { v: 24 }];

const leaderboard = [
  { name: 'Engineering', score: 92 },
  { name: 'Marketing', score: 88 },
  { name: 'HR', score: 86 },
];

const DashboardMockup = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7 }}
      className="mx-auto max-w-4xl"
    >
      <div className="overflow-hidden rounded-2xl border border-border-strong bg-surface shadow-2xl">
        <div className="flex items-center gap-2 border-b border-border-subtle bg-surface-raised px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-danger-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary-400/70" />
          <span className="ml-4 rounded-md bg-white/5 px-3 py-1 text-xs text-ink-400">
            app.ecosphere.io/dashboard
          </span>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-3">
          <div className="glass rounded-xl p-4 md:col-span-1">
            <span className="text-xs text-ink-400">Overall ESG Score</span>
            <div className="mt-1 font-heading text-3xl font-bold text-ink-50">87</div>
            <div className="mt-3 h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={28} outerRadius={44} paddingAngle={4}>
                    {pieData.map((d) => (
                      <Cell key={d.name} fill={d.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass rounded-xl p-4 md:col-span-2">
            <span className="text-xs text-ink-400">Carbon Emissions Trend</span>
            <div className="mt-2 h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={carbonData}>
                  <defs>
                    <linearGradient id="mockupCarbon" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke="#34d399" strokeWidth={2} fill="url(#mockupCarbon)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass rounded-xl p-4 md:col-span-3">
            <span className="text-xs text-ink-400">Department Leaderboard</span>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {leaderboard.map((row, i) => (
                <div key={row.name} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                  <span className="text-sm text-ink-200">
                    #{i + 1} {row.name}
                  </span>
                  <span className="text-sm font-semibold text-ink-50">{row.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardMockup;
