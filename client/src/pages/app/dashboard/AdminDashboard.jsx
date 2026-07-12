import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, RefreshCw, Target, Trophy } from 'lucide-react';
import { getOverallScore, listLatestScores, recomputeScores } from '../../../api/departmentScores';
import { listDepartments } from '../../../api/departments';
import { listCarbonTransactions } from '../../../api/carbonTransactions';
import { listEnvironmentalGoals } from '../../../api/environmentalGoals';
import { listComplianceIssues } from '../../../api/complianceIssues';
import { listChallenges } from '../../../api/challenges';
import { listParticipations } from '../../../api/employeeParticipations';
import { listChallengeParticipations } from '../../../api/challengeParticipations';
import { getQuarterRange, getYearRange, monthLabel } from '../../../lib/dateRanges';
import { useAuth } from '../../../context/useAuth';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Select from '../../../components/Select';
import Spinner from '../../../components/Spinner';
import ScoreRing from '../../../components/ScoreRing';

const goalStatusStyles = {
  ACHIEVED: 'bg-primary-500/15 text-primary-400',
  MISSED: 'bg-danger-500/15 text-danger-400',
  ACTIVE: 'bg-accent-500/15 text-accent-400',
  ARCHIVED: 'bg-white/5 text-ink-400',
};

const severityStyles = {
  LOW: 'bg-white/5 text-ink-400',
  MEDIUM: 'bg-accent-500/15 text-accent-400',
  HIGH: 'bg-danger-500/15 text-danger-400',
  CRITICAL: 'bg-danger-500/25 text-danger-400',
};

const medal = ['text-accent-400', 'text-ink-300', 'text-accent-700'];

const rangePresets = [
  { key: 'quarter', label: 'This Quarter' },
  { key: 'year', label: 'This Year' },
  { key: 'custom', label: 'Custom' },
];

