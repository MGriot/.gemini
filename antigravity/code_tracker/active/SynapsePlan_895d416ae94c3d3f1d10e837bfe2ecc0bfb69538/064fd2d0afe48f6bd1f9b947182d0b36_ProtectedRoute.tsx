žimport React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
ž"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382^file:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/components/ProtectedRoute.tsx:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan