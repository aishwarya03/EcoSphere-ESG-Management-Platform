import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Pencil, Plus } from 'lucide-react';
import {
  createDepartment,
  listDepartments,
  updateDepartment,
} from '../../../api/departments';
import { listUsers } from '../../../api/users';
import { createDepartmentSchema, updateDepartmentSchema } from '../../../lib/validation';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Field from '../../../components/Field';
import SelectField from '../../../components/SelectField';
import Modal from '../../../components/Modal';
import Spinner from '../../../components/Spinner';

const statusStyles = {
  ACTIVE: 'bg-primary-500/15 text-primary-400',
  INACTIVE: 'bg-white/5 text-ink-400',
};

const DepartmentsPanel = () => {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [depts, orgUsers] = await Promise.all([listDepartments(), listUsers()]);
      setDepartments(Array.isArray(depts) ? depts : []);
      setUsers(Array.isArray(orgUsers) ? orgUsers : []);
    } catch {
      toast.error('Could not load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    Promise.all([listDepartments(), listUsers()])
      .then(([depts, orgUsers]) => {
        if (cancelled) return;
        setDepartments(Array.isArray(depts) ? depts : []);
        setUsers(Array.isArray(orgUsers) ? orgUsers : []);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load departments');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const isEditing = Boolean(editing);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isEditing ? updateDepartmentSchema : createDepartmentSchema),
  });

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', code: '', headUserId: '', parentDepartmentId: '' });
    setModalOpen(true);
  };

  const openEdit = (dept) => {
    setEditing(dept);
    reset({
      name: dept.name,
      code: dept.code,
      headUserId: dept.headUserId ?? '',
      parentDepartmentId: dept.parentDepartmentId ?? '',
      status: dept.status,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (isEditing) {
        await updateDepartment(editing.id, data);
        toast.success('Department updated');
      } else {
        await createDepartment(data);
        toast.success('Department created');
      }
      setModalOpen(false);
      fetchAll();
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Could not save department');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink-400">Organizational hierarchy and ESG ownership.</p>
        <Button size="sm" variant="primary" onClick={openCreate}>
          <Plus size={16} /> New Department
        </Button>
      </div>

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : departments.length === 0 ? (
          <p className="p-6 text-sm text-ink-400">No departments yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-ink-600">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Code</th>
                <th className="px-6 py-3 font-medium">Head</th>
                <th className="px-6 py-3 font-medium">Parent</th>
                <th className="px-6 py-3 font-medium">Employees</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.id} className="border-t border-border-subtle">
                  <td className="px-6 py-3 text-ink-50">{d.name}</td>
                  <td className="px-6 py-3 text-ink-300">{d.code}</td>
                  <td className="px-6 py-3 text-ink-300">
                    {d.head?.username ?? d.head?.email ?? '—'}
                  </td>
                  <td className="px-6 py-3 text-ink-300">{d.parentDepartment?.name ?? '—'}</td>
                  <td className="px-6 py-3 text-ink-300">{d.employeeCount ?? 0}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[d.status] ?? statusStyles.INACTIVE}`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => openEdit(d)}
                      className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-50"
                    >
                      <Pencil size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit department' : 'New department'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field
            label="Name"
            type="text"
            placeholder="Engineering"
            error={errors.name?.message}
            {...register('name')}
          />
          <Field
            label="Code"
            type="text"
            placeholder="ENG"
            error={errors.code?.message}
            {...register('code')}
          />
          <SelectField label="Head (optional)" error={errors.headUserId?.message} {...register('headUserId')}>
            <option value="">No head assigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username ?? u.email}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Parent department (optional)"
            error={errors.parentDepartmentId?.message}
            {...register('parentDepartmentId')}
          >
            <option value="">No parent</option>
            {departments
              .filter((d) => d.id !== editing?.id)
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
          </SelectField>
          {isEditing && (
            <SelectField label="Status" error={errors.status?.message} {...register('status')}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </SelectField>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Create department'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default DepartmentsPanel;
