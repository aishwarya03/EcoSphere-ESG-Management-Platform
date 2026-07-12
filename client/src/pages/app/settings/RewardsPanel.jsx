import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Gift, Pencil, Plus } from 'lucide-react';
import { createReward, listRewards, updateReward } from '../../../api/rewards';
import { createRewardSchema, updateRewardSchema } from '../../../lib/validation';
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

const RewardsPanel = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const data = await listRewards();
      setRewards(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Could not load rewards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    listRewards()
      .then((data) => {
        if (!cancelled) setRewards(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load rewards');
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
  } = useForm({ resolver: zodResolver(isEditing ? updateRewardSchema : createRewardSchema) });

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', description: '', pointsRequired: '', stock: '' });
    setModalOpen(true);
  };

  const openEdit = (reward) => {
    setEditing(reward);
    reset({
      name: reward.name,
      description: reward.description ?? '',
      pointsRequired: reward.pointsRequired,
      stock: reward.stock,
      status: reward.status,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (isEditing) {
        await updateReward(editing.id, data);
        toast.success('Reward updated');
      } else {
        await createReward(data);
        toast.success('Reward created');
      }
      setModalOpen(false);
      fetchRewards();
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Could not save reward');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink-400">Redeemable incentives for the rewards catalog.</p>
        <Button size="sm" variant="primary" onClick={openCreate}>
          <Plus size={16} /> New Reward
        </Button>
      </div>

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : rewards.length === 0 ? (
          <p className="p-6 text-sm text-ink-400">No rewards yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-ink-600">
                <th className="px-6 py-3 font-medium">Reward</th>
                <th className="px-6 py-3 font-medium">Points</th>
                <th className="px-6 py-3 font-medium">Stock</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {rewards.map((r) => (
                <tr key={r.id} className="border-t border-border-subtle">
                  <td className="px-6 py-3 text-ink-50">
                    <span className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-500/15 text-accent-400">
                        <Gift size={14} />
                      </span>
                      {r.name}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-ink-300">{r.pointsRequired}</td>
                  <td className="px-6 py-3 text-ink-300">{r.stock}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[r.status] ?? statusStyles.INACTIVE}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => openEdit(r)}
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
        title={isEditing ? 'Edit reward' : 'New reward'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field
            label="Name"
            type="text"
            placeholder="Eco Tote Bag"
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
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Points required"
              type="number"
              placeholder="500"
              error={errors.pointsRequired?.message}
              {...register('pointsRequired')}
            />
            <Field
              label="Stock"
              type="number"
              placeholder="50"
              error={errors.stock?.message}
              {...register('stock')}
            />
          </div>
          {isEditing && (
            <SelectField label="Status" error={errors.status?.message} {...register('status')}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </SelectField>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Create reward'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default RewardsPanel;
