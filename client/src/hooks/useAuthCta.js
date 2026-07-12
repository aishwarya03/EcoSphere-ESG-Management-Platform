import { useAuth } from '../context/useAuth';

export const useAuthCta = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated
    ? { label: 'Go to Dashboard', to: '/dashboard' }
    : { label: 'Get Started', to: '/register' };
};
