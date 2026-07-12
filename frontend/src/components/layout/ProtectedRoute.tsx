import { Navigate, Outlet } from "react-router-dom";
import { tokenStore } from "@/services/authenticationService";

export default function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const token = tokenStore.getAccessToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
