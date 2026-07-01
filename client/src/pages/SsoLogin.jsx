import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SsoLogin = () => {
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      setError('SSO login failed: missing token.');
      return;
    }

    const backendSsoUrl = `${API_URL.replace(/\/+$/, '')}/auth/sso-login?token=${encodeURIComponent(token)}`;
    window.location.replace(backendSsoUrl);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      {error ? (
        <div className="rounded-2xl border border-rose-400/40 bg-rose-500/15 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : (
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-teal-300" />
      )}
    </div>
  );
};

export default SsoLogin;
