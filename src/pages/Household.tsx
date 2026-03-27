import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import {
  Search,
  Filter,
  AlertTriangle,
  Users,
  HeartPulse,
  ChevronRight,
  Eye,
  EyeOff,
  Clock,
  ArrowLeft,
  Activity,
  Stethoscope,
  FileText,
  Syringe,
  ArrowRightLeft,
  Bug,
  ShieldAlert,
  CheckCircle2,
  Map as MapIcon,
} from "lucide-react";
import { houses, persons, outbreakCases, outbreakHouseIds } from "../data/mockData";
import type { Person } from "../types";

const RISK_COLORS = {
  high: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
  medium: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  low: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
};

const RISK_LABELS = { high: "สูง", medium: "ปานกลาง", low: "ต่ำ" };

const DISEASE_COLORS: Record<string, string> = {
  DM: "bg-orange-100 text-orange-700",
  HT: "bg-red-100 text-red-700",
  CKD: "bg-purple-100 text-purple-700",
  Stroke: "bg-rose-100 text-rose-700",
  Heart: "bg-pink-100 text-pink-700",
  COPD: "bg-blue-100 text-blue-700",
};

const EVENT_ICONS = {
  visit: Stethoscope,
  lab: FileText,
  screening: Activity,
  vaccination: Syringe,
  referral: ArrowRightLeft,
};

