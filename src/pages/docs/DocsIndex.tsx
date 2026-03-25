import { Link } from "react-router";
import {
  ArrowLeft,
  TextCursorInput,
  RectangleHorizontal,
  ToggleLeft,
  ListChecks,
  Square,
  Table2,
  SlidersHorizontal,
  MessageSquare,
  Menu,
  Layers,
  ChevronsUpDown,
  CalendarDays,
  Image,
  Loader,
  CircleAlert,
  PanelTop,
  Grip,
  ChevronRight,
} from "lucide-react";

const heroUIComponents = [
  { name: "Input", path: "/docs/input", icon: TextCursorInput, description: "ช่องข้อความ ช่องค้นหา ช่องรหัสผ่าน" },
  { name: "Button", path: "/docs/button", icon: RectangleHorizontal, description: "ปุ่มกดพร้อมรูปแบบและไอคอน" },
  { name: "Select", path: "/docs/select", icon: ChevronsUpDown, description: "เมนูเลือกแบบดร็อปดาวน์" },
  { name: "Checkbox", path: "/docs/checkbox", icon: ListChecks, description: "เช็กบ็อกซ์เดี่ยวและกลุ่ม" },
  { name: "Switch", path: "/docs/switch", icon: ToggleLeft, description: "สวิตช์เปิด/ปิด" },
  { name: "Slider", path: "/docs/slider", icon: SlidersHorizontal, description: "แถบเลื่อนสำหรับค่าตัวเลข" },
  { name: "Textarea", path: "/docs/textarea", icon: Square, description: "ช่องข้อความหลายบรรทัด" },
  { name: "Card", path: "/docs/card", icon: Layers, description: "กล่องเนื้อหาพร้อมส่วนหัวและส่วนท้าย" },
  { name: "Modal", path: "/docs/modal", icon: MessageSquare, description: "หน้าต่างป๊อปอัพและไดอะล็อก" },
  { name: "Table", path: "/docs/table", icon: Table2, description: "ตารางข้อมูลพร้อมเรียงลำดับและเลือกแถว" },
  { name: "Tabs", path: "/docs/tabs", icon: PanelTop, description: "แท็บนำทางแบบแผง" },
  { name: "Navbar", path: "/docs/navbar", icon: Menu, description: "แถบนำทางด้านบน" },
  { name: "Dropdown", path: "/docs/dropdown", icon: Grip, description: "เมนูดร็อปดาวน์และเมนูบริบท" },
  { name: "Avatar", path: "/docs/avatar", icon: Image, description: "รูปโปรไฟล์ผู้ใช้และอักษรย่อ" },
  { name: "Badge / Chip", path: "/docs/chip", icon: CircleAlert, description: "ตัวแสดงสถานะและแท็ก" },
  { name: "Spinner", path: "/docs/spinner", icon: Loader, description: "ตัวแสดงสถานะกำลังโหลด" },
  { name: "Date Picker", path: "/docs/date-picker", icon: CalendarDays, description: "เลือกวันที่และช่วงวันที่" },
  { name: "Tooltip", path: "/docs/tooltip", icon: MessageSquare, description: "ป๊อปอัพข้อมูลเมื่อวางเมาส์" },
];

export default function DocsIndex() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary mb-6"
        >
          <ArrowLeft size={14} />
          กลับหน้าหลัก
        </Link>

        <h1 className="text-3xl font-bold text-text mb-2">เอกสารคอมโพเนนต์</h1>
        <p className="text-text-muted mb-8">
          เอกสาร HeroUI อย่างเป็นทางการ ฝังไว้เพื่อดูอ้างอิงอย่างรวดเร็ว คลิกคอมโพเนนต์ใดก็ได้เพื่อดูเอกสารฉบับเต็ม
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {heroUIComponents.map((comp) => (
            <Link
              key={comp.path}
              to={comp.path}
              className="group flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                <comp.icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text">{comp.name}</p>
                <p className="text-xs text-text-muted truncate">{comp.description}</p>
              </div>
              <ChevronRight size={14} className="text-gray-300 group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
