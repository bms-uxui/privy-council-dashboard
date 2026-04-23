import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Map,
  Users,
  Shield,
  Activity,
  Crown,
  LogOut,
} from "lucide-react";

const navItems = [
  { path: "/gis", label: "แผนที่", icon: Map },
  { path: "/dashboard", label: "ศูนย์บัญชาการ", icon: LayoutDashboard },
  { path: "/household", label: "ครัวเรือน", icon: Users },
  { path: "/admin", label: "ผู้ดูแล", icon: Shield },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isGis = location.pathname === "/gis";
  const username = localStorage.getItem("auth_user") || "";

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => setShowLogoutConfirm(true);

  const confirmLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setShowLogoutConfirm(false);
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* ── Top Header (desktop only) ── */}
      <div className={`${isGis ? "absolute top-0 left-0 right-0 z-30" : "flex-shrink-0"} hidden md:block`}>
        <header className={`bg-white text-text border-b border-gray-200 ${isGis ? "shadow-md" : ""}`}>
          <div className="max-w-[1400px] mx-auto flex items-center justify-between px-3 sm:px-4 lg:px-5 h-[56px]">
              {/* Logo */}
              <Link to="/gis" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-royal-blue to-royal-blue-light flex items-center justify-center flex-shrink-0">
                  <Crown size={16} className="text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-sm font-bold tracking-wide leading-tight">
                    Village Health Dashboard
                  </h1>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={item.label}
                      className={`relative group flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                        isActive
                          ? "bg-royal-blue/10 text-royal-blue"
                          : "text-text-muted hover:bg-gray-100 hover:text-royal-blue"
                      }`}
                    >
                      <item.icon size={18} />
                      <span className="absolute top-full mt-2 px-2.5 py-1 rounded-lg bg-gray-900 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile nav — compact icon row (non-GIS pages) */}
              <nav className="flex md:hidden items-center gap-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all ${
                        isActive ? "bg-royal-blue/10 text-royal-blue" : "text-text-muted"
                      }`}
                    >
                      <item.icon size={16} />
                    </Link>
                  );
                })}
              </nav>

              {/* Status + User */}
              <div className="flex items-center gap-3">
                <div className="hidden lg:flex items-center gap-2 text-[11px] text-text-muted">
                  <Activity size={12} className="text-success" />
                  <span>อัปเดต: 25 มี.ค. 2569, 09:10</span>
                </div>
                {username && (
                  <div className="hidden md:flex items-center gap-2 pl-3 border-l border-gray-200">
                    <div className="w-7 h-7 rounded-full bg-royal-blue/10 flex items-center justify-center text-xs font-bold text-royal-blue">
                      {username[0]?.toUpperCase()}
                    </div>
                    <span className="text-xs text-text font-medium">{username}</span>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  title="ออกจากระบบ"
                  className="relative group flex items-center justify-center w-9 h-9 rounded-lg text-text-muted hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <LogOut size={16} />
                  <span className="absolute top-full mt-2 right-0 px-2.5 py-1 rounded-lg bg-gray-900 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg">
                    ออกจากระบบ
                  </span>
                </button>
              </div>
          </div>
        </header>
      </div>

      {/* Main Content */}
      {isGis ? (
        <div className="flex-1 relative">{children}</div>
      ) : (
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-5 py-4 lg:py-5">{children}</div>
        </main>
      )}

      {/* ── Mobile Bottom Tab Bar (all pages) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-bottom">
          <div className="flex items-center justify-around h-14">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                    isActive ? "text-royal-blue" : "text-text-muted"
                  }`}
                >
                  <item.icon size={20} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-text-muted active:text-red-500 transition-colors"
            >
              <LogOut size={20} />
              <span className="text-[10px] font-medium">ออก</span>
            </button>
          </div>
        </nav>

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <LogOut size={18} className="text-red-500" />
              </div>
              <h3 className="text-base font-bold text-text">ยืนยันออกจากระบบ</h3>
            </div>
            <p className="text-sm text-text-muted mb-5">
              คุณต้องการออกจากระบบหรือไม่?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-text-muted hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-sm font-medium text-white hover:bg-red-600 transition-colors"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
