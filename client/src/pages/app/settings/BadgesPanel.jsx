import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Award, Pencil, Plus } from 'lucide-react';
import { createBadge, listBadges, updateBadge } from '../../../api/badges';
import { createBadgeSchema, updateBadgeSchema } from '../../../lib/validation';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Field from '../../../components/Field';
import SelectField from '../../../components/SelectField';
import Modal from '../../../components/Modal';
import Spinner from '../../../components/Spinner';

const metricLabels = {
  XP_TOTAL: 'Total XP',
  CHALLENGES_COMPLETED: 'Challenges completed',
  CSR_PARTICIPATIONS_COMPLETED: 'CSR participations completed',
};

const statusStyles = {
  ACTIVE: 'bg-primary-500/15 text-primary-400',
  INACTIVE: 'bg-white/5 text-ink-400',
};

const BadgesPanel = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchBadges = async () => {
    setLoading(true);
    try {
      const data = await listBadges();
      setBadges(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Could not load badges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    listBadges()
      .then((data) => {
        if (!cancelled) setBadges(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load badges');
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
  } = useForm({ resolver: zodResolver(isEditing ? updateBadgeSchema : createBadgeSchema) });

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', description: '', icon: '', unlockMetric: 'XP_TOTAL', unlockThreshold: '' });
    setModalOpen(true);
  };

  const openEdit = (badge) => {
    setEditing(badge);
    reset({
      name: badge.name,
      description: badge.description ?? '',
      icon: badge.icon ?? '',
      unlockMetric: badge.unlockMetric,
      unlockThreshold: badge.unlockThreshold,
      status: badge.status,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (isEditing) {
        await updateBadge(editing.id, data);
        toast.success('Badge updated');
      } else {
        await createBadge(data);
        toast.success('Badge created');
      }
      setModalOpen(false);
      fetchBadges();
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Could not save badge');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink-400">Employee achievements, auto-awarded when unlock rules are met.</p>
        <Button size="sm" variant="primary" onClick={openCreate}>
          <Plus size={16} /> New Badge
        </Button>
      </div>

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : badges.length === 0 ? (
          <p className="p-6 text-sm text-ink-400">No badges yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-ink-600">
                <th className="px-6 py-3 font-medium">Badge</th>
                <th className="px-6 py-3 font-medium">Unlock rule</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {badges.map((b) => (
                <tr key={b.id} className="border-t border-border-subtle">
                  <td className="px-6 py-3 text-ink-50">
                    <span className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-500/15 text-accent-400">
                        {b.icon || <Award size={14} />}
                      </span>
                      {b.name}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-ink-300">
                    {metricLabels[b.unlockMetric] ?? b.unlockMetric} &ge; {b.unlockThreshold}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[b.status] ?? statusStyles.INACTIVE}`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => openEdit(b)}
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
        title={isEditing ? 'Edit badge' : 'New badge'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field
            label="Name"
            type="text"
            placeholder="Carbon Hero"
            error={errors.name?.message}
            {...register('name')}
          />
          <Field
            label="Description (optional)"
            type="text"
            placeholder="Short description"
            error={errors.description?.message}
            {...register('description')}
          />
          <Field
            label="Icon (optional, emoji or short code)"
            type="text"
            placeholder="🏅"
            error={errors.icon?.message}
            {...register('icon')}
          />
          <SelectField label="Unlock metric" error={errors.unlockMetric?.message} {...register('unlockMetric')}>
            {Object.entries(metricLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectField>
          <Field
            label="Unlock threshold"
            type="number"
            placeholder="1000"
            error={errors.unlockThreshold?.message}
            {...register('unlockThreshold')}
          />
          {isEditing && (
            <SelectField label="Status" error={errors.status?.message} {...register('status')}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </SelectField>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Create badge'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default BadgesPanel;
