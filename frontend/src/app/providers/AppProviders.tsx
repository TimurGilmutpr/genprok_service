import React from 'react';
import { AuthProvider } from '../../entities/auth/model/AuthContext';

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

export default AppProviders;
