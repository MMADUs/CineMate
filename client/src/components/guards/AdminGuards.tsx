import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { useGetAdminProfile } from '../../api/hooks/Admin/useGetAdminProfile';

export const AdminGuard: React.FC = () => {
    const { data: admin, isLoading, isError } = useGetAdminProfile();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
                <span className="text-white/50 animate-pulse font-semibold tracking-widest">VERIFYING ACCESS...</span>
            </div>
        );
    }

    if (isError || !admin) {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
};