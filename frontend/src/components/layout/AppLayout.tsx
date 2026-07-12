import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, FileUp, Network, PieChart, FileText,
  LogOut, Menu, Bell, Moon, Sun,
  Users, Bot, ShieldAlert, Map, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { toast } from "sonner";
import { authenticationService } from "@/services/authenticationService";
import type { User } from "@/types/domain";

const navItems = [
  { icon: LayoutDashboard, label: "Mission Control", path: "/dashboard" },
  { icon: FileUp, label: "Upload GST Files", path: "/upload" },
  { icon: Map, label: "Operations Board", path: "/operations" },
  { icon: FileText, label: "Compliance Cases", path: "/cases" },
  { icon: Zap, label: "Action Center", path: "/actions" },
  { icon: PieChart, label: "Knowledge Graph", path: "/graph" },
  { icon: Users, label: "Vendor Intelligence", path: "/vendors" },
  { icon: Bot, label: "AI Copilot", path: "/copilot" },
  { icon: ShieldAlert, label: "Approvals", path: "/approvals" },
  { icon: LayoutDashboard, label: "Reports", path: "/reports" },
  { icon: Bell, label: "Alerts", path: "/alerts" },
];

export default function AppLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Show onboarding wizard logic
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("onboarding_completed");
    if (!hasSeenOnboarding && location.pathname !== "/onboarding") {
      navigate("/onboarding");
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    void authenticationService.getCurrentUser().then(setCurrentUser);
  }, []);

  const handleLogout = async () => {
    await authenticationService.logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex text-foreground font-sans selection:bg-primary/30 overflow-hidden">
      {/* Sidebar - Animated with Framer Motion */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isSidebarOpen ? 260 : 72,
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={`bg-[hsl(var(--sidebar-bg))] text-slate-300 flex flex-col sticky top-0 h-screen z-40 border-r border-border/10 overflow-hidden ${isSidebarOpen ? 'absolute md:relative' : 'hidden md:flex'}`}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/5 shrink-0">
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="font-bold text-[17px] text-white tracking-tight flex items-center gap-2 whitespace-nowrap"
              >
                <div className="w-7 h-7 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Network className="w-4 h-4 text-white" />
                </div>
                GraphGST AI
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link to={item.path} key={item.path} onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}>
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="ghost"
                    className={`w-full h-9 px-3 my-0.5 whitespace-nowrap ${isActive ? 'bg-primary/20 text-white font-medium' : 'text-slate-400 hover:text-white hover:bg-white/5'} ${!isSidebarOpen ? 'justify-center px-0' : 'justify-start'}`}
                    title={!isSidebarOpen ? item.label : undefined}
                  >
                    <item.icon className={`w-4 h-4 shrink-0 ${isSidebarOpen ? 'mr-3' : ''} ${isActive ? 'text-primary' : ''}`} />
                    <AnimatePresence>
                      {isSidebarOpen && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </Link>
            );
          })}
        </div>

        <div className="p-3 border-t border-white/5 shrink-0 bg-[hsl(var(--sidebar-bg))]">
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className={`w-full h-9 px-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 mt-1 whitespace-nowrap ${!isSidebarOpen ? 'justify-center px-0' : 'justify-start'}`}
          >
            <LogOut className={`w-4 h-4 shrink-0 ${isSidebarOpen ? 'mr-3' : ''}`} />
            <AnimatePresence>
              {isSidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Logout</motion.span>}
            </AnimatePresence>
          </Button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-card border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shadow-sm transition-colors shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!isSidebarOpen)} className="shrink-0 mr-2">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <div className="flex items-center gap-3 border-l pl-3 md:pl-4 border-border ml-1 md:ml-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold leading-none text-foreground">{currentUser?.name ?? "Signed in"}</p>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{currentUser ? `${currentUser.role} - ${currentUser.organizationName}` : "Backend session"}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shadow-md">
                {currentUser?.name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() ?? "U"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content with Fade In */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto bg-background">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
