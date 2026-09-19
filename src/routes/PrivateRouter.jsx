import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const PrivateRouter = ({ children }) => {
    const location = useLocation();
    const { user, loading } = useAuth();

    if (loading) return null;
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

    return children;
};

export default PrivateRouter;