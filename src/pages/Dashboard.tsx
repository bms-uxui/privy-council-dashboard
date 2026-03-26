import { useState } from "react";
import {
  Sparkles,
  Users,
  Home,
  HeartPulse,
  MapPin,
  Building2,
  Hospital,
  Info,
  ChevronDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  villages,
  ncdStats,
  populationComparison,
  healthCoverageData,
  monthlyTrend,
  houses,
  persons,
  riskCounts,
  generateAISummary,
} from "../data/mockData";
import type { House } from "../types";

const ROYAL_BLUE = "#1C85AD";
const GOLD = "#6EC3C3";
const TEAL = "#0D9488";

// Computed stats
const totalPop = villages.reduce((s, v) => s + v.totalPopulation, 0);
const totalHouses = villages.reduce((s, v) => s + v.totalHouses, 0);
const totalElderly = villages.reduce((s, v) => s + v.elderlyCount, 0);
const totalNCD = villages.reduce((s, v) => s + v.ncdCount, 0);
const workingAge = totalPop - totalElderly - Math.round(totalPop * 0.18); // approx children
const maleCount = persons.filter((p) => p.gender === "male").length;
const femaleCount = persons.filter((p) => p.gender === "female").length;
const malePct = ((maleCount / persons.length) * 100).toFixed(1);
const femalePct = ((femaleCount / persons.length) * 100).toFixed(1);

// NCD bar colors matching Health Atlas style
const NCD_COLORS: Record<string, string> = {
  HT: "#3DA0C4",
  DM: "#DC2626",
  CKD: "#16A34A",
  COPD: "#A855F7",
  Stroke: "#F59E0B",
  Heart: "#EC4899",
};

const maxNCD = Math.max(...ncdStats.map((n) => n.total));

const RISK_LABELS = { high: "สูง", medium: "ปานกลาง", low: "ต่ำ" };

export default function Dashboard() {
  const [selectedMoo, setSelectedMoo] = useState<"all" | "11" | "12">("all");

  // Filter data by selected moo (for stats panels)
  const filteredVillages =
    selectedMoo === "all"
      ? villages
      : villages.filter((v) => v.moo === Number(selectedMoo));
  const fPop = filteredVillages.reduce((s, v) => s + v.totalPopulation, 0);
  const fHouses = filteredVillages.reduce((s, v) => s + v.totalHouses, 0);
  const fElderly = filteredVillages.reduce((s, v) => s + v.elderlyCount, 0);
  const fNCD = filteredVillages.reduce((s, v) => s + v.ncdCount, 0);
  const fPersons =
    selectedMoo === "all"
      ? persons
      : persons.filter((p) => p.moo === Number(selectedMoo));
  const fMale = fPersons.filter((p) => p.gender === "male").length;
  const fFemale = fPersons.filter((p) => p.gender === "female").length;

  return (
    <div className="space-y-5">
      {/* ── Header with Filters ── */}
      <div className="bg-gradient-to-r from-royal-blue to-royal-blue-light rounded-2xl p-5 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Seal_of_the_Ministry_of_Public_Health_of_Thailand.svg/120px-Seal_of_the_Ministry_of_Public_Health_of_Thailand.svg.png"
                alt="MoPH"
                className="w-8 h-8 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                Executive Village Health Dashboard
              </h1>
              <p className="text-white/70 text-xs">
                ระบบแดชบอร์ดสุขภาพระดับหมู่บ้าน — จ.น่าน
              </p>
            </div>
          </div>
          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: "เขตสุขภาพที่ 1", disabled: true },
              { label: "น่าน", disabled: true },
              { label: "ท่าวังผา", disabled: true },
            ].map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/10 text-xs text-white/80 min-h-[40px]"
              >
                {f.label}
                <ChevronDown size={12} className="text-white/50" />
              </div>
            ))}
            <div className="flex gap-1 bg-white/10 rounded-lg p-0.5">
              {(["all", "11", "12"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMoo(m)}
                  className={`px-3 py-2 rounded-md text-xs font-medium transition-all min-h-[40px] ${
                    selectedMoo === m
                      ? "bg-white text-royal-blue shadow"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {m === "all" ? "ทุกหมู่" : `ม.${m}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 1: KPI Summary Cards (Health Atlas style) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ครัวเรือนทั้งหมด */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center flex-shrink-0">
              <Home size={28} className="text-teal-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-text-muted">ครัวเรือนทั้งหมด</p>
              <p className="text-3xl font-bold text-text">
                Total {fHouses.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <MapPin size={14} className="text-teal-500" />
            <span className="text-xs text-teal-600 font-medium">
              ปักหมุดแล้วทั้งหมด : {fHouses.toLocaleString()}
            </span>
            <span className="ml-auto px-2 py-0.5 rounded-full bg-teal-500 text-white text-xs font-bold">
              100%
            </span>
          </div>
          <div className="mt-2 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full" style={{ width: "100%" }} />
          </div>
        </div>

        {/* จำนวนประชากร */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center flex-shrink-0">
              <Users size={28} className="text-teal-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-text-muted">จำนวนประชากร</p>
              <p className="text-3xl font-bold text-text">
                Total {fPop.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <MapPin size={14} className="text-teal-500" />
            <span className="text-xs text-teal-600 font-medium">
              ปักหมุดแล้วทั้งหมด : {fPop.toLocaleString()}
            </span>
            <span className="ml-auto px-2 py-0.5 rounded-full bg-teal-500 text-white text-xs font-bold">
              100%
            </span>
          </div>
          <div className="mt-2 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full" style={{ width: "100%" }} />
          </div>
        </div>
      </div>

      {/* ── Row 2: Note + Service Units ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Note */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start gap-2">
          <Info size={14} className="text-text-muted mt-0.5 flex-shrink-0" />
          <p className="text-xs text-text-muted leading-relaxed">
            หมายเหตุ : จำนวนข้อมูลตั้งต้นทั้งหมดอ้างอิงตามระบบคลังข้อมูลด้านการแพทย์และสาธารณสุข
            (HDC) ข้อมูลรับผ่าน API จาก รพ.สต.น้ำรีพัฒนา และ รพ.น่าน
          </p>
        </div>

        {/* Service Units */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {/* อสม. */}
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Users size={18} className="text-blue-500" />
              </div>
              <span className="text-xs font-medium text-text">อสม.</span>
              <span className="text-lg font-bold text-text">12 คน</span>
            </div>
            {/* หน่วยบริการ */}
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                <Building2 size={18} className="text-indigo-500" />
              </div>
              <span className="text-xs font-medium text-text">หน่วยบริการ</span>
              <span className="text-lg font-bold text-text">1 แห่ง</span>
            </div>
            {/* รพ. */}
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                <Hospital size={18} className="text-green-600" />
              </div>
              <span className="text-xs font-medium text-text flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" /> รพ.
              </span>
              <span className="text-lg font-bold text-text">0 แห่ง</span>
            </div>
            {/* รพ.สต. */}
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <Hospital size={18} className="text-emerald-500" />
              </div>
              <span className="text-xs font-medium text-text flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> รพ.สต.
              </span>
              <span className="text-lg font-bold text-text">1 แห่ง</span>
            </div>
            {/* อื่นๆ */}
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Building2 size={18} className="text-gray-400" />
              </div>
              <span className="text-xs font-medium text-text flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-400" /> อื่นๆ
              </span>
              <span className="text-lg font-bold text-text">0 แห่ง</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Patient Table + Right Panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">
        {/* LEFT: Patient Summary Table + AI + Charts */}
        <div className="lg:col-span-3 space-y-5">
          {/* จำนวนผู้ป่วยทั้งหมด */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <MapPin size={18} className="text-red-500" />
              <h3 className="text-base font-bold text-text">
                จำนวนผู้ป่วยทั้งหมด
              </h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted">
                    ตำบล
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-text-muted">
                    ครัวเรือน
                    <br />
                    <span className="font-normal text-xs">ที่ปักหมุด / ทั้งหมด</span>
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-text-muted">
                    ประชากร
                    <br />
                    <span className="font-normal text-xs">ที่ปักหมุด / ทั้งหมด</span>
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-text-muted">
                    ประชากรที่เป็นโรค
                    <br />
                    <span className="font-normal text-xs">คน</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredVillages.map((v) => (
                  <tr key={v.id} className="border-t border-gray-50">
                    <td className="px-5 py-3 text-sm font-medium text-text">
                      ม.{v.moo} {v.name}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-text">
                      {v.totalHouses} / {v.totalHouses}{" "}
                      <span className="text-xs text-text-muted">(100%)</span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-text">
                      {v.totalPopulation.toLocaleString()} /{" "}
                      {v.totalPopulation.toLocaleString()}{" "}
                      <span className="text-xs text-text-muted">(100%)</span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-semibold text-red-600">
                      {v.ncdCount}
                    </td>
                  </tr>
                ))}
                {/* Total row */}
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td className="px-5 py-3 text-sm font-bold text-text">รวม</td>
                  <td className="px-4 py-3 text-center text-sm font-bold text-text">
                    {fHouses}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-bold text-text">
                    {fPop.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-bold text-red-600">
                    {fNCD}
                  </td>
                </tr>
              </tbody>
            </table>
            {/* Progress bar under table */}
            <div className="px-5 py-3 border-t border-gray-100">
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          </div>

          {/* AI Summary */}
          <div className="bg-gradient-to-r from-royal-blue to-royal-blue-light rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gold/20 flex items-center justify-center flex-shrink-0">
                <Sparkles size={18} className="text-gold" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gold mb-1.5">
                  AI Health Insight — สรุปอัตโนมัติ
                </h3>
                <p className="text-sm leading-relaxed text-white/90">
                  {generateAISummary()}
                </p>
              </div>
            </div>

            {/* ── สรุปสถานะแบ่งตามหมู่ ── */}
            <div className="bg-white/10 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-semibold text-gold flex items-center gap-2">
                <Home size={14} />
                สรุปสถานะแบ่งตามหมู่
              </h4>

              {/* Per-village breakdown */}
              <div className="space-y-2">
                {filteredVillages.map((v) => {
                  const vHouses = houses.filter(
                    (h) => h.moo === v.moo
                  );
                  const vPersons = persons.filter(
                    (p) => p.moo === v.moo
                  );
                  const avgPerHouse =
                    vHouses.length > 0
                      ? (vPersons.length / vHouses.length).toFixed(1)
                      : "0";
                  return (
                    <div
                      key={v.id}
                      className="bg-white/10 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">
                          ม.{v.moo} {v.name}
                        </span>
                        <span className="text-xs bg-white/15 px-2 py-0.5 rounded-full">
                          {vPersons.length.toLocaleString()} ราย
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white/10 rounded-md py-1.5">
                          <p className="text-lg font-bold">
                            {vHouses.length}
                          </p>
                          <p className="text-[10px] text-white/70">
                            ครัวเรือน
                          </p>
                        </div>
                        <div className="bg-white/10 rounded-md py-1.5">
                          <p className="text-lg font-bold">
                            {vPersons.length.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-white/70">
                            คน
                          </p>
                        </div>
                        <div className="bg-white/10 rounded-md py-1.5">
                          <p className="text-lg font-bold">
                            {avgPerHouse}
                          </p>
                          <p className="text-[10px] text-white/70">
                            คน/ครัวเรือน
                          </p>
                        </div>
                      </div>
                      {/* Household size distribution */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {[
                          { label: "1-2 คน", count: vHouses.filter((h) => h.memberCount <= 2).length },
                          { label: "3-4 คน", count: vHouses.filter((h) => h.memberCount >= 3 && h.memberCount <= 4).length },
                          { label: "5+ คน", count: vHouses.filter((h) => h.memberCount >= 5).length },
                        ].map((bucket) => (
                          <span
                            key={bucket.label}
                            className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full"
                          >
                            {bucket.label}: {bucket.count} หลัง
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Grand total */}
              <div className="border-t border-white/20 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    รวมทั้งหมด
                  </span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="bg-gold/20 text-gold px-2 py-0.5 rounded-full font-bold">
                      {(selectedMoo === "all"
                        ? houses
                        : houses.filter((h) => h.moo === Number(selectedMoo))
                      ).length.toLocaleString()}{" "}
                      ครัวเรือน
                    </span>
                    <span className="bg-gold/20 text-gold px-2 py-0.5 rounded-full font-bold">
                      {fPersons.length.toLocaleString()} ราย
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison + Trend Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* Population Comparison */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-text mb-3">
                เปรียบเทียบประชากร (หมู่ 11 vs 12)
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={populationComparison} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="category" tick={{ fontSize: 10 }} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="moo11" name="หมู่ 11" fill={ROYAL_BLUE} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="moo12" name="หมู่ 12" fill={GOLD} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Trend */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-text mb-3">
                แนวโน้มรายเดือน (ต.ค. 68 — มี.ค. 69)
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="ncd" name="NCD" stroke={ROYAL_BLUE} strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="elderly" name="ผู้สูงอายุ" stroke={GOLD} strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="deaths" name="เสียชีวิต" stroke="#DC2626" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Health Atlas–style sections */}
        <div className="lg:col-span-2 space-y-5">
          {/* กลุ่มสุขภาพ — NCD Horizontal Bars */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <HeartPulse size={16} className="text-red-500" />
                กลุ่มสุขภาพ
              </h3>
              <span className="text-xs text-text-muted">จำนวนผู้ป่วย (ราย)</span>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 mb-3">
              <p className="text-xs font-semibold text-text-muted">
                โรคไม่ติดต่อเรื้อรัง
              </p>
              <div className="flex items-center gap-3 ml-auto">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: ROYAL_BLUE }} />
                  <span className="text-[10px] text-text-muted">ม.11</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: GOLD }} />
                  <span className="text-[10px] text-text-muted">ม.12</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {ncdStats.map((item) => (
                <div key={item.diseaseEn}>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 w-[100px] flex-shrink-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: NCD_COLORS[item.diseaseEn] || "#6B7280" }}
                      />
                      <span className="text-xs text-text truncate">{item.disease}</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      {/* ม.11 bar */}
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 h-3 bg-gray-100 rounded overflow-hidden">
                          <div
                            className="h-full rounded transition-all duration-500"
                            style={{
                              width: `${(item.moo11 / maxNCD) * 100}%`,
                              backgroundColor: ROYAL_BLUE,
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-text w-[24px] text-right">
                          {item.moo11}
                        </span>
                      </div>
                      {/* ม.12 bar */}
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 h-3 bg-gray-100 rounded overflow-hidden">
                          <div
                            className="h-full rounded transition-all duration-500"
                            style={{
                              width: `${(item.moo12 / maxNCD) * 100}%`,
                              backgroundColor: GOLD,
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-text w-[24px] text-right">
                          {item.moo12}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-text w-[36px] text-right">
                      {item.total}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* ผู้สูงอายุ */}
            <p className="text-xs font-semibold text-text-muted mt-5 mb-2">ผู้สูงอายุ</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 w-[100px] flex-shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 flex-shrink-0" />
                <span className="text-xs text-text">ผู้สูงอายุทั่วไป</span>
              </div>
              <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                <div
                  className="h-full rounded bg-teal-500 transition-all duration-500"
                  style={{ width: `${(fElderly / maxNCD) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold text-text w-[36px] text-right">
                {fElderly}
              </span>
            </div>
            <div className="mt-3 flex items-start gap-1.5 text-xs text-text-muted">
              <Info size={12} className="flex-shrink-0 mt-0.5" />
              ผู้ป่วย 1 คนสามารถเป็นได้มากกว่า 1 โรค
            </div>
          </div>

          {/* ช่วงอายุ — Age Range */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-text flex items-center gap-2 mb-4">
              <span className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-600 border border-blue-200">
                AGE
              </span>
              ช่วงอายุ
            </h3>
            <div className="space-y-3">
              {/* 25-59 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-text">25 - 59</span>
                  <span className="text-xs text-text-muted">
                    {(fPop - fElderly).toLocaleString()} คน
                  </span>
                </div>
                <div className="w-full h-7 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all duration-500"
                    style={{
                      width: `${((fPop - fElderly) / fPop) * 100}%`,
                      backgroundColor: ROYAL_BLUE,
                    }}
                  />
                </div>
              </div>
              {/* 60+ */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-text">60 ปี ขึ้นไป</span>
                  <span className="text-xs text-text-muted">
                    {fElderly.toLocaleString()} คน
                  </span>
                </div>
                <div className="w-full h-7 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all duration-500"
                    style={{
                      width: `${(fElderly / fPop) * 100}%`,
                      backgroundColor: "#F97316",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* เพศทั้งหมด — Gender Breakdown */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-text flex items-center gap-2 mb-4">
              <Users size={16} className="text-text-muted" />
              เพศทั้งหมด
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Male */}
              <div className="flex flex-col items-center p-4 rounded-xl bg-blue-50/50">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="7" r="4" fill="#3B82F6" />
                  <path
                    d="M4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    fill="#93C5FD"
                  />
                </svg>
                <span className="text-xs text-blue-600 font-medium mt-2">
                  ผู้ป่วยชาย
                </span>
                <span className="text-lg font-bold text-blue-700">
                  Total : {fMale.toLocaleString()}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-text-muted">
                    {fMale.toLocaleString()} คน
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                    {fPersons.length > 0
                      ? ((fMale / fPersons.length) * 100).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
              </div>
              {/* Female */}
              <div className="flex flex-col items-center p-4 rounded-xl bg-pink-50/50">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="7" r="4" fill="#EC4899" />
                  <path
                    d="M4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2"
                    stroke="#EC4899"
                    strokeWidth="2"
                    fill="#F9A8D4"
                  />
                </svg>
                <span className="text-xs text-pink-600 font-medium mt-2">
                  ผู้ป่วยหญิง
                </span>
                <span className="text-lg font-bold text-pink-700">
                  Total : {fFemale.toLocaleString()}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-text-muted">
                    {fFemale.toLocaleString()} คน
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-xs font-bold">
                    {fPersons.length > 0
                      ? ((fFemale / fPersons.length) * 100).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* สิทธิการรักษา */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-text mb-3">สิทธิการรักษา</h3>
            <div className="space-y-3">
              {healthCoverageData.map((item, i) => (
                <div key={item.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-text">{item.name}</span>
                    <span className="text-xs font-semibold text-text">
                      {item.value.toLocaleString()} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor:
                          ["#1C85AD", "#0EA5E9", "#6EC3C3", "#94A3B8"][i],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
