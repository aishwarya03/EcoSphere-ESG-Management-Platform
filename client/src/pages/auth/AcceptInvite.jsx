import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { ArrowRight, MailWarning } from 'lucide-react';
import { previewInvite } from '../../api/auth';
import { useAuth } from '../../context/useAuth';
import { acceptInviteSchema } from '../../lib/validation';
import Field from '../../components/Field';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';

const AcceptInvite = () => {
  const { token } = useParams();
  const { acceptInvite } = useAuth();
  const navigate = useNavigate();

  const [invite, setInvite] = useState(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [inviteError, setInviteError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: { username: '', password: '' },
  });

  useEffect(() => {
    previewInvite(token)
      .then(setInvite)
      .catch(() =>
        setInviteError('This invite link is invalid or has expired.')
      )
      .finally(() => setLoadingInvite(false));
  }, [token]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await acceptInvite(token, data);
      toast.success('Welcome to EcoSphere');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Could not accept invite');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInvite) {
    return (
      <div className="flex justify-center py-6">
        <Spinner />
      </div>
    );
  }

  if (inviteError) {
    return (
      <div className="text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-500/15 text-danger-400">
          <MailWarning size={22} />
        </span>
        <h1 className="mb-2 font-heading text-xl font-bold text-ink-50">
          Invite not found
        </h1>
        <p className="text-sm text-ink-400">{inviteError}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 font-heading text-2xl font-bold text-ink-50">
        Join {invite.organizationName}
      </h1>
      <p className="mb-6 text-sm text-ink-400">
        Set a username and password for <span className="text-ink-200">{invite.email}</span>.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field
          label="Username"
          type="text"
          placeholder="employee1"
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
          {submitting ? 'Joining...' : 'Join organization'} <ArrowRight size={18} />
        </Button>
      </form>
    </div>
  );
};

export default AcceptInvite;
