import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HandHeart, ShieldCheck, Trophy, Zap } from 'lucide-react';
import { getMyProfile } from '../../../api/users';
import { toDateInputValue } from '../../../lib/date';
import Card from '../../../components/Card';
import Spinner from '../../../components/Spinner';

const statusStyles = {
  PENDING: 'bg-accent-500/15 text-accent-400',
  APPROVED: 'bg-primary-500/15 text-primary-400',
  REJECTED: 'bg-danger-500/15 text-danger-400',
};

const EmployeeDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getMyProfile()
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load your profile');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const csr = profile?.csrParticipations ?? [];
  const challenges = profile?.challengeParticipations ?? [];
  const totalPoints = csr.filter((p) => p.approvalStatus === 'APPROVED').reduce((sum, p) => sum + (p.pointsEarned ?? 0), 0);
  const totalXp = challenges.filter((p) => p.approvalStatus === 'APPROVED').reduce((sum, p) => sum + (p.xpAwarded ?? 0), 0);
  const pendingCount = [...csr, ...challenges].filter((p) => p.approvalStatus === 'PENDING').length;

  return (
    <div>
      <div className="mb-8">
        <span className="text-sm text-ink-400">{profile?.organization?.name}</span>
        <h1 className="font-heading text-2xl font-bold text-ink-50">
          Welcome back, {profile?.username ?? profile?.email}
        </h1>
        {profile?.department && <p className="text-sm text-ink-400">{profile.department.name}</p>}
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500/15 text-primary-400">
            <HandHeart size={18} />
          </span>
          <div className="font-heading text-2xl font-bold text-ink-50">{totalPoints}</div>
          <div className="text-xs text-ink-400">CSR points earned</div>
        </Card>
        <Card>
          <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500/15 text-accent-400">
            <Zap size={18} />
          </span>
          <div className="font-heading text-2xl font-bold text-ink-50">{totalXp}</div>
          <div className="text-xs text-ink-400">XP earned</div>
        </Card>
        <Card>
          <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-400/15 text-blue-400">
            <ShieldCheck size={18} />
          </span>
          <div className="font-heading text-2xl font-bold text-ink-50">{pendingCount}</div>
          <div className="text-xs text-ink-400">Pending review</div>
        </Card>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Link to="/social" className="block">
          <Card className="transition-colors hover:border-primary-500/40">
            <div className="flex items-center justify-between">
              <span className="font-heading text-sm font-semibold text-ink-50">Social</span>
              <HandHeart size={16} className="text-primary-400" />
            </div>
            <p className="mt-1 text-xs text-ink-400">Browse CSR activities & submit participation</p>
          </Card>
        </Link>
        <Link to="/gamification" className="block">
          <Card className="transition-colors hover:border-primary-500/40">
            <div className="flex items-center justify-between">
              <span className="font-heading text-sm font-semibold text-ink-50">Gamification</span>
              <Trophy size={16} className="text-accent-400" />
            </div>
            <p className="mt-1 text-xs text-ink-400">Join challenges & track your progress</p>
          </Card>
        </Link>
        <Link to="/governance" className="block">
          <Card className="transition-colors hover:border-primary-500/40">
            <div className="flex items-center justify-between">
              <span className="font-heading text-sm font-semibold text-ink-50">Governance</span>
              <ShieldCheck size={16} className="text-blue-400" />
            </div>
            <p className="mt-1 text-xs text-ink-400">Acknowledge published policies</p>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="!p-0 overflow-hidden">
          <h2 className="px-6 pt-5 font-heading text-sm font-semibold text-ink-50">Recent CSR participation</h2>
          {csr.length === 0 ? (
            <p className="p-6 text-sm text-ink-400">No submissions yet.</p>
          ) : (
            <div className="mt-3 divide-y divide-border-subtle">
              {csr.slice(0, 6).map((p) => (
                <div key={p.id} className="flex items-center justify-between px-6 py-3 text-sm">
                  <span className="truncate text-ink-200">{p.csrActivity?.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyles[p.approvalStatus]}`}>
                    {p.approvalStatus}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="!p-0 overflow-hidden">
          <h2 className="px-6 pt-5 font-heading text-sm font-semibold text-ink-50">Recent challenges</h2>
          {challenges.length === 0 ? (
            <p className="p-6 text-sm text-ink-400">No challenges joined yet.</p>
          ) : (
            <div className="mt-3 divide-y divide-border-subtle">
              {challenges.slice(0, 6).map((p) => (
                <div key={p.id} className="flex items-center justify-between px-6 py-3 text-sm">
                  <div className="min-w-0">
                    <span className="block truncate text-ink-200">{p.challenge?.title}</span>
                    <span className="text-xs text-ink-500">
                      {p.progress}% &middot; due {toDateInputValue(p.challenge?.deadline)}
                    </span>
                  </div>
                  <span className={`ml-2 flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyles[p.approvalStatus]}`}>
                    {p.approvalStatus}
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

export default EmployeeDashboard;
