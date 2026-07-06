import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "sonner";
import { ErrorBoundary } from "react-error-boundary";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import ErrorFallback from "./components/ErrorFallback";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import GraphExplorer from "./pages/GraphExplorer";
import UploadData from "./pages/UploadData";
import Reconciliation from "./pages/Reconciliation";
import Onboarding from "./pages/Onboarding";
import Copilot from "./pages/Copilot";
import Reports from "./pages/Reports";
import Vendors from "./pages/Vendors";
import Simulator from "./pages/Simulator";
import Heatmap from "./pages/Heatmap";
import Fraud from "./pages/Fraud";
import Alerts from "./pages/Alerts";
import Calendar from "./pages/Calendar";
import OperationsBoard from "./pages/OperationsBoard";
import Cases from "./pages/Cases";
import Actions from "./pages/Actions";
import Approvals from "./pages/Approvals";

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onboarding" element={
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Onboarding />
            </ErrorBoundary>
          } />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<ErrorBoundary FallbackComponent={ErrorFallback}><Dashboard /></ErrorBoundary>} />
            <Route path="/upload" element={<ErrorBoundary FallbackComponent={ErrorFallback}><UploadData /></ErrorBoundary>} />
            <Route path="/graph" element={<ErrorBoundary FallbackComponent={ErrorFallback}><GraphExplorer /></ErrorBoundary>} />
            <Route path="/reconciliation" element={<ErrorBoundary FallbackComponent={ErrorFallback}><Reconciliation /></ErrorBoundary>} />
            <Route path="/copilot" element={<ErrorBoundary FallbackComponent={ErrorFallback}><Copilot /></ErrorBoundary>} />
            <Route path="/reports" element={<ErrorBoundary FallbackComponent={ErrorFallback}><Reports /></ErrorBoundary>} />
            <Route path="/vendors" element={<ErrorBoundary FallbackComponent={ErrorFallback}><Vendors /></ErrorBoundary>} />
            <Route path="/simulator" element={<ErrorBoundary FallbackComponent={ErrorFallback}><Simulator /></ErrorBoundary>} />
            <Route path="/heatmap" element={<ErrorBoundary FallbackComponent={ErrorFallback}><Heatmap /></ErrorBoundary>} />
            <Route path="/fraud" element={<ErrorBoundary FallbackComponent={ErrorFallback}><Fraud /></ErrorBoundary>} />
            <Route path="/alerts" element={<ErrorBoundary FallbackComponent={ErrorFallback}><Alerts /></ErrorBoundary>} />
            <Route path="/calendar" element={<ErrorBoundary FallbackComponent={ErrorFallback}><Calendar /></ErrorBoundary>} />
            <Route path="/operations" element={<ErrorBoundary FallbackComponent={ErrorFallback}><OperationsBoard /></ErrorBoundary>} />
            <Route path="/cases" element={<ErrorBoundary FallbackComponent={ErrorFallback}><Cases /></ErrorBoundary>} />
            <Route path="/actions" element={<ErrorBoundary FallbackComponent={ErrorFallback}><Actions /></ErrorBoundary>} />
            <Route path="/approvals" element={<ErrorBoundary FallbackComponent={ErrorFallback}><Approvals /></ErrorBoundary>} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}
