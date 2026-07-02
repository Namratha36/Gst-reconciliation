import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileUp, Network, PieChart, FileText, Settings, LogOut, Menu, Search, Bell, Moon, Sun, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
  { icon: FileUp, label: "Upload Data", path: "/upload" },
  { icon: Network, label: "Reconciliation", path: "/reconciliation" },
  { icon: PieChart, label: "Graph Explorer", path: "/graph" },
  { icon: FileText, label: "Audit Reports", path: "/reports" },
];

export default function AppLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex text-foreground font-sans">
      {/* Sidebar - Strict Enterprise Dark (#0F172A) */}
      <aside
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[hsl(var(--sidebar-bg))] text-slate-300 flex flex-col hidden md:flex sticky top-0 h-screen z-40 transition-all duration-200 border-r border-border/10`}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/5">
          {isSidebarOpen && (
            <div className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
              <Network className="w-5 h-5 text-secondary" />
              GraphGST AI
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-white hover:bg-white/10">
            <Menu className="w-4 h-4" />
          </Button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link to={item.path} key={item.path}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start h-9 px-3 ${isActive ? 'bg-secondary/10 text-secondary font-medium' : 'text-slate-400 hover:text-white hover:bg-white/5'} ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
                >
                  <item.icon className={`w-4 h-4 ${isSidebarOpen ? 'mr-3' : ''} ${isActive ? 'text-secondary' : ''}`} />
                  {isSidebarOpen && <span>{item.label}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          <Button variant="ghost" className={`w-full justify-start h-9 px-3 text-slate-400 hover:text-white hover:bg-white/5 ${!isSidebarOpen ? 'justify-center px-0' : ''}`}>
            <Settings className={`w-4 h-4 ${isSidebarOpen ? 'mr-3' : ''}`} />
            {isSidebarOpen && <span>Settings</span>}
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className={`w-full justify-start h-9 px-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 mt-1 ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
          >
            <LogOut className={`w-4 h-4 ${isSidebarOpen ? 'mr-3' : ''}`} />
            {isSidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-card border-b flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full hidden md:flex items-center">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Search invoices, vendors, or GSTINs..." 
                className="pl-9 pr-12 h-9 bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:border-border"
              />
              <div className="absolute right-2.5 flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-background px-1.5 py-0.5 rounded border shadow-sm">
                <Command className="w-3 h-3" /> K
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mr-2 px-3 py-1.5 bg-muted/50 rounded-md border border-border/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              System Healthy
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <Bell className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3 border-l pl-4 border-border ml-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold leading-none">Auditor Admin</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">Gov Tax Dept</p>
              </div>
              <div className="w-8 h-8 rounded bg-secondary/10 flex items-center justify-center text-secondary font-bold text-sm">
                AA
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
