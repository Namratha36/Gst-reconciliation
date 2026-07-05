import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  // For hackathon/demo purposes, we automatically mock a token if none exists 
  // so judges don't get stuck on the login screen, UNLESS they explicitly logged out.
  let token = localStorage.getItem("token");
  const explicitLogout = localStorage.getItem("explicit_logout");
  
  if (!token && !explicitLogout) {
    localStorage.setItem("token", "demo-token-123");
    token = "demo-token-123";
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
