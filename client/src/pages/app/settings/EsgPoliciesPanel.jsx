import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Pencil, Plus } from 'lucide-react';
import { createEsgPolicy, listEsgPolicies, updateEsgPolicy } from '../../../api/esgPolicies';
import { esgPolicySchema } from '../../../lib/validation';
import { toDateInputValue } from '../../../lib/date';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Field from '../../../components/Field';
import SelectField from '../../../components/SelectField';
import Modal from '../../../components/Modal';
import Spinner from '../../../components/Spinner';

const statusStyles = {
  DRAFT: 'bg-white/5 text-ink-400',
  PUBLISHED: 'bg-primary-500/15 text-primary-400',
  ARCHIVED: 'bg-danger-500/15 text-danger-400',
};

const EsgPoliciesPanel = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const data = await listEsgPolicies();
      setPolicies(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Could not load ESG policies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    listEsgPolicies()
      .then((data) => {
        if (!cancelled) setPolicies(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load ESG policies');
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
  } = useForm({ resolver: zodResolver(esgPolicySchema) });

  const openCreate = () => {
    setEditing(null);
    reset({ title: '', category: '', description: '', effectiveDate: '', status: 'DRAFT' });
    setModalOpen(true);
  };

  const openEdit = (policy) => {
    setEditing(policy);
    reset({
      title: policy.title,
      category: policy.category,
      description: policy.description ?? '',
      effectiveDate: toDateInputValue(policy.effectiveDate),
      status: policy.status,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (isEditing) {
        await updateEsgPolicy(editing.id, data);
        toast.success('ESG policy updated');
      } else {
        await createEsgPolicy(data);
        toast.success('ESG policy created');
      }
      setModalOpen(false);
      fetchPolicies();
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Could not save ESG policy');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink-400">Governance policies published to your organization.</p>
        <Button size="sm" variant="primary" onClick={openCreate}>
          <Plus size={16} /> New Policy
        </Button>
      </div>

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : policies.length === 0 ? (
          <p className="p-6 text-sm text-ink-400">No ESG policies yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-ink-600">
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Version</th>
                <th className="px-6 py-3 font-medium">Effective</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {policies.map((p) => (
                <tr key={p.id} className="border-t border-border-subtle">
                  <td className="px-6 py-3 text-ink-50">{p.title}</td>
                  <td className="px-6 py-3 text-ink-300">{p.category}</td>
                  <td className="px-6 py-3 text-ink-300">v{p.version}</td>
                  <td className="px-6 py-3 text-ink-300">{toDateInputValue(p.effectiveDate)}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[p.status] ?? statusStyles.DRAFT}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => openEdit(p)}
                      className="cursor-pointer rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-50"
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
        title={isEditing ? 'Edit ESG policy' : 'New ESG policy'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field
            label="Title"
            type="text"
            placeholder="Code of Conduct"
            error={errors.title?.message}
            {...register('title')}
          />
          <Field
            label="Category"
            type="text"
            placeholder="Ethics"
            error={errors.category?.message}
            {...register('category')}
          />
          <Field
            label="Description (optional)"
            type="text"
            placeholder="Short description"
            error={errors.description?.message}
            {...register('description')}
          />
          <Field
            label="Effective date"
            type="date"
            error={errors.effectiveDate?.message}
            {...register('effectiveDate')}
          />
          <SelectField label="Status" error={errors.status?.message} {...register('status')}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </SelectField>
          {isEditing && (
            <p className="text-xs text-ink-400">
              Changing the title or description will bump the policy to a new version.
            </p>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Create policy'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default EsgPoliciesPanel;
