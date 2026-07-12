import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Pencil, Plus } from 'lucide-react';
import {
  createEnvironmentalGoal,
  listEnvironmentalGoals,
  updateEnvironmentalGoal,
} from '../../../api/environmentalGoals';
import { listDepartments } from '../../../api/departments';
import {
  createEnvironmentalGoalSchema,
  updateEnvironmentalGoalSchema,
} from '../../../lib/validation';
import { toDateInputValue } from '../../../lib/date';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Field from '../../../components/Field';
import SelectField from '../../../components/SelectField';
import Modal from '../../../components/Modal';
import Spinner from '../../../components/Spinner';

const statusStyles = {
  ACTIVE: 'bg-primary-500/15 text-primary-400',
  ACHIEVED: 'bg-blue-400/15 text-blue-400',
  MISSED: 'bg-danger-500/15 text-danger-400',
  ARCHIVED: 'bg-white/5 text-ink-400',
};

const EnvironmentalGoalsPanel = () => {
  const [goals, setGoals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const data = await listEnvironmentalGoals();
      setGoals(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Could not load environmental goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all([listEnvironmentalGoals(), listDepartments()])
      .then(([goalData, deptData]) => {
        if (cancelled) return;
        setGoals(Array.isArray(goalData) ? goalData : []);
        setDepartments(Array.isArray(deptData) ? deptData : []);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load environmental goals');
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
    resolver: zodResolver(isEditing ? updateEnvironmentalGoalSchema : createEnvironmentalGoalSchema),
  });

  const openCreate = () => {
    setEditing(null);
    reset({
      title: '', description: '', targetMetric: '', baselineValue: '', targetValue: '',
      unit: '', startDate: '', targetDate: '', departmentId: '',
    });
    setModalOpen(true);
  };

  const openEdit = (goal) => {
    setEditing(goal);
    reset({
      title: goal.title,
      description: goal.description ?? '',
      targetMetric: goal.targetMetric,
      baselineValue: goal.baselineValue ?? '',
      targetValue: goal.targetValue,
      unit: goal.unit,
      startDate: toDateInputValue(goal.startDate),
      targetDate: toDateInputValue(goal.targetDate),
      departmentId: goal.departmentId ?? '',
      status: goal.status,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (isEditing) {
        await updateEnvironmentalGoal(editing.id, data);
        toast.success('Environmental goal updated');
      } else {
        await createEnvironmentalGoal(data);
        toast.success('Environmental goal created');
      }
      setModalOpen(false);
      fetchGoals();
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Could not save environmental goal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink-400">Sustainability targets tracked over time.</p>
        <Button size="sm" variant="primary" onClick={openCreate}>
          <Plus size={16} /> New Goal
        </Button>
      </div>

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : goals.length === 0 ? (
          <p className="p-6 text-sm text-ink-400">No environmental goals yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-ink-600">
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Target</th>
                <th className="px-6 py-3 font-medium">Department</th>
                <th className="px-6 py-3 font-medium">Target Date</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {goals.map((g) => (
                <tr key={g.id} className="border-t border-border-subtle">
                  <td className="px-6 py-3 text-ink-50">{g.title}</td>
                  <td className="px-6 py-3 text-ink-300">
                    {g.baselineValue ?? '—'} &rarr; {g.targetValue} {g.unit}
                  </td>
                  <td className="px-6 py-3 text-ink-300">{g.department?.name ?? '—'}</td>
                  <td className="px-6 py-3 text-ink-300">{toDateInputValue(g.targetDate)}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[g.status] ?? statusStyles.ARCHIVED}`}
                    >
                      {g.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => openEdit(g)}
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
        title={isEditing ? 'Edit environmental goal' : 'New environmental goal'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field
            label="Title"
            type="text"
            placeholder="Reduce Scope 2 emissions"
            error={errors.title?.message}
            {...register('title')}
          />
          <Field
            label="Description (optional)"
            type="text"
            placeholder="Short description"
            error={errors.description?.message}
            {...register('description')}
          />
          <Field
            label="Target metric"
            type="text"
            placeholder="kg CO2e"
            error={errors.targetMetric?.message}
            {...register('targetMetric')}
          />
          <div className="grid grid-cols-3 gap-4">
            <Field
              label="Baseline (optional)"
              type="number"
              step="any"
              error={errors.baselineValue?.message}
              {...register('baselineValue')}
            />
            <Field
              label="Target value"
              type="number"
              step="any"
              error={errors.targetValue?.message}
              {...register('targetValue')}
            />
            <Field
              label="Unit"
              type="text"
              placeholder="kg"
              error={errors.unit?.message}
              {...register('unit')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Start date"
              type="date"
              error={errors.startDate?.message}
              {...register('startDate')}
            />
            <Field
              label="Target date"
              type="date"
              error={errors.targetDate?.message}
              {...register('targetDate')}
            />
          </div>
          <SelectField
            label="Department (optional)"
            error={errors.departmentId?.message}
            {...register('departmentId')}
          >
            <option value="">Organization-wide</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </SelectField>
          {isEditing && (
            <SelectField label="Status" error={errors.status?.message} {...register('status')}>
              <option value="ACTIVE">Active</option>
              <option value="ACHIEVED">Achieved</option>
              <option value="MISSED">Missed</option>
              <option value="ARCHIVED">Archived</option>
            </SelectField>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Create goal'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default EnvironmentalGoalsPanel;
