import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Pencil, Plus } from 'lucide-react';
import {
  createEmissionFactor,
  listEmissionFactors,
  updateEmissionFactor,
} from '../../../api/emissionFactors';
import {
  createEmissionFactorSchema,
  updateEmissionFactorSchema,
} from '../../../lib/validation';
import { toDateInputValue } from '../../../lib/date';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Field from '../../../components/Field';
import SelectField from '../../../components/SelectField';
import Modal from '../../../components/Modal';
import Spinner from '../../../components/Spinner';

const sourceTypeLabels = {
  PURCHASE: 'Purchase',
  MANUFACTURING: 'Manufacturing',
  EXPENSE: 'Expense',
  FLEET: 'Fleet',
  ELECTRICITY: 'Electricity',
  OTHER: 'Other',
};

const statusStyles = {
  ACTIVE: 'bg-primary-500/15 text-primary-400',
  INACTIVE: 'bg-white/5 text-ink-400',
};

const EmissionFactorsPanel = () => {
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchFactors = async () => {
    setLoading(true);
    try {
      const data = await listEmissionFactors();
      setFactors(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Could not load emission factors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    listEmissionFactors()
      .then((data) => {
        if (!cancelled) setFactors(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load emission factors');
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
    resolver: zodResolver(isEditing ? updateEmissionFactorSchema : createEmissionFactorSchema),
  });

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', sourceType: 'PURCHASE', unit: '', co2ePerUnit: '', validFrom: '', validTo: '', source: '' });
    setModalOpen(true);
  };

  const openEdit = (factor) => {
    setEditing(factor);
    reset({
      name: factor.name,
      sourceType: factor.sourceType,
      unit: factor.unit,
      co2ePerUnit: factor.co2ePerUnit,
      validFrom: toDateInputValue(factor.validFrom),
      validTo: toDateInputValue(factor.validTo),
      source: factor.source ?? '',
      status: factor.status,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (isEditing) {
        await updateEmissionFactor(editing.id, data);
        toast.success('Emission factor updated');
      } else {
        await createEmissionFactor(data);
        toast.success('Emission factor created');
      }
      setModalOpen(false);
      fetchFactors();
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Could not save emission factor');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink-400">Carbon values used during emission calculations.</p>
        <Button size="sm" variant="primary" onClick={openCreate}>
          <Plus size={16} /> New Emission Factor
        </Button>
      </div>

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : factors.length === 0 ? (
          <p className="p-6 text-sm text-ink-400">No emission factors yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-ink-600">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Source</th>
                <th className="px-6 py-3 font-medium">Unit</th>
                <th className="px-6 py-3 font-medium">CO&#8322;e / unit</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {factors.map((f) => (
                <tr key={f.id} className="border-t border-border-subtle">
                  <td className="px-6 py-3 text-ink-50">{f.name}</td>
                  <td className="px-6 py-3 text-ink-300">{sourceTypeLabels[f.sourceType] ?? f.sourceType}</td>
                  <td className="px-6 py-3 text-ink-300">{f.unit}</td>
                  <td className="px-6 py-3 text-ink-300">{f.co2ePerUnit}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[f.status] ?? statusStyles.INACTIVE}`}
                    >
                      {f.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => openEdit(f)}
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
        title={isEditing ? 'Edit emission factor' : 'New emission factor'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field
            label="Name"
            type="text"
            placeholder="Grid Electricity"
            error={errors.name?.message}
            {...register('name')}
          />
          <SelectField label="Source type" error={errors.sourceType?.message} {...register('sourceType')}>
            {Object.entries(sourceTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectField>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Unit"
              type="text"
              placeholder="kWh"
              error={errors.unit?.message}
              {...register('unit')}
            />
            <Field
              label="CO2e per unit"
              type="number"
              step="any"
              placeholder="0.45"
              error={errors.co2ePerUnit?.message}
              {...register('co2ePerUnit')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Valid from (optional)"
              type="date"
              error={errors.validFrom?.message}
              {...register('validFrom')}
            />
            <Field
              label="Valid to (optional)"
              type="date"
              error={errors.validTo?.message}
              {...register('validTo')}
            />
          </div>
          <Field
            label="Source (optional)"
            type="text"
            placeholder="EPA 2024 factors"
            error={errors.source?.message}
            {...register('source')}
          />
          {isEditing && (
            <SelectField label="Status" error={errors.status?.message} {...register('status')}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </SelectField>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Create emission factor'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default EmissionFactorsPanel;
