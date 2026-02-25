import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    const userRole = localStorage.getItem('userRole');

    // If there's no role in localStorage, the user is not authenticated
    if (!userRole) {
        return <Navigate to="/login" replace />;
    }

    // If the user's role is not in the array of allowedRoles for this route
    if (!allowedRoles.includes(userRole)) {
        // Redirect admins trying to access user pages back to admin dashboard
        if (userRole === 'admin') {
            return <Navigate to="/admin" replace />;
        }
        // Redirect normal users trying to access admin pages back to the home page
        return <Navigate to="/" replace />;
    }

    // User is authorized, render the child routes
    return <Outlet />;
};

export default ProtectedRoute;
