import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "sonner";
import { ErrorBoundary } from "react-error-boundary";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import ErrorFallback from "./components/ErrorFallback";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UploadData from "./pages/UploadData";
import Dashboard from "./pages/Dashboard";
import GraphExplorer from "./pages/GraphExplorer";
import Reports from "./pages/Reports";
import Landing from "./pages/Landing";
import AppLayout from "./components/layout/AppLayout";
import Reconciliation from "./pages/Reconciliation";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="graphgst-theme">
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Authenticated Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <Dashboard />
                </ErrorBoundary>
              } />
              <Route path="/upload" element={<UploadData />} />
              <Route path="/reconciliation" element={
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <Reconciliation />
                </ErrorBoundary>
              } /> 
              <Route path="/graph" element={
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <GraphExplorer />
                </ErrorBoundary>
              } />
              <Route path="/reports" element={
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <Reports />
                </ErrorBoundary>
              } />
            </Route>
          </Route>
        </Routes>
      </Router>
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}

export default App;
