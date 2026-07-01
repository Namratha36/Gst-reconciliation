import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const token = localStorage.getItem("token");

  if (!token) {
    // If no token exists, immediately redirect to login
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes (which will be AppLayout)
  return <Outlet />;
}
