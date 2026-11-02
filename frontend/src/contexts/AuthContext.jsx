import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, getToken, setToken as persistToken } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => getToken());
  const [loading, setLoading] = useState(!!getToken());

  const fetchUser = useCallback(async () => {
    const { ok, data } = await api('/users/details');
    if (ok && data) {
      setUser(data.user || data);
    } else {
      persistToken(null);
      setTokenState(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (getToken()) {
      setLoading(true);
      fetchUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const login = useCallback(async (newToken) => {
    persistToken(newToken);
    setTokenState(newToken);
    await fetchUser();
  }, [fetchUser]);

  const logout = useCallback(() => {
    persistToken(null);
    setTokenState(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