const AdminDashboard = () => {
  const { organization } = useAuth();

  const [departments, setDepartments] = useState([]);
  const [scores, setScores] = useState([]);
  const [overall, setOverall] = useState(null);
  const [pulse, setPulse] = useState({ activeChallenges: 0, approvedCsr: 0, approvedChallengeXp: 0 });
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);

  const [departmentId, setDepartmentId] = useState('');
  const [rangeKey, setRangeKey] = useState('quarter');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const range =
    rangeKey === 'quarter' ? getQuarterRange() : rangeKey === 'year' ? getYearRange() : { start: customStart, end: customEnd };

  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      listDepartments(),
      listLatestScores(),
      getOverallScore().catch(() => null),
      listChallenges({ status: 'ACTIVE' }),
      listParticipations({ approvalStatus: 'APPROVED' }),
      listChallengeParticipations({ approvalStatus: 'APPROVED' }),
      listComplianceIssues({ overdue: 'true' }),
    ])
      .then(([deptData, scoreData, overallData, activeChallenges, csrApproved, challengeApproved, overdueIssues]) => {
        if (cancelled) return;
        setDepartments(Array.isArray(deptData) ? deptData : []);
        setScores(Array.isArray(scoreData) ? scoreData : []);
        setOverall(overallData);
        setPulse({
          activeChallenges: Array.isArray(activeChallenges) ? activeChallenges.length : 0,
          approvedCsr: Array.isArray(csrApproved) ? csrApproved.length : 0,
          approvedChallengeXp: Array.isArray(challengeApproved)
            ? challengeApproved.reduce((sum, p) => sum + (p.xpAwarded ?? 0), 0)
            : 0,
        });
        setIssues(Array.isArray(overdueIssues) ? overdueIssues : []);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load dashboard data');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (rangeKey === 'custom' && (!customStart || !customEnd)) return;
    let cancelled = false;

    Promise.all([
      listCarbonTransactions({
        departmentId: departmentId || undefined,
        dateFrom: range.start || undefined,
        dateTo: range.end || undefined,
      }),
      listEnvironmentalGoals({ departmentId: departmentId || undefined }),
    ])
      .then(([txData, goalData]) => {
        if (cancelled) return;
        setTransactions(Array.isArray(txData) ? txData : []);
        setGoals(Array.isArray(goalData) ? goalData : []);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load filtered data');
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentId, rangeKey, customStart, customEnd]);

  const handleRecompute = async () => {
    setRecomputing(true);
    try {
      await recomputeScores();
      const [scoreData, overallData] = await Promise.all([listLatestScores(), getOverallScore().catch(() => null)]);
      setScores(Array.isArray(scoreData) ? scoreData : []);
      setOverall(overallData);
      toast.success('Scores recomputed');
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Could not recompute scores');
    } finally {
      setRecomputing(false);
    }
  };

  const rankedScores = [...scores].sort((a, b) => b.totalScore - a.totalScore);

  const emissionsByMonth = (() => {
    const map = new Map();
    transactions.forEach((tx) => {
      const key = tx.transactionDate?.slice(0, 7);
      if (!key) return;
      map.set(key, (map.get(key) ?? 0) + (tx.calculatedEmissionsKgCo2e ?? 0));
    });
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, value]) => ({ month: monthLabel(month), value: Math.round(value * 100) / 100 }));
  })();

  const goalsInRange = goals.filter((g) => {
    if (!range.start && !range.end) return true;
    const d = g.targetDate?.slice(0, 10);
    if (!d) return false;
    return (!range.start || d >= range.start) && (!range.end || d <= range.end);
  });
  const goalCounts = {
    ACHIEVED: goalsInRange.filter((g) => g.status === 'ACHIEVED').length,
    MISSED: goalsInRange.filter((g) => g.status === 'MISSED').length,
    ACTIVE: goalsInRange.filter((g) => g.status === 'ACTIVE').length,
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink-50">Dashboard</h1>
          <p className="text-sm text-ink-400">{organization?.name} &mdash; ESG performance overview.</p>
        </div>
        <Button size="sm" variant="primary" onClick={handleRecompute} disabled={recomputing}>
          <RefreshCw size={16} className={recomputing ? 'animate-spin' : ''} />
          {recomputing ? 'Recomputing...' : 'Recompute Scores'}
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            {rangePresets.map((p) => (
              <button
                key={p.key}
                onClick={() => setRangeKey(p.key)}
                className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  rangeKey === p.key ? 'bg-primary-500/15 text-primary-400' : 'text-ink-400 hover:bg-white/5 hover:text-ink-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {rangeKey === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="rounded-lg border border-border-subtle bg-white/5 px-3 py-1.5 text-sm text-ink-50 outline-none focus:border-primary-500"
              />
              <span className="text-ink-400">&rarr;</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="rounded-lg border border-border-subtle bg-white/5 px-3 py-1.5 text-sm text-ink-50 outline-none focus:border-primary-500"
              />
            </div>
          )}
          <div className="ml-auto w-48">
            <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Overall score + pulse stats */}
      <div className="mb-6 grid gap-4 lg:grid-cols-[auto_1fr]">
        <Card className="flex items-center justify-center">
          {overall ? (
            <ScoreRing score={overall.overallScore} size={150} />
          ) : (
            <div className="flex flex-col items-center justify-center px-8 py-4 text-center text-sm text-ink-400">
              No scores yet.
              <br />
              Click Recompute.
            </div>
          )}
        </Card>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Card>
            <span className="text-xs text-ink-400">Active Challenges</span>
            <div className="font-heading text-2xl font-bold text-ink-50">{pulse.activeChallenges}</div>
          </Card>
          <Card>
            <span className="text-xs text-ink-400">Approved CSR Participations</span>
            <div className="font-heading text-2xl font-bold text-ink-50">{pulse.approvedCsr}</div>
          </Card>
          <Card>
            <span className="text-xs text-ink-400">XP Awarded</span>
            <div className="font-heading text-2xl font-bold text-ink-50">{pulse.approvedChallengeXp}</div>
          </Card>
          <Card className="col-span-2 sm:col-span-3">
            <span className="mb-2 block text-xs text-ink-400">Departments tracked</span>
            <div className="font-heading text-2xl font-bold text-ink-50">{departments.length}</div>
          </Card>
        </div>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {/* Department leaderboard */}
        <Card>
          <h2 className="mb-4 flex items-center gap-2 font-heading text-sm font-semibold text-ink-50">
            <Trophy size={16} className="text-accent-400" /> Top Departments
          </h2>
          {rankedScores.length === 0 ? (
            <p className="text-sm text-ink-400">No scores computed yet.</p>
          ) : (
            <div className="space-y-3">
              {rankedScores.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3">
                  <span className={`w-5 text-sm font-bold ${medal[i] ?? 'text-ink-500'}`}>#{i + 1}</span>
                  <span className="w-28 flex-shrink-0 truncate text-sm text-ink-200">{s.department?.name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary-500 to-blue-400"
                      style={{ width: `${Math.min(100, s.totalScore)}%` }}
                    />
                  </div>
                  <span className="w-10 flex-shrink-0 text-right text-sm font-semibold text-ink-50">
                    {s.totalScore.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Emissions trend */}
        <Card>
          <h2 className="mb-4 font-heading text-sm font-semibold text-ink-50">Emissions trend (kg CO&#8322;e)</h2>
          {emissionsByMonth.length === 0 ? (
            <p className="text-sm text-ink-400">No carbon transactions in this range.</p>
          ) : (
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={emissionsByMonth}>
                  <defs>
                    <linearGradient id="dashEmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(248,250,252,0.06)" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#131f38', border: '1px solid rgba(248,250,252,0.08)' }} labelStyle={{ color: '#f8fafc' }} />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#dashEmissions)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Goals achieved / missed */}
        <Card>
          <h2 className="mb-4 flex items-center gap-2 font-heading text-sm font-semibold text-ink-50">
            <Target size={16} className="text-primary-400" /> Sustainability Goals
          </h2>
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-primary-500/10 p-3 text-center">
              <div className="font-heading text-xl font-bold text-primary-400">{goalCounts.ACHIEVED}</div>
              <div className="text-xs text-ink-400">Achieved</div>
            </div>
            <div className="rounded-lg bg-danger-500/10 p-3 text-center">
              <div className="font-heading text-xl font-bold text-danger-400">{goalCounts.MISSED}</div>
              <div className="text-xs text-ink-400">Missed</div>
            </div>
            <div className="rounded-lg bg-accent-500/10 p-3 text-center">
              <div className="font-heading text-xl font-bold text-accent-400">{goalCounts.ACTIVE}</div>
              <div className="text-xs text-ink-400">Active</div>
            </div>
          </div>
          {goalsInRange.length === 0 ? (
            <p className="text-sm text-ink-400">No goals due in this range.</p>
          ) : (
            <div className="max-h-52 space-y-2 overflow-y-auto">
              {goalsInRange.map((g) => (
                <div key={g.id} className="flex items-center justify-between rounded-lg border border-border-subtle px-3 py-2">
                  <span className="truncate text-sm text-ink-200">{g.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${goalStatusStyles[g.status]}`}>
                    {g.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Compliance breaches */}
        <Card>
          <h2 className="mb-4 flex items-center gap-2 font-heading text-sm font-semibold text-ink-50">
            <AlertTriangle size={16} className="text-danger-400" /> Overdue Compliance Issues
          </h2>
          {issues.length === 0 ? (
            <p className="text-sm text-ink-400">No overdue compliance issues. Nothing breached.</p>
          ) : (
            <div className="max-h-52 space-y-2 overflow-y-auto">
              {issues.map((issue) => (
                <div key={issue.id} className="flex items-center justify-between rounded-lg border border-border-subtle px-3 py-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm text-ink-200">{issue.description}</div>
                    <div className="text-xs text-ink-500">Owner: {issue.owner?.username ?? issue.owner?.email}</div>
                  </div>
                  <span className={`ml-2 flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${severityStyles[issue.severity]}`}>
                    {issue.severity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
