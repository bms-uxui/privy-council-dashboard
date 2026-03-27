import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Map,
  Users,
  Shield,
  Activity,
  Crown,
} from "lucide-react";

const navItems = [
  { path: "/gis", label: "แผนที่", icon: Map },
  { path: "/dashboard", label: "ศูนย์บัญชาการ", icon: LayoutDashboard },
  { path: "/household", label: "ครัวเรือน", icon: Users },
  { path: "/admin", label: "ผู้ดูแล", icon: Shield },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isGis = location.pathname === "/gis";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* ── Top Header (desktop: always, mobile: hidden on GIS) ── */}
      <div className={`${isGis ? "absolute top-0 left-0 right-0 z-30" : "flex-shrink-0"} ${isGis ? "hidden lg:block" : ""}`}>
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

              {/* Status */}
              <div className="hidden lg:flex items-center gap-2 text-[11px] text-text-muted">
                <Activity size={12} className="text-success" />
                <span>อัปเดต: 25 มี.ค. 2569, 09:10</span>
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
          </div>
        </nav>
    </div>
  );
}
