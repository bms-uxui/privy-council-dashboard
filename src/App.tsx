import { Link } from "react-router";
import {
  Sparkles,
  ArrowRight,
  Heart,
  Star,
  Search,
  Bell,
  Settings,
  User,
  Home,
  Mail,
  Plus,
  Check,
  Layers,
  Palette,
  MousePointerClick,
  BookOpen,
  Pencil,
  Component,
  Package,
  Boxes,
} from "lucide-react";

function App() {
  return (
    <div className="min-h-screen bg-[#f0f0f0] p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">

        {/* ── Row 1: Hero + HeroUI ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">

          {/* Hero Card — large left (3 cols) */}
          <Link
            to="/playground"
            className="lg:col-span-3 group relative overflow-hidden rounded-3xl bg-[#0d3b2e] text-white p-8 md:p-10 lg:p-12 min-h-[340px] flex flex-col justify-between transition-transform hover:scale-[1.005]"
          >
            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full border border-white/10" />
            <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full border border-white/5" />

            <div className="relative z-10">
              <p className="text-white/60 text-sm tracking-widest uppercase mb-4">
                React Design Starter
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                ชุดเริ่มต้น
                <br />
                <span className="text-white/70 font-light italic">ออกแบบ</span>
                {" "}UI
              </h1>
            </div>

            <div className="relative z-10 flex flex-wrap gap-2 mt-8">
              {["HeroUI", "MUI", "Radix", "Lucide", "Tailwind"].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full border border-white/20 text-xs tracking-wide uppercase text-white/80 backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="absolute bottom-8 right-8 md:bottom-10 md:right-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2 text-white/80 text-sm">
                เปิดสนามเด็กเล่น <ArrowRight size={16} />
              </div>
            </div>
          </Link>

          {/* HeroUI Card — right (2 cols) */}
          <Link
            to="/docs/button"
            className="lg:col-span-2 group relative overflow-hidden rounded-3xl bg-[#4A90D9] text-white p-8 md:p-10 min-h-[340px] flex flex-col justify-between transition-transform hover:scale-[1.005]"
          >
            {/* Decorative blueprint lines */}
            <div className="absolute top-0 right-0 w-full h-full opacity-10">
              <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
                <circle cx="300" cy="200" r="120" stroke="white" strokeWidth="0.5" />
                <circle cx="300" cy="200" r="80" stroke="white" strokeWidth="0.5" />
                <line x1="300" y1="0" x2="300" y2="400" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="100" y1="200" x2="400" y2="200" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
              </svg>
            </div>

            <div className="relative z-10">
              <p className="text-white/60 text-xs tracking-widest uppercase mb-3">
                [ UI Framework ]
              </p>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                HeroUI
              </h2>
              <p className="text-white/70 mt-2 text-sm">
                คอมโพเนนต์สวยงาม พร้อมใช้งาน
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-2 text-sm text-white/60 group-hover:text-white/90 transition-colors">
              <BookOpen size={14} />
              ดูเอกสาร
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* ── Row 2: MUI + Radix + Stats ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">

          {/* MUI Card — left (2 cols) */}
          <Link
            to="/docs/button"
            className="lg:col-span-2 group relative overflow-hidden rounded-3xl bg-[#dce8e0] p-8 md:p-10 min-h-[320px] flex flex-col justify-between transition-transform hover:scale-[1.005]"
          >
            {/* Decorative orbits */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <svg className="w-64 h-64" viewBox="0 0 200 200" fill="none">
                <ellipse cx="100" cy="100" rx="90" ry="50" stroke="#0d3b2e" strokeWidth="0.5" transform="rotate(-30 100 100)" />
                <ellipse cx="100" cy="100" rx="70" ry="35" stroke="#0d3b2e" strokeWidth="0.5" transform="rotate(20 100 100)" />
                <ellipse cx="100" cy="100" rx="50" ry="25" stroke="#0d3b2e" strokeWidth="0.5" transform="rotate(-10 100 100)" />
                <circle cx="130" cy="70" r="4" fill="#4A90D9" />
                <circle cx="60" cy="110" r="6" fill="#4A90D9" />
                <circle cx="110" cy="130" r="3" fill="#0d3b2e" />
              </svg>
            </div>

            <div className="relative z-10">
              <p className="text-[#0d3b2e]/50 text-xs tracking-widest uppercase mb-3">
                [ Material Design ]
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0d3b2e] leading-tight">
                Material UI
              </h2>
              <p className="text-[#0d3b2e]/60 mt-2 text-sm">
                ระบบออกแบบจาก Google
              </p>
            </div>

            <div className="relative z-10 flex items-end justify-between">
              <div>
                <p className="text-[#0d3b2e]/40 text-xs uppercase tracking-wider">
                  [ ความนิยม ]
                </p>
                <p className="text-4xl font-bold text-[#0d3b2e]">
                  #1
                  <span className="text-lg font-normal text-[#0d3b2e]/40 ml-1">React UI</span>
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#0d3b2e]/50 group-hover:text-[#0d3b2e]/80 transition-colors">
                <BookOpen size={14} />
                ดูเอกสาร
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Radix Card — center (2 cols) */}
          <Link
            to="/docs/button"
            className="lg:col-span-2 group relative overflow-hidden rounded-3xl bg-[#1a1a2e] text-white p-8 md:p-10 min-h-[320px] flex flex-col justify-between transition-transform hover:scale-[1.005]"
          >
            {/* Decorative grid */}
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full" style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }} />
            </div>

            <div className="relative z-10">
              <p className="text-white/40 text-xs tracking-widest uppercase mb-3">
                [ Accessible UI ]
              </p>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                Radix UI
              </h2>
              <p className="text-white/50 mt-2 text-sm">
                คอมโพเนนต์ที่เข้าถึงได้ง่าย
              </p>
            </div>

            <div className="relative z-10">
              <div className="flex gap-3 mb-4">
                {[
                  { icon: Component, label: "Primitives" },
                  { icon: Palette, label: "Themes" },
                  { icon: Boxes, label: "Icons" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <item.icon size={12} className="text-white/50" />
                    <span className="text-xs text-white/60">{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm text-white/40 group-hover:text-white/70 transition-colors">
                <BookOpen size={14} />
                ดูเอกสาร
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Stats Card — right (1 col) */}
          <div className="lg:col-span-1 flex flex-col gap-4 md:gap-6">
            {/* Lucide Icons stat */}
            <a
              href="https://lucide.dev/icons/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex-1 rounded-3xl bg-white p-6 flex flex-col justify-between transition-transform hover:scale-[1.01]"
            >
              <div className="flex items-center gap-2 text-text-muted text-xs tracking-wider uppercase">
                <Sparkles size={12} />
                ไอคอน Lucide
              </div>
              <div>
                <p className="text-3xl font-bold text-text">1,500+</p>
                <p className="text-xs text-text-muted mt-1">ไอคอนพร้อมใช้</p>
              </div>
            </a>

            {/* Components count */}
            <Link
              to="/docs"
              className="group flex-1 rounded-3xl bg-white p-6 flex flex-col justify-between transition-transform hover:scale-[1.01]"
            >
              <div className="flex items-center gap-2 text-text-muted text-xs tracking-wider uppercase">
                <Package size={12} />
                คอมโพเนนต์
              </div>
              <div>
                <p className="text-3xl font-bold text-text">18</p>
                <p className="text-xs text-text-muted mt-1">เอกสาร HeroUI</p>
              </div>
            </Link>
          </div>
        </div>

        {/* ── Row 3: Icons showcase + Quick links ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">

          {/* Icons showcase — left (3 cols) */}
          <div className="lg:col-span-3 rounded-3xl bg-white p-8 md:p-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-text-muted text-xs tracking-widest uppercase mb-1">
                  ไอคอน Lucide
                </p>
                <p className="text-sm text-text-muted">
                  <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                    {"import { Heart } from 'lucide-react'"}
                  </code>
                </p>
              </div>
              <a
                href="https://lucide.dev/icons/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                ดูทั้งหมด <ArrowRight size={12} />
              </a>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1">
              {[Heart, Star, Search, Bell, Settings, User, Home, Mail, Plus, ArrowRight, Check, Palette, Layers, MousePointerClick, Sparkles, Pencil, Component, Package, Boxes, BookOpen].map(
                (Icon, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-gray-50 transition-colors group cursor-default"
                  >
                    <Icon size={20} className="text-text/70 group-hover:text-primary transition-colors" />
                  </div>
                )
              )}
            </div>
          </div>

          {/* Quick links — right (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-4 md:gap-6">

            {/* Playground link */}
            <Link
              to="/playground"
              className="group flex-1 rounded-3xl bg-[#0d3b2e] text-white p-6 flex flex-col justify-between transition-transform hover:scale-[1.01]"
            >
              <Pencil size={20} className="text-white/50 mb-4" />
              <div>
                <h3 className="text-lg font-semibold">สนามเด็กเล่น</h3>
                <p className="text-white/50 text-xs mt-1">
                  พื้นที่ออกแบบอิสระ — ทุกอย่างพร้อมใช้
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/40 mt-4 group-hover:text-white/70 transition-colors">
                เริ่มออกแบบ <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* All docs link */}
            <Link
              to="/docs"
              className="group flex-1 rounded-3xl bg-[#4A90D9] text-white p-6 flex flex-col justify-between transition-transform hover:scale-[1.01]"
            >
              <BookOpen size={20} className="text-white/50 mb-4" />
              <div>
                <h3 className="text-lg font-semibold">เอกสารทั้งหมด</h3>
                <p className="text-white/50 text-xs mt-1">
                  คู่มือคอมโพเนนต์ HeroUI ครบ 18 ตัว
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/40 mt-4 group-hover:text-white/70 transition-colors">
                ดูเอกสาร <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="text-center py-4">
          <p className="text-text-muted text-xs">
            แก้ไขไฟล์ <code className="bg-white px-2 py-0.5 rounded">src/pages/Playground.tsx</code> เพื่อเริ่มออกแบบ
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
