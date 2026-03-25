import { useState } from "react";
import {
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Download,
  Clock,
  Server,
  Filter,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { providers, submissionLogs } from "../data/mockData";

const STATUS_CONFIG = {
  online: { color: "#16A34A", bg: "bg-green-50", text: "text-green-600", label: "ออนไลน์" },
  offline: { color: "#DC2626", bg: "bg-red-50", text: "text-red-600", label: "ออฟไลน์" },
  degraded: { color: "#D4AF37", bg: "bg-amber-50", text: "text-amber-600", label: "ไม่เสถียร" },
};

const SEVERITY_CONFIG = {
  info: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: CheckCircle2, label: "สำเร็จ" },
  warning: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: AlertTriangle, label: "คำเตือน" },
  error: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: XCircle, label: "ผิดพลาด" },
};

// Error breakdown data
const errorBreakdown = [
  { type: "duplicate_record", label: "ข้อมูลซ้ำ", count: 8 },
  { type: "schema_mismatch", label: "Schema ไม่ตรง", count: 5 },
  { type: "validation_error", label: "Validation ผิดพลาด", count: 3 },
  { type: "connection_timeout", label: "เชื่อมต่อล้มเหลว", count: 2 },
];

export default function Admin() {
  const [filterSeverity, setFilterSeverity] = useState<"all" | "info" | "warning" | "error">("all");
  const [filterProvider, setFilterProvider] = useState<string>("all");
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const filteredLogs = submissionLogs.filter((log) => {
    if (filterSeverity !== "all" && log.severity !== filterSeverity) return false;
    if (filterProvider !== "all" && log.providerId !== filterProvider) return false;
    return true;
  });

  const handleRebuild = () => {
    setIsRebuilding(true);
    setTimeout(() => setIsRebuilding(false), 3000);
  };

  const totalRecords = submissionLogs.reduce((s, l) => s + l.recordCount, 0);
  const totalSuccess = submissionLogs.reduce((s, l) => s + l.successCount, 0);
  const totalFailed = submissionLogs.reduce((s, l) => s + l.failedCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-royal-blue flex items-center gap-3">
            <Shield size={28} />
            ผู้ดูแลระบบ
          </h1>
          <p className="text-text-muted text-sm mt-1">
            เฝ้าระวังสถานะ API และล็อกการนำเข้าข้อมูลจากหน่วยบริการ
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRebuild}
            disabled={isRebuilding}
            className="flex items-center gap-2 px-5 py-2.5 bg-royal-blue text-white rounded-xl text-sm font-medium hover:bg-royal-blue-light transition-all min-h-[48px] disabled:opacity-60"
          >
            {isRebuilding ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            {isRebuilding ? "กำลัง Rebuild..." : "Rebuild Summary"}
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-text border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all min-h-[48px]">
            <Download size={16} />
            ดาวน์โหลดล็อก
          </button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Server size={20} className="text-royal-blue" />
            </div>
            <span className="text-xs text-text-muted">ระเบียนทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-text">{totalRecords.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-green-600" />
            </div>
            <span className="text-xs text-text-muted">สำเร็จ</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{totalSuccess.toLocaleString()}</p>
          <p className="text-xs text-text-muted mt-1">
            {((totalSuccess / totalRecords) * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <XCircle size={20} className="text-red-600" />
            </div>
            <span className="text-xs text-text-muted">ล้มเหลว</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{totalFailed.toLocaleString()}</p>
          <p className="text-xs text-text-muted mt-1">
            {((totalFailed / totalRecords) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Provider Status Cards + Error Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Provider Status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
            <Activity size={20} className="text-royal-blue" />
            สถานะหน่วยบริการ
          </h3>
          <div className="space-y-3">
            {providers.map((provider) => {
              const status = STATUS_CONFIG[provider.status];
              return (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Status Indicator Light */}
                    <div className="relative">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      {provider.status === "online" && (
                        <div
                          className="absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-40"
                          style={{ backgroundColor: status.color }}
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text">
                        {provider.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        {provider.nameEn}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}
                    >
                      {status.label}
                    </span>
                    <p className="text-xs text-text-muted mt-1">
                      อัปเดต: {new Date(provider.lastSync).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Breakdown Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-500" />
            ประเภทข้อผิดพลาด
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={errorBreakdown} layout="vertical" barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 11 }}
                axisLine={false}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
              <Bar
                dataKey="count"
                name="จำนวน"
                fill="#DC2626"
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 flex justify-end">
            <button className="flex items-center gap-2 text-xs text-royal-blue hover:underline font-medium min-h-[44px]">
              <Download size={14} />
              ดาวน์โหลด Failed Records (CSV)
            </button>
          </div>
        </div>
      </div>

      {/* Submission Logs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <h3 className="text-lg font-bold text-text flex items-center gap-2">
            <Clock size={20} className="text-royal-blue" />
            ล็อกการนำเข้าข้อมูล
          </h3>
          <div className="flex gap-2">
            {/* Severity Filter */}
            <div className="flex gap-1 bg-gray-50 rounded-xl p-1">
              <Filter size={14} className="text-text-muted self-center ml-2" />
              {(["all", "info", "warning", "error"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterSeverity(s)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all min-h-[44px] ${
                    filterSeverity === s
                      ? "bg-royal-blue text-white"
                      : "text-text-muted hover:bg-white"
                  }`}
                >
                  {s === "all"
                    ? "ทั้งหมด"
                    : SEVERITY_CONFIG[s].label}
                </button>
              ))}
            </div>
            {/* Provider Filter */}
            <select
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
              className="px-3 py-2 rounded-xl bg-gray-50 border-none text-xs font-medium text-text-muted focus:outline-none focus:ring-2 focus:ring-royal-blue/20 min-h-[44px]"
            >
              <option value="all">ทุกหน่วยบริการ</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Log Entries */}
        <div className="divide-y divide-gray-50">
          {filteredLogs.map((log) => {
            const sev = SEVERITY_CONFIG[log.severity];
            const SevIcon = sev.icon;
            const isExpanded = expandedLog === log.id;
            return (
              <div key={log.id} className="px-5 py-4 hover:bg-gray-50/50 transition-colors">
                <div
                  className="flex items-center gap-4 cursor-pointer"
                  onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                >
                  {/* Severity Icon */}
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${sev.bg}`}
                  >
                    <SevIcon size={16} className={sev.text} />
                  </div>

                  {/* Log Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sev.bg} ${sev.text}`}
                      >
                        {sev.label}
                      </span>
                      <span className="text-xs text-text-muted">
                        {log.providerName}
                      </span>
                    </div>
                    <p className="text-sm text-text truncate">{log.message}</p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-text-muted">ระเบียน</p>
                      <p className="text-sm font-medium text-text">
                        {log.successCount}/{log.recordCount}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-text-muted">เวลา</p>
                      <p className="text-xs text-text-muted">
                        {new Date(log.timestamp).toLocaleString("th-TH", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-text-light" />
                    ) : (
                      <ChevronDown size={16} className="text-text-light" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-3 ml-13 p-4 rounded-xl bg-gray-50 text-xs font-mono text-text-muted">
                    <p><strong>Log ID:</strong> {log.id}</p>
                    <p><strong>Provider ID:</strong> {log.providerId}</p>
                    <p><strong>Timestamp:</strong> {log.timestamp}</p>
                    <p><strong>Records:</strong> {log.recordCount} total, {log.successCount} success, {log.failedCount} failed</p>
                    {log.errorType && <p><strong>Error Type:</strong> {log.errorType}</p>}
                    <p><strong>Message:</strong> {log.message}</p>
                    {log.failedCount > 0 && (
                      <button className="mt-2 flex items-center gap-1 text-royal-blue hover:underline">
                        <Download size={12} />
                        ดาวน์โหลด Failed Records (JSON)
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
