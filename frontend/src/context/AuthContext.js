import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setAuthToken } from '../services/api';

const KEY = 'feedants.token';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ token: null, user: null, ready: false });

  // Restore session on launch.
  useEffect(() => {
    (async () => {
      let token = null;
      let user = null;
      try {
        token = await AsyncStorage.getItem(KEY);
        if (token) {
          setAuthToken(token);
          user = (await api.me()).data;
        }
      } catch (e) {
        if (e.status === 401) {
          token = null;
          setAuthToken(null);
          await AsyncStorage.removeItem(KEY);
        }
      }
      setState({ token, user, ready: true });
    })();
  }, []);

  const persist = useCallback(async ({ token, user }) => {
    setAuthToken(token);
    await AsyncStorage.setItem(KEY, token);
    setState({ token, user, ready: true });
  }, []);

  const login = useCallback(async (email, password) => persist((await api.login({ email, password })).data), [persist]);
  const signup = useCallback(async (payload) => persist((await api.signup(payload)).data), [persist]);
  const logout = useCallback(async () => {
    setAuthToken(null);
    await AsyncStorage.removeItem(KEY);
    setState({ token: null, user: null, ready: true });
  }, []);

  const value = useMemo(() => ({ ...state, login, signup, logout }), [state, login, signup, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
