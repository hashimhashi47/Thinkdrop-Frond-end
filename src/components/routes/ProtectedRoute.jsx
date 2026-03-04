import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    const userRole = localStorage.getItem('userRole');

    // If there's no role in localStorage, the user is not authenticated
    if (!userRole) {
        return <Navigate to="/login" replace />;
    }

    const isUser = userRole === 'user';
    const isAdminRoute = allowedRoles.includes('admin');
    const isUserRoute = allowedRoles.includes('user');

    // Case 1: Standard User trying to access non-user route (e.g. admin page)
    if (isUser && !isUserRoute) {
        return <Navigate to="/" replace />;
    }

    // Case 2: Admin-level role (anything not 'user') trying to access user route
    if (!isUser && !isAdminRoute) {
        return <Navigate to="/admin" replace />;
    }

    // Case 3: Role is simply not permitted (if we had complex non-overlapping rules)
    if (!allowedRoles.includes(userRole) && !(!isUser && isAdminRoute)) {
        return <Navigate to={isUser ? "/" : "/admin"} replace />;
    }

    // User is authorized, render the child routes
    return <Outlet />;
};

export default ProtectedRoute;
