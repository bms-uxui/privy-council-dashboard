/**
 * สนามเด็กเล่นสำหรับนักออกแบบ
 *
 * พื้นที่ของคุณสำหรับทดลองอิสระ!
 * UI framework และไอคอนทั้งหมดถูก import ไว้ให้แล้วด้านล่าง
 * แค่เอา comment ออกแล้วเริ่มออกแบบได้เลย
 *
 * ลิงก์ด่วน:
 *   เอกสาร HeroUI:  https://www.heroui.com/docs
 *   เอกสาร MUI:     https://mui.com/material-ui/
 *   เอกสาร Radix:   https://www.radix-ui.com/themes/docs
 *   ไอคอน:          https://lucide.dev/icons/
 */

// ── HeroUI ──────────────────────────────────────────────
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Input,
  Chip,
  Avatar,
  Tooltip,
  Divider,
  Tabs,
  Tab,
  Badge,
  Spinner,
  Switch,
  Textarea,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";

// ── ไอคอน Lucide (เลือกได้จาก https://lucide.dev/icons/) ──
import {
  Heart,
  Star,
  Search,
  Bell,
  Settings,
  User,
  Home,
  Mail,
  Plus,
  ArrowRight,
  Check,
  X,
  Menu,
  ChevronDown,
  Download,
  Upload,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Copy,
  Share2,
  Bookmark,
  Filter,
  MoreHorizontal,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Globe,
  Zap,
  ShoppingCart,
  CreditCard,
  Package,
  TrendingUp,
  BarChart3,
  PieChart,
  Image,
  Camera,
  Mic,
  Play,
  Pause,
  SkipForward,
  Volume2,
  Sun,
  Moon,
  Cloud,
  Wifi,
  Lock,
  Unlock,
  Shield,
  AlertCircle,
  Info,
  HelpCircle,
  ThumbsUp,
  MessageCircle,
  Send,
} from "lucide-react";

export default function Playground() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* ── หัวข้อ ── */}
        <div>
          <h1 className="text-3xl font-bold text-text">สนามเด็กเล่น</h1>
          <p className="text-text-muted mt-1">
            พื้นที่ของคุณสำหรับออกแบบอิสระ แก้ไขไฟล์นี้ได้ที่{" "}
            <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">
              src/pages/Playground.tsx
            </code>
          </p>
        </div>

        {/* ── เริ่มออกแบบด้านล่างนี้ ── */}

        <Card className="p-4">
          <CardBody>
            <p className="text-text-muted">
              ลบการ์ดนี้แล้วเริ่มสร้างงานออกแบบของคุณที่นี่!
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
