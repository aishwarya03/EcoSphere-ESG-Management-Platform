import { Leaf, Users, ShieldCheck, Trophy } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import Card from '../../components/Card';

const modules = [
  { icon: Leaf, label: 'Environmental', color: 'text-primary-400 bg-primary-500/15' },
  { icon: Users, label: 'Social', color: 'text-blue-400 bg-blue-400/15' },
  { icon: ShieldCheck, label: 'Governance', color: 'text-accent-400 bg-accent-500/15' },
  { icon: Trophy, label: 'Gamification', color: 'text-accent-400 bg-accent-500/15' },
];

const Dashboard = () => {
  const { user, organization, isAdmin } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <span className="text-sm text-ink-400">{organization?.name}</span>
        <h1 className="font-heading text-2xl font-bold text-ink-50">
          Welcome back, {user?.name ?? user?.username}
        </h1>
        <span className="mt-2 inline-flex rounded-full bg-primary-500/15 px-2.5 py-0.5 text-xs font-semibold text-primary-400">
          {isAdmin ? 'Admin' : 'Employee'}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {modules.map(({ icon: Icon, label, color }) => (
          <Card key={label}>
            <span className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
              <Icon size={20} />
            </span>
            <h3 className="mb-1 font-heading text-sm font-semibold text-ink-50">{label}</h3>
            <p className="text-xs text-ink-400">Coming soon</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
