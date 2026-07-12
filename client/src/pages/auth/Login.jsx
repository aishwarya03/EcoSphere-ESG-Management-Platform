import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { loginSchema } from '../../lib/validation';
import Field from '../../components/Field';
import Button from '../../components/Button';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await login(data);
      toast.success('Welcome back');
      navigate(location.state?.from?.pathname ?? '/dashboard', { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="mb-1 font-heading text-2xl font-bold text-ink-50">Sign in</h1>
      <p className="mb-6 text-sm text-ink-400">
        Sign in to your EcoSphere workspace.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field
          label="Email or username"
          type="text"
          placeholder="admin@acme.com"
          error={errors.identifier?.message}
          {...register('identifier')}
        />
        <Field
          label="Password"
          type="password"
          placeholder="Your password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'} <ArrowRight size={18} />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-400">
        Setting up your organization for the first time?{' '}
        <Link to="/register" className="font-medium text-primary-400 hover:text-primary-300">
          Create one
        </Link>
      </p>
    </div>
  );
};

export default Login;
