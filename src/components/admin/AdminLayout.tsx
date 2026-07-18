import { Logo } from '../Logo';
import { Outlet, Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  Activity, 
  Dumbbell, 
  ShoppingCart, 
  Users, 
  FileText, 
  Gift, 
  Home, 
  Settings,
  Ticket,
  MessageSquare,
  Bell,
  Search,
  Menu,
  LogOut,
  Folder,
  Zap
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../context/AuthContext";

const SIDEBAR_ITEMS = [
  { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Products", path: "/admin/products", icon: Package },
  { name: "Categories", path: "/admin/categories", icon: Folder },
  { name: "Sports", path: "/admin/sports", icon: Activity },
  { name: "Athlete Stacks", path: "/admin/stacks", icon: Dumbbell },
  { name: "NEXAI", path: "/admin/nexai", icon: Zap },
  { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", path: "/admin/customers", icon: Users },
  { name: "Blogs", path: "/admin/blogs", icon: FileText },
  { name: "Rewards", path: "/admin/rewards", icon: Gift },
  { name: "Coupons", path: "/admin/coupons", icon: Ticket },
  { name: "Reviews", path: "/admin/reviews", icon: MessageSquare },
  { name: "Homepage", path: "/admin/homepage", icon: Home },
  { name: "Settings", path: "/admin/settings", icon: Settings },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, adminData, loading, logout } = useAuth();
  
  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log("[Auth] Redirect Reason: Not authenticated. Redirecting to /control");
        navigate("/control", { replace: true });
      } else if (user && !adminData) {
        console.log("[Auth] Redirect Reason: Authenticated but not present in admin_users. Signing out and redirecting to /control.");
        logout().then(() => {
          navigate("/control", { replace: true });
        });
      }
    }
  }, [user, adminData, loading, logout, navigate]);

  if (loading) {
     return <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]"><div className="w-8 h-8 rounded-full border-4 border-[#111111] border-l-transparent animate-spin"></div></div>;
  }
  
  if (!user || !adminData) {
     return <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]"><div className="w-8 h-8 rounded-full border-4 border-[#111111] border-l-transparent animate-spin"></div></div>;
  }

  const handleSignOut = async () => {
    await logout();
    navigate("/control");
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#111111] text-white fixed h-full z-20">
        <div className="h-[80px] flex items-center px-6 border-b border-white/10">
          <Logo dark to="/admin" />
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
          <nav className="space-y-1.5">
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg text-[14px] font-medium transition-all duration-200 ${
                    isActive 
                      ? "bg-[#f47c20] text-white shadow-[0_4px_12px_rgba(244,124,32,0.3)]" 
                      : "text-[#aaaaaa] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-[#888888]'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleSignOut} className="flex items-center w-full px-4 py-3 rounded-lg text-[14px] font-medium text-[#aaaaaa] hover:bg-white/5 hover:text-white transition-all duration-200">
            <LogOut className="w-5 h-5 mr-3 text-[#888888]" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-[#111111] text-white z-40 flex flex-col md:hidden"
            >
              <div className="h-[80px] flex items-center px-6 border-b border-white/10">
                <Logo dark to="/admin" />
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
                <nav className="space-y-1.5">
                  {SIDEBAR_ITEMS.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center px-4 py-3 rounded-lg text-[14px] font-medium transition-all duration-200 ${
                          isActive 
                            ? "bg-[#f47c20] text-white shadow-[0_4px_12px_rgba(244,124,32,0.3)]" 
                            : "text-[#aaaaaa] hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-[#888888]'}`} />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="p-4 border-t border-white/10">
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center w-full px-4 py-3 rounded-lg text-[14px] font-medium text-[#aaaaaa] hover:bg-white/5 hover:text-white transition-all duration-200"
                >
                  <LogOut className="w-5 h-5 mr-3 text-[#888888]" />
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0 transition-all duration-300">
        {/* Top Header */}
        <header className="h-[80px] bg-white border-b border-[#eaeaea] sticky top-0 z-10 flex items-center justify-between px-6 lg:px-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="mr-4 p-2 -ml-2 text-[#111111] hover:bg-[#f5f5f5] rounded-lg md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex relative">
              <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search admin..." 
                className="w-64 lg:w-80 h-10 pl-10 pr-4 bg-[#f8f9fa] border border-[#eaeaea] rounded-lg text-[14px] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-shadow placeholder:text-[#aaaaaa] text-[#111111]"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-5">
            <button className="relative p-2 text-[#666666] hover:text-[#111111] hover:bg-[#f5f5f5] rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-[#f47c20] rounded-full border border-white"></span>
            </button>
            <div className="w-[1px] h-6 bg-[#eaeaea] hidden sm:block"></div>
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-[14px] uppercase">
                {user?.email?.charAt(0) || 'A'}
              </div>
              <div className="hidden sm:flex flex-col ml-3">
                <span className="text-[14px] font-semibold text-[#111111] leading-tight limit-lines-1">
                  {user?.email}
                </span>
                <span className="text-[12px] text-[#888888] leading-tight uppercase">
                  {adminData?.role || 'Admin'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-10 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
