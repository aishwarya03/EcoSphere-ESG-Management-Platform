import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { getEsgConfig, updateEsgConfig } from '../../../api/esgConfig';
import { esgConfigSchema } from '../../../lib/validation';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Field from '../../../components/Field';
import Switch from '../../../components/Switch';
import Spinner from '../../../components/Spinner';

const EsgConfigPanel = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(esgConfigSchema),
  });

  useEffect(() => {
    getEsgConfig()
      .then((config) => reset(config))
      .catch(() => toast.error('Could not load ESG configuration'))
      .finally(() => setLoading(false));
  }, [reset]);

  const [envW, socW, govW] = watch([
    'environmentalWeight',
    'socialWeight',
    'governanceWeight',
  ]);
  const sum = [envW, socW, govW]
    .map((v) => Number(v) || 0)
    .reduce((a, b) => a + b, 0);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const updated = await updateEsgConfig(data);
      reset(updated);
      toast.success('ESG configuration saved');
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Could not save configuration');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card className="mb-4">
        <h3 className="mb-1 font-heading text-sm font-semibold text-ink-50">Scoring weights</h3>
        <p className="mb-4 text-xs text-ink-400">
          Environmental, Social and Governance weights must add up to 100.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Environmental %"
            type="number"
            min={0}
            max={100}
            error={errors.environmentalWeight?.message}
            {...register('environmentalWeight', { valueAsNumber: true })}
          />
          <Field
            label="Social %"
            type="number"
            min={0}
            max={100}
            error={errors.socialWeight?.message}
            {...register('socialWeight', { valueAsNumber: true })}
          />
          <Field
            label="Governance %"
            type="number"
            min={0}
            max={100}
            error={errors.governanceWeight?.message}
            {...register('governanceWeight', { valueAsNumber: true })}
          />
        </div>
        <p className={`mt-3 text-xs font-medium ${sum === 100 ? 'text-primary-400' : 'text-danger-400'}`}>
          Total: {sum}%{sum !== 100 && ' — must equal 100%'}
        </p>
      </Card>

      <Card className="mb-4 divide-y divide-border-subtle">
        <h3 className="mb-1 pb-3 font-heading text-sm font-semibold text-ink-50">
          Automation toggles
        </h3>
        <Controller
          control={control}
          name="autoEmissionCalculation"
          render={({ field }) => (
            <Switch
              label="Auto emission calculation"
              description="Calculate carbon transactions automatically from linked Purchase/Manufacturing/Expense/Fleet records."
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="evidenceRequired"
          render={({ field }) => (
            <Switch
              label="Evidence required"
              description="CSR activity participation can't be marked Approved without an attached proof file."
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="badgeAutoAward"
          render={({ field }) => (
            <Switch
              label="Badge auto-award"
              description="Automatically assign a badge the moment an employee's metrics satisfy its unlock rule."
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </Card>

      <Button type="submit" variant="primary" disabled={submitting}>
        {submitting ? 'Saving...' : 'Save configuration'}
      </Button>
    </form>
  );
};

export default EsgConfigPanel;
