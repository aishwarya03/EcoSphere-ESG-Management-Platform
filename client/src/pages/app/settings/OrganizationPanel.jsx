import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { getOrganization, updateOrganization } from '../../../api/organization';
import { organizationSchema } from '../../../lib/validation';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Field from '../../../components/Field';
import Spinner from '../../../components/Spinner';

const OrganizationPanel = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(organizationSchema) });

  useEffect(() => {
    getOrganization()
      .then((org) => reset({ name: org.name, type: org.type ?? '' }))
      .catch(() => toast.error('Could not load organization profile'))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const updated = await updateOrganization(data);
      reset({ name: updated.name, type: updated.type ?? '' });
      toast.success('Organization profile saved');
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Could not save organization profile');
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
    <Card className="max-w-lg">
      <p className="mb-4 text-sm text-ink-400">Your organization&apos;s basic profile.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field
          label="Organization name"
          type="text"
          placeholder="Acme Corp"
          error={errors.name?.message}
          {...register('name')}
        />
        <Field
          label="Industry / type (optional)"
          type="text"
          placeholder="Manufacturing"
          error={errors.type?.message}
          {...register('type')}
        />
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save changes'}
        </Button>
      </form>
    </Card>
  );
};

export default OrganizationPanel;
