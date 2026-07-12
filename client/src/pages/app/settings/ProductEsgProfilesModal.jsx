import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { createEsgProfile, listEsgProfiles, updateEsgProfile } from '../../../api/products';
import { esgProfileSchema } from '../../../lib/validation';
import { toDateInputValue } from '../../../lib/date';
import Button from '../../../components/Button';
import Field from '../../../components/Field';
import SelectField from '../../../components/SelectField';
import Modal from '../../../components/Modal';
import Spinner from '../../../components/Spinner';

const statusStyles = {
  DRAFT: 'bg-white/5 text-ink-400',
  PUBLISHED: 'bg-primary-500/15 text-primary-400',
};

const emptyMetric = { pillar: 'ENVIRONMENTAL', name: '', value: '', unit: '' };

const ProfileForm = ({ product, profile, onSaved, onCancel }) => {
  const isEditing = Boolean(profile);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(esgProfileSchema),
    defaultValues: profile
      ? {
          assessedAt: toDateInputValue(profile.assessedAt),
          carbonFootprintKgCo2e: profile.carbonFootprintKgCo2e ?? '',
          overallScore: profile.overallScore ?? '',
          notes: profile.notes ?? '',
          status: profile.status,
          metrics: profile.metrics?.length ? profile.metrics : [emptyMetric],
        }
      : {
          assessedAt: '',
          carbonFootprintKgCo2e: '',
          overallScore: '',
          notes: '',
          status: 'DRAFT',
          metrics: [emptyMetric],
        },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'metrics' });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (isEditing) {
        await updateEsgProfile(product.id, profile.id, data);
        toast.success('ESG profile updated');
      } else {
        await createEsgProfile(product.id, data);
        toast.success('ESG profile created');
      }
      onSaved();
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Could not save ESG profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Assessed on (optional)"
          type="date"
          error={errors.assessedAt?.message}
          {...register('assessedAt')}
        />
        <SelectField label="Status" error={errors.status?.message} {...register('status')}>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </SelectField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Carbon footprint (kg CO2e, optional)"
          type="number"
          step="any"
          error={errors.carbonFootprintKgCo2e?.message}
          {...register('carbonFootprintKgCo2e')}
        />
        <Field
          label="Overall score (0-100, optional)"
          type="number"
          step="any"
          error={errors.overallScore?.message}
          {...register('overallScore')}
        />
      </div>
      <Field
        label="Notes (optional)"
        type="text"
        placeholder="Assessment notes"
        error={errors.notes?.message}
        {...register('notes')}
      />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-ink-200">Metrics</span>
          <button
            type="button"
            onClick={() => append(emptyMetric)}
            className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary-400 hover:text-primary-300"
          >
            <Plus size={14} /> Add metric
          </button>
        </div>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-start gap-2">
              <SelectField {...register(`metrics.${index}.pillar`)}>
                <option value="ENVIRONMENTAL">Environmental</option>
                <option value="SOCIAL">Social</option>
                <option value="GOVERNANCE">Governance</option>
              </SelectField>
              <Field
                type="text"
                placeholder="Metric name"
                error={errors.metrics?.[index]?.name?.message}
                {...register(`metrics.${index}.name`)}
              />
              <Field
                type="text"
                placeholder="Value"
                error={errors.metrics?.[index]?.value?.message}
                {...register(`metrics.${index}.value`)}
              />
              <Field type="text" placeholder="Unit" {...register(`metrics.${index}.unit`)} />
              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-2 cursor-pointer rounded-lg p-2 text-ink-400 transition-colors hover:bg-white/5 hover:text-danger-400"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Create version'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

const ProductEsgProfilesModal = ({ product, open, onClose }) => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formTarget, setFormTarget] = useState(null); // null = list view, 'new' | profile object = form view

  const fetchProfiles = () => {
    if (!product) return;
    setLoading(true);
    listEsgProfiles(product.id)
      .then((data) => setProfiles(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Could not load ESG profiles'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!open || !product) return;

    let cancelled = false;
    listEsgProfiles(product.id)
      .then((data) => {
        if (!cancelled) setProfiles(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load ESG profiles');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, product]);

  if (!product) return null;

  return (
    <Modal open={open} onClose={onClose} title={`ESG profiles — ${product.name}`}>
      {formTarget ? (
        <ProfileForm
          product={product}
          profile={formTarget === 'new' ? null : formTarget}
          onSaved={() => {
            setFormTarget(null);
            fetchProfiles();
          }}
          onCancel={() => setFormTarget(null)}
        />
      ) : (
        <div>
          <div className="mb-4 flex justify-end">
            <Button size="sm" variant="primary" onClick={() => setFormTarget('new')}>
              <Plus size={16} /> New version
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : profiles.length === 0 ? (
            <p className="py-4 text-center text-sm text-ink-400">No ESG profiles yet.</p>
          ) : (
            <div className="space-y-2">
              {profiles.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-border-subtle px-4 py-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink-50">v{p.version}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyles[p.status] ?? statusStyles.DRAFT}`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-ink-400">
                      Score: {p.overallScore ?? '—'} &middot; Carbon: {p.carbonFootprintKgCo2e ?? '—'} kg CO2e &middot;{' '}
                      {p.metrics?.length ?? 0} metrics
                    </div>
                  </div>
                  {p.status === 'DRAFT' && (
                    <Button size="sm" variant="secondary" onClick={() => setFormTarget(p)}>
                      Edit
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ProductEsgProfilesModal;
