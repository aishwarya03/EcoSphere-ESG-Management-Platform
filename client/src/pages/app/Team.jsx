import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Send, Upload } from 'lucide-react';
import { importUsers, inviteUser, listUsers } from '../../api/users';
import Card from '../../components/Card';
import Field from '../../components/Field';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';

const statusStyles = {
  PENDING: 'bg-accent-500/15 text-accent-400',
  ACTIVE: 'bg-primary-500/15 text-primary-400',
};

const Team = () => {
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const data = await listUsers();
      setUsers(Array.isArray(data) ? data : (data.users ?? []));
    } catch {
      toast.error('Could not load users');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    listUsers()
      .then((data) => {
        if (cancelled) return;
        setUsers(Array.isArray(data) ? data : (data.users ?? []));
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load users');
      })
      .finally(() => {
        if (!cancelled) setUsersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    try {
      await inviteUser(email);
      toast.success('Invite sent — check the server console for the link');
      setEmail('');
      fetchUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Could not send invite');
    } finally {
      setInviting(false);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) return;
    setImporting(true);
    try {
      const result = await importUsers(file);
      toast.success(
        `Invited ${result.invited?.length ?? 0}, skipped ${result.skipped?.length ?? 0}`
      );
      setFile(null);
      e.target.reset();
      fetchUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-ink-50">Team</h1>
        <p className="text-sm text-ink-400">Invite employees and manage your organization&apos;s members.</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-heading text-sm font-semibold text-ink-50">Invite an employee</h2>
          <form onSubmit={handleInvite} className="flex items-end gap-3">
            <Field
              label="Email"
              type="email"
              required
              className="flex-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="employee@acme.com"
            />
            <Button type="submit" variant="primary" disabled={inviting}>
              <Send size={16} /> {inviting ? 'Sending...' : 'Invite'}
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="mb-4 font-heading text-sm font-semibold text-ink-50">Bulk import (.xlsx)</h2>
          <form onSubmit={handleImport} className="flex items-end gap-3">
            <input
              type="file"
              accept=".xlsx"
              required
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="flex-1 text-sm text-ink-400 file:mr-3 file:rounded-lg file:border-0 file:bg-white/5 file:px-4 file:py-2 file:text-sm file:font-medium file:text-ink-200 hover:file:bg-white/10"
            />
            <Button type="submit" variant="secondary" disabled={importing || !file}>
              <Upload size={16} /> {importing ? 'Importing...' : 'Import'}
            </Button>
          </form>
        </Card>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-heading text-sm font-semibold text-ink-50">
            Members ({users.length})
          </h2>
        </div>

        {usersLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : users.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-ink-400">No members yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-t border-border-subtle text-xs uppercase tracking-wide text-ink-600">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-border-subtle">
                  <td className="px-6 py-3 text-ink-50">{u.name ?? u.username ?? '—'}</td>
                  <td className="px-6 py-3 text-ink-300">{u.email}</td>
                  <td className="px-6 py-3 text-ink-300">{u.role ?? '—'}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        statusStyles[u.status] ?? 'bg-white/5 text-ink-400'
                      }`}
                    >
                      {u.status ?? 'UNKNOWN'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

export default Team;