export default function Household() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRisk, setFilterRisk] = useState<"all" | "high" | "medium" | "low">("all");
  const [filterMoo, setFilterMoo] = useState<"all" | "11" | "12">("all");
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [showCID, setShowCID] = useState(false);

  // Auto-select person from query param (e.g. from GIS map link)
  useEffect(() => {
    const personId = searchParams.get("person");
    if (personId) {
      const found = persons.find((p) => p.id === personId);
      if (found) setSelectedPerson(found);
    }
  }, [searchParams]);

  const filteredHouses = houses.filter((h) => {
    if (filterMoo !== "all" && h.moo !== Number(filterMoo)) return false;
    if (filterRisk !== "all" && h.riskLevel !== filterRisk) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const housePersons = persons.filter((p) => p.houseId === h.id);
      const matchPerson = housePersons.some(
        (p) =>
          p.firstName.includes(q) ||
          p.lastName.includes(q) ||
          p.hn.toLowerCase().includes(q)
      );
      return h.houseCode.includes(q) || h.address.includes(q) || matchPerson;
    }
    return true;
  });

  const maskCID = (cid: string) => {
    const parts = cid.split("-");
    if (parts.length >= 4) {
      return `${parts[0]}-${parts[1]}-XXXXX-XX-X`;
    }
    return cid.replace(/\d(?=\d{4})/g, "X");
  };

  // Person Profile View
  if (selectedPerson) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setSelectedPerson(null);
              setShowCID(false);
            }}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-royal-blue transition-colors min-h-[44px]"
          >
            <ArrowLeft size={16} />
            กลับไปรายการครัวเรือน
          </button>
          <a
            href={`#/gis`}
            className="flex items-center gap-1.5 text-sm text-royal-blue hover:text-royal-blue-light font-medium transition-colors min-h-[44px]"
          >
            <MapIcon size={16} />
            ดูบนแผนที่
          </a>
        </div>

        {/* Demographic Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-royal-blue to-royal-blue-light flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {selectedPerson.firstName[0]}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-text">
                {selectedPerson.prefix}
                {selectedPerson.firstName} {selectedPerson.lastName}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="text-sm text-text-muted">
                  อายุ {selectedPerson.age} ปี
                </span>
                <span className="text-sm text-text-muted">
                  {selectedPerson.gender === "male" ? "ชาย" : "หญิง"}
                </span>
                <span className="text-sm text-text-muted">
                  HN: {selectedPerson.hn}
                </span>
                <span className="text-sm text-text-muted flex items-center gap-1">
                  CID:{" "}
                  {showCID ? selectedPerson.cid : maskCID(selectedPerson.cid)}
                  <button
                    onClick={() => setShowCID(!showCID)}
                    className="ml-1 text-text-light hover:text-royal-blue"
                  >
                    {showCID ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                  {selectedPerson.healthCoverage}
                </span>
                {selectedPerson.isElderly && (
                  <span className="text-xs px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-medium">
                    ผู้สูงอายุ
                  </span>
                )}
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    RISK_COLORS[selectedPerson.riskLevel].bg
                  } ${RISK_COLORS[selectedPerson.riskLevel].text}`}
                >
                  ความเสี่ยง{RISK_LABELS[selectedPerson.riskLevel]}
                </span>
                {/* Epidemic Risk Badge */}
                {(() => {
                  const inOutbreakArea = outbreakHouseIds.has(selectedPerson.houseId);
                  const hasRecentFluVaccine = selectedPerson.vaccinations.some(
                    (v) => v.vaccineNameEn === "Influenza" && v.date >= "2025-06-01"
                  );
                  const isVulnerable = selectedPerson.isElderly || selectedPerson.chronicDiseases.length > 0 || selectedPerson.age < 5;
                  const isEpidemicRisk = inOutbreakArea && (!hasRecentFluVaccine || isVulnerable);
                  if (isEpidemicRisk) {
                    return (
                      <span className="text-xs px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-medium flex items-center gap-1">
                        <Bug size={12} />
                        เสี่ยงโรคระบาด
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Chronic Disease Badges + AI Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chronic Diseases */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <HeartPulse size={20} className="text-danger" />
              โรคเรื้อรัง
            </h3>
            {selectedPerson.chronicDiseases.length > 0 ? (
              <div className="space-y-3">
                {selectedPerson.chronicDiseases.map((d) => (
                  <div
                    key={d.code}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                          DISEASE_COLORS[d.code] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {d.code}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-text">
                          {d.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          วินิจฉัยเมื่อ {d.diagnosedDate}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        d.status === "controlled"
                          ? "bg-green-50 text-green-600"
                          : d.status === "uncontrolled"
                          ? "bg-red-50 text-red-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {d.status === "controlled"
                        ? "ควบคุมได้"
                        : d.status === "uncontrolled"
                        ? "ควบคุมไม่ได้"
                        : "เฝ้าระวัง"}
                    </span>
                  </div>
                ))}
                {selectedPerson.chronicDiseases.length >= 2 && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                    <AlertTriangle size={16} className="text-red-600" />
                    <span className="text-xs font-medium text-red-700">
                      Multi-morbidity: ผู้ป่วยมีโรคเรื้อรัง{" "}
                      {selectedPerson.chronicDiseases.length} ชนิด —
                      ต้องการการดูแลพิเศษ
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-text-muted text-center py-6">
                ไม่มีประวัติโรคเรื้อรัง
              </p>
            )}
          </div>

          {/* AI Individual Summary */}
          <div className="bg-gradient-to-br from-royal-blue to-royal-blue-light rounded-2xl p-6 text-white shadow-sm">
            <h3 className="text-sm font-semibold text-gold mb-3 flex items-center gap-2">
              <Activity size={16} />
              สรุปวิเคราะห์รายบุคคล
            </h3>
            {selectedPerson.chronicDiseases.length > 0 ? (
              <p className="text-sm leading-relaxed text-white/90">
                <strong>{selectedPerson.prefix}{selectedPerson.firstName}</strong> อายุ{" "}
                {selectedPerson.age} ปี{" "}
                {selectedPerson.isElderly && "(ผู้สูงอายุ) "}
                ปัจจุบันมีโรคเรื้อรัง{" "}
                <strong className="text-gold">
                  {selectedPerson.chronicDiseases.map((d) => d.name).join(", ")}
                </strong>{" "}
                {selectedPerson.chronicDiseases.some(
                  (d) => d.status === "uncontrolled"
                ) && (
                  <>
                    พบว่า
                    <strong className="text-gold">
                      {" "}
                      ยังควบคุมโรคไม่ได้
                    </strong>{" "}
                    ในบางรายการ แนะนำติดตามใกล้ชิดและพิจารณาส่งต่อผู้เชี่ยวชาญ
                  </>
                )}
                {selectedPerson.chronicDiseases.every(
                  (d) => d.status === "controlled"
                ) && " สามารถควบคุมโรคได้ดี ควรติดตามต่อเนื่อง"}
                {" "}สิทธิการรักษา: {selectedPerson.healthCoverage}
              </p>
            ) : (
              <p className="text-sm text-white/90">
                <strong>{selectedPerson.prefix}{selectedPerson.firstName}</strong>{" "}
                ไม่มีประวัติโรคเรื้อรัง สุขภาพดี ควรตรวจคัดกรองประจำปีตามปกติ
              </p>
            )}
          </div>
        </div>

        {/* Household Context */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
            <Users size={20} className="text-royal-blue" />
            ข้อมูลครัวเรือน
          </h3>
          {(() => {
            const house = houses.find((h) => h.id === selectedPerson.houseId);
            if (!house) return null;
            const familyMembers = persons.filter(
              (p) => p.houseId === house.id && p.id !== selectedPerson.id
            );
            return (
              <div>
                <p className="text-sm text-text-muted mb-3">
                  บ้านเลขที่ {house.houseCode} — {house.address} — หมู่{" "}
                  {house.moo}
                </p>
                {familyMembers.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-text-muted">
                      สมาชิกอื่นในบ้าน:
                    </p>
                    {familyMembers.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedPerson(m);
                          setShowCID(false);
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 w-full text-left transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-royal-blue/10 flex items-center justify-center text-xs font-bold text-royal-blue">
                          {m.firstName[0]}
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-text">
                            {m.prefix}
                            {m.firstName} {m.lastName}
                          </span>
                          <span className="text-xs text-text-muted ml-2">
                            อายุ {m.age} ปี
                          </span>
                        </div>
                        <ChevronRight size={14} className="text-text-light" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Health Timeline */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
            <Clock size={20} className="text-royal-blue" />
            ไทม์ไลน์สุขภาพ
          </h3>
          {selectedPerson.healthEvents.length > 0 ? (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-gray-200" />
              <div className="space-y-6">
                {selectedPerson.healthEvents.map((event) => {
                  const Icon =
                    EVENT_ICONS[event.type as keyof typeof EVENT_ICONS] ||
                    Activity;
                  return (
                    <div key={event.id} className="flex gap-4 relative">
                      <div className="w-10 h-10 rounded-xl bg-royal-blue/10 flex items-center justify-center z-10 flex-shrink-0">
                        <Icon size={18} className="text-royal-blue" />
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-text-muted">
                            {event.date}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-text-muted">
                            {event.provider}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-text">
                          {event.title}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-text-muted text-center py-6">
              ไม่มีประวัติเหตุการณ์สุขภาพ
            </p>
          )}
        </div>

        {/* Vaccination History Timeline */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
            <Syringe size={20} className="text-purple-600" />
            ประวัติการฉีดวัคซีน
          </h3>
          {selectedPerson.vaccinations.length > 0 ? (
            <div className="relative">
              <div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-purple-100" />
              <div className="space-y-5">
                {selectedPerson.vaccinations.map((vax) => (
                  <div key={vax.id} className="flex gap-4 relative">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center z-10 flex-shrink-0">
                      <CheckCircle2 size={18} className="text-purple-500" />
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-text-muted">{vax.date}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 font-medium">
                          {vax.dose}
                        </span>
                        {vax.lot && (
                          <span className="text-xs text-text-light">Lot: {vax.lot}</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-text">
                        {vax.vaccineName}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {vax.vaccineNameEn} — {vax.provider}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-text-muted text-center py-6">
              ไม่มีประวัติการฉีดวัคซีน
            </p>
          )}
        </div>

        {/* Epidemic Risk Alert */}
        {(() => {
          const inOutbreakArea = outbreakHouseIds.has(selectedPerson.houseId);
          const outbreakForHouse = outbreakCases.filter((c) => c.houseId === selectedPerson.houseId);
          const hasRecentFluVaccine = selectedPerson.vaccinations.some(
            (v) => v.vaccineNameEn === "Influenza" && v.date >= "2025-06-01"
          );
          const isVulnerable = selectedPerson.isElderly || selectedPerson.chronicDiseases.length > 0 || selectedPerson.age < 5;
          const isEpidemicRisk = inOutbreakArea && (!hasRecentFluVaccine || isVulnerable);

          if (!isEpidemicRisk) return null;

          return (
            <div className="bg-purple-50 rounded-2xl p-6 shadow-sm border border-purple-200">
              <h3 className="text-lg font-bold text-purple-700 mb-3 flex items-center gap-2">
                <ShieldAlert size={20} />
                แจ้งเตือนความเสี่ยงโรคระบาด
              </h3>
              <div className="space-y-2 text-sm text-purple-800">
                {inOutbreakArea && (
                  <p className="flex items-start gap-2">
                    <Bug size={14} className="flex-shrink-0 mt-0.5" />
                    อยู่ในพื้นที่ที่มีรายงานโรคระบาดใน 14 วันที่ผ่านมา
                  </p>
                )}
                {outbreakForHouse.length > 0 && (
                  <div className="ml-6 space-y-1">
                    {outbreakForHouse.map((c, i) => (
                      <p key={i} className="text-xs text-purple-600">
                        {c.disease} — รายงานวันที่ {c.reportDate} ({c.status === "confirmed" ? "ยืนยัน" : c.status === "suspected" ? "สงสัย" : "หายแล้ว"})
                      </p>
                    ))}
                  </div>
                )}
                {!hasRecentFluVaccine && (
                  <p className="flex items-start gap-2">
                    <Syringe size={14} className="flex-shrink-0 mt-0.5" />
                    ยังไม่ได้รับวัคซีนไข้หวัดใหญ่ในปีนี้
                  </p>
                )}
                {isVulnerable && (
                  <p className="flex items-start gap-2">
                    <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                    กลุ่มเสี่ยง: {selectedPerson.isElderly ? "ผู้สูงอายุ" : ""}{selectedPerson.chronicDiseases.length > 0 ? " มีโรคเรื้อรัง" : ""}{selectedPerson.age < 5 ? " เด็กเล็ก" : ""}
                  </p>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  // Household List View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-royal-blue">
          ครัวเรือนและข้อมูลบุคคล
        </h1>
        <p className="text-text-muted text-sm mt-1">
          ค้นหาและเจาะลึกข้อมูลสุขภาพรายครัวเรือนและรายบุคคล
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light"
          />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, รหัสบ้าน, HN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-royal-blue/20 focus:border-royal-blue min-h-[48px]"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-200">
            <Filter size={14} className="text-text-muted self-center ml-2" />
            {(["all", "11", "12"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setFilterMoo(m)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all min-h-[44px] ${
                  filterMoo === m
                    ? "bg-royal-blue text-white"
                    : "text-text-muted hover:bg-gray-50"
                }`}
              >
                {m === "all" ? "ทุกหมู่" : `ม.${m}`}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-200">
            {(["all", "high", "medium", "low"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setFilterRisk(r)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all min-h-[44px] ${
                  filterRisk === r
                    ? "bg-royal-blue text-white"
                    : "text-text-muted hover:bg-gray-50"
                }`}
              >
                {r === "all"
                  ? "ทุกระดับ"
                  : RISK_LABELS[r as keyof typeof RISK_LABELS]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-xs text-text-muted">
        แสดง {filteredHouses.length} จาก {houses.length} ครัวเรือน
      </p>

      {/* Household Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  รหัสบ้าน
                </th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  ที่อยู่
                </th>
                <th className="text-center px-5 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  สมาชิก
                </th>
                <th className="text-center px-5 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  ผู้สูงอายุ
                </th>
                <th className="text-center px-5 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  NCD
                </th>
                <th className="text-center px-5 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  ความเสี่ยง
                </th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredHouses.map((house) => {
                const housePersons = persons.filter(
                  (p) => p.houseId === house.id
                );
                return (
                  <tr
                    key={house.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text">
                          บ้านเลขที่ {house.houseCode}
                        </span>
                        {outbreakHouseIds.has(house.id) && (
                          <span className="flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600">
                            <Bug size={10} />
                            ระบาด
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-text-muted">
                        {house.address}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-sm font-medium text-text">
                        {house.memberCount}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-sm font-medium text-text">
                        {house.elderlyCount}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-sm font-medium text-text">
                        {house.ncdCount}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full ${
                          RISK_COLORS[house.riskLevel].bg
                        } ${RISK_COLORS[house.riskLevel].text}`}
                      >
                        {RISK_LABELS[house.riskLevel]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {housePersons.length > 0 ? (
                          <button
                            onClick={() => setSelectedPerson(housePersons[0])}
                            className="flex items-center gap-1 text-xs text-royal-blue hover:text-royal-blue-light font-medium transition-colors min-h-[44px]"
                          >
                            ดูสมาชิก
                            <ChevronRight size={14} />
                          </button>
                        ) : (
                          <span className="text-xs text-text-light">—</span>
                        )}
                        <a href="#/gis" className="flex items-center gap-1 text-xs text-text-muted hover:text-royal-blue transition-colors">
                          <MapIcon size={12} />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
