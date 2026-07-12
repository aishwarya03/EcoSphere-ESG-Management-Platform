import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import Field from '../../components/Field';
import Button from '../../components/Button';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login({ identifier, password });
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Email or username"
          type="text"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="admin@acme.com"
        />
        <Field
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
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
