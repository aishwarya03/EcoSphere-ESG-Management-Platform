import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { registerSchema } from '../../lib/validation';
import Field from '../../components/Field';
import Button from '../../components/Button';

const Register = () => {
  const { registerOrganization } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      organizationName: '',
      name: '',
      email: '',
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await registerOrganization(data);
      toast.success('Organization created');
      navigate('/dashboard');
    } catch (error) {
      toast.error(
        error?.response?.data?.message ?? 'Could not create organization'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="mb-1 font-heading text-2xl font-bold text-ink-50">
        Create your organization
      </h1>
      <p className="mb-6 text-sm text-ink-400">
        You&apos;ll be the admin for your organization&apos;s ESG workspace.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field
          label="Organization name"
          type="text"
          placeholder="Acme Corp"
          error={errors.organizationName?.message}
          {...register('organizationName')}
        />
        <Field
          label="Your name"
          type="text"
          placeholder="Aishwarya"
          error={errors.name?.message}
          {...register('name')}
        />
        <Field
          label="Email"
          type="email"
          placeholder="admin@acme.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Field
          label="Username"
          type="text"
          placeholder="admin"
          error={errors.username?.message}
          {...register('username')}
        />
        <Field
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create organization'} <ArrowRight size={18} />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-400 hover:text-primary-300">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Register;
