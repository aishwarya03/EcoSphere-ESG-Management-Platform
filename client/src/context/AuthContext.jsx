import { useEffect, useState } from 'react';
import * as authApi from '../api/auth';
import AuthContext from './auth-context';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')));

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    authApi
      .getMe()
      .then((data) => {
        if (cancelled) return;
        setUser(data.user);
        setOrganization(data.organization);
      })
      .catch(() => {
        if (cancelled) return;
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setOrganization(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const startSession = (result) => {
    localStorage.setItem('token', result.token);
    setUser(result.user);
    if (result.organization) setOrganization(result.organization);
    setToken(result.token);
  };

  const registerOrganization = async (data) => {
    const result = await authApi.registerOrganization(data);
    startSession(result);
    return result;
  };

  const login = async (data) => {
    const result = await authApi.login(data);
    startSession(result);
    return result;
  };

  const acceptInvite = async (inviteToken, data) => {
    const result = await authApi.acceptInvite(inviteToken, data);
    startSession(result);
    return result;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setOrganization(null);
  };

  const value = {
    token,
    user,
    organization,
    loading,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === 'ADMIN',
    registerOrganization,
    login,
    acceptInvite,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
