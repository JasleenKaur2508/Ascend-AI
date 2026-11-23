import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ascend_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('ascend_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await authAPI.getProfile();
          const localRole = localStorage.getItem('ascend_target_role');
          const fetchedUser = {
            ...res.data.user,
            targetRole: localRole || res.data.user?.targetRole || 'Full Stack Developer'
          };
          setUser(fetchedUser);
          localStorage.setItem('ascend_user', JSON.stringify(fetchedUser));
        } catch (err) {
          console.error('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('ascend_token', newToken);
    localStorage.setItem('ascend_user', JSON.stringify(newUser));
    if (newUser?.targetRole) {
      localStorage.setItem('ascend_target_role', newUser.targetRole);
    }
    return newUser;
  };

  const register = async (name, email, password, role = 'jobseeker') => {
    const res = await authAPI.register({ name, email, password, role });
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('ascend_token', newToken);
    localStorage.setItem('ascend_user', JSON.stringify(newUser));
    if (newUser?.targetRole) {
      localStorage.setItem('ascend_target_role', newUser.targetRole);
    }
    return newUser;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ascend_token');
    localStorage.removeItem('ascend_user');
    localStorage.removeItem('ascend_target_role');
  };

  const updateUser = (updated) => {
    if (updated?.targetRole) {
      localStorage.setItem('ascend_target_role', updated.targetRole);
    }
    setUser(prev => {
      const next = { ...prev, ...updated };
      localStorage.setItem('ascend_user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
