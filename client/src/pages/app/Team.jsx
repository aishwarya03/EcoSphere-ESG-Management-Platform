import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Send, Upload } from 'lucide-react';
import { importUsers, inviteUser, listUsers } from '../../api/users';
import { inviteEmailSchema, isXlsxFile } from '../../lib/validation';
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

  const [inviting, setInviting] = useState(false);
  const {
    register: registerInvite,
    handleSubmit: handleInviteSubmit,
    reset: resetInviteForm,
    formState: { errors: inviteErrors },
  } = useForm({
    resolver: zodResolver(inviteEmailSchema),
    defaultValues: { email: '' },
  });

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(null);
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

  const onInvite = async ({ email }) => {
    setInviting(true);
    try {
      await inviteUser(email);
      toast.success('Invite sent — check the server console for the link');
      resetInviteForm();
      fetchUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Could not send invite');
    } finally {
      setInviting(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] ?? null;
    if (selected && !isXlsxFile(selected)) {
      setFile(null);
      setFileError('Please choose a .xlsx file');
      e.target.value = '';
      return;
    }
    setFileError(null);
    setFile(selected);
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file || !isXlsxFile(file)) {
      setFileError('Please choose a .xlsx file');
      return;
    }
    setImporting(true);
    try {
      const result = await importUsers(file);
      const notFoundCount = result.departmentNotFound?.length ?? 0;
      toast.success(
        `Invited ${result.invited?.length ?? 0}, skipped ${result.skipped?.length ?? 0}` +
          (notFoundCount ? `, ${notFoundCount} had an unrecognized department code` : '')
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
          <form onSubmit={handleInviteSubmit(onInvite)} className="flex items-end gap-3" noValidate>
            <Field
              label="Email"
              type="email"
              className="flex-1"
              placeholder="employee@acme.com"
              error={inviteErrors.email?.message}
              {...registerInvite('email')}
            />
            <Button type="submit" variant="primary" disabled={inviting}>
              <Send size={16} /> {inviting ? 'Sending...' : 'Invite'}
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="mb-1 font-heading text-sm font-semibold text-ink-50">Bulk import (.xlsx)</h2>
          <p className="mb-3 text-xs text-ink-400">
            Needs an <span className="text-ink-200">Email</span> column, and optionally a{' '}
            <span className="text-ink-200">Department Code</span> column.
          </p>
          <form onSubmit={handleImport} className="flex items-end gap-3" noValidate>
            <div className="flex-1">
              <input
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                className="w-full text-sm text-ink-400 file:mr-3 file:rounded-lg file:border-0 file:bg-white/5 file:px-4 file:py-2 file:text-sm file:font-medium file:text-ink-200 hover:file:bg-white/10"
              />
              {fileError && <span className="mt-1 block text-xs text-danger-400">{fileError}</span>}
            </div>
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
                <th className="px-6 py-3 font-medium">Department</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-border-subtle">
                  <td className="px-6 py-3 text-ink-50">{u.name ?? u.username ?? '—'}</td>
                  <td className="px-6 py-3 text-ink-300">{u.email}</td>
                  <td className="px-6 py-3 text-ink-300">{u.department?.name ?? '—'}</td>
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
