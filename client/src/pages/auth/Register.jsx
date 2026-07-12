import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import Field from '../../components/Field';
import Button from '../../components/Button';

const initialForm = {
  organizationName: '',
  name: '',
  email: '',
  username: '',
  password: '',
};

const Register = () => {
  const { registerOrganization } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await registerOrganization(form);
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Organization name"
          type="text"
          required
          value={form.organizationName}
          onChange={handleChange('organizationName')}
          placeholder="Acme Corp"
        />
        <Field
          label="Your name"
          type="text"
          required
          value={form.name}
          onChange={handleChange('name')}
          placeholder="Aishwarya"
        />
        <Field
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={handleChange('email')}
          placeholder="admin@acme.com"
        />
        <Field
          label="Username"
          type="text"
          required
          value={form.username}
          onChange={handleChange('username')}
          placeholder="admin"
        />
        <Field
          label="Password"
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={handleChange('password')}
          placeholder="At least 8 characters"
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
