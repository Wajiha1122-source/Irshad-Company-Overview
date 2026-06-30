import { useEffect } from 'react';

const decodeFragmentJson = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  return JSON.parse(atob(padded));
};

const SsoComplete = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get('token');
    const user = params.get('user');
    const redirect = params.get('redirect') || '/dashboard';

    if (!token || !user) {
      window.location.replace('/login');
      return;
    }

    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(decodeFragmentJson(user)));
      window.location.replace(redirect.startsWith('/') ? redirect : '/dashboard');
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.replace('/login');
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-teal-300" />
    </div>
  );
};

export default SsoComplete;
