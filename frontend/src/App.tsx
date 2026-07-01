import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UploadData from "./pages/UploadData";
import Dashboard from "./pages/Dashboard";
import GraphExplorer from "./pages/GraphExplorer";
import Reports from "./pages/Reports";

function App() {
  return (
    <Router>
      <div className="min-h-screen w-full bg-background font-sans antialiased text-foreground">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/upload" element={<UploadData />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/graph" element={<GraphExplorer />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
