import type {
  SourceProvider,
  Village,
  House,
  Person,
  Family,
  SubmissionLog,
  NCDStats,
  Vaccination,
  OutbreakCase,
} from "../types";

// ============================================
// Source Providers
// ============================================
export const providers: SourceProvider[] = [
  {
    id: "PRV-001",
    name: "รพ.สต.น้ำรีพัฒนา",
    nameEn: "Namree Pattana Health Center",
    type: "health_center",
    status: "online",
    lastSync: "2026-03-25T08:45:00",
    totalSubmissions: 1245,
    errorRate: 1.2,
  },
  {
    id: "PRV-002",
    name: "โรงพยาบาลน่าน",
    nameEn: "Nan Hospital",
    type: "hospital",
    status: "online",
    lastSync: "2026-03-25T09:10:00",
    totalSubmissions: 3890,
    errorRate: 0.5,
  },
  {
    id: "PRV-003",
    name: "รพ.สต.บ้านน้ำปาย",
    nameEn: "Ban Nampai Health Center",
    type: "health_center",
    status: "degraded",
    lastSync: "2026-03-24T22:30:00",
    totalSubmissions: 876,
    errorRate: 4.8,
  },
];

// ============================================
// Villages — Real distribution
// หมู่ 11 บ้านน้ำช้าง: 250 houses, ~950 pop
// หมู่ 12 บ้านน้ำรีพัฒนา: 279 houses, ~1,091 pop
// ============================================
export const villages: Village[] = [
  {
    id: "VIL-011",
    moo: 11,
    name: "บ้านน้ำช้าง",
    totalHouses: 250,
    totalPopulation: 950,
    elderlyCount: 181, // ~19%
    ncdCount: 142,
    lat: 19.54656,
    lng: 101.20928,
  },
  {
    id: "VIL-012",
    moo: 12,
    name: "บ้านน้ำรีพัฒนา",
    totalHouses: 279,
    totalPopulation: 1091,
    elderlyCount: 218, // ~20%
    ncdCount: 168,
    lat: 19.51919,
    lng: 101.22848,
  },
];

// ============================================
// Deterministic Seeded Random Generator
// ============================================
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ============================================
// Generate 529 Houses with realistic distribution
// ============================================
function generateHouses(): House[] {
  const result: House[] = [];
  const rng = seededRandom(42);

  const configs = [
    { moo: 11, villageId: "VIL-011", count: 125, baseLat: 19.5480, baseLng: 101.2060, prefix: "55150011" },
    { moo: 12, villageId: "VIL-012", count: 140, baseLat: 19.5180, baseLng: 101.2245, prefix: "55150012" },
  ];

  let idx = 1;
  for (const cfg of configs) {
    for (let i = 1; i <= cfg.count; i++) {
      const memberCount = Math.floor(rng() * 5) + 2; // 2-6 members
      const elderlyCount = rng() < 0.20 ? (rng() < 0.35 ? Math.floor(rng() * 2) + 2 : 1) : 0;
      const ncdCount = rng() < 0.30 ? (rng() < 0.30 ? Math.floor(rng() * 2) + 2 : 1) : 0;

      // Risk logic: High = elderly >= 2 OR ncd >= 2
      let riskLevel: "low" | "medium" | "high" = "low";
      if (elderlyCount >= 2 || ncdCount >= 2) {
        riskLevel = "high";
      } else if (elderlyCount === 1 || ncdCount === 1) {
        riskLevel = "medium";
      }

      // Scatter positions within village polygon area
      const lat = cfg.baseLat + (rng() - 0.5) * 0.010;
      const lng = cfg.baseLng + (rng() - 0.5) * 0.012;

      const houseNo = Math.floor(rng() * 300) + 1;
      const houseNoSub = rng() < 0.3 ? `/${Math.floor(rng() * 9) + 1}` : "";
      result.push({
        id: `H-${String(idx).padStart(4, "0")}`,
        houseCode: `${houseNo}${houseNoSub}`,
        villageId: cfg.villageId,
        moo: cfg.moo,
        address: `${houseNo}${houseNoSub} ม.${cfg.moo} ต.ขุนน่าน อ.เฉลิมพระเกียรติ`,
        lat,
        lng,
        memberCount,
        elderlyCount,
        ncdCount,
        riskLevel,
      });
      idx++;
    }
  }
  return result;
}

export const houses: House[] = generateHouses();

// ============================================
// Computed risk counts
// ============================================
export const riskCounts = {
  high: houses.filter((h) => h.riskLevel === "high").length,
  medium: houses.filter((h) => h.riskLevel === "medium").length,
  low: houses.filter((h) => h.riskLevel === "low").length,
  highMoo11: houses.filter((h) => h.riskLevel === "high" && h.moo === 11).length,
  highMoo12: houses.filter((h) => h.riskLevel === "high" && h.moo === 12).length,
};

// ============================================
// Name pools for person generation
// ============================================
const MALE_FIRST = ["สมชาย","สมบูรณ์","วิชัย","ประสิทธิ์","บุญเรือง","ทองดี","แก้ว","สมศักดิ์","อนันต์","บุญมี","สุรชัย","วิเชียร","สมพงษ์","ประเสริฐ","สุทิน","มานพ","ชัยวัฒน์","อำนาจ","วิรัตน์","สุรศักดิ์","ณรงค์","เกียรติ","พิชิต","ธนกร","อดิศร","กิตติ","ภาณุ","ปราโมทย์","นิพนธ์","วันชัย"];
const FEMALE_FIRST = ["สมศรี","บุญมา","แก้วตา","คำแปง","จันทร์แรม","สุดา","วิไล","น้ำฝน","มาลี","พิมพ์ใจ","สุกัญญา","ลำดวน","บัวลอย","ทองใบ","แสงดาว","ประนอม","จำเนียร","สุพรรณ","อำไพ","รัตนา","กัลยา","พรทิพย์","วรรณา","นิตยา","สุมาลี","จินตนา","อรพิน","ดวงใจ","ศรีสุดา","เกสร"];
const CHILD_MALE = ["น้องบอล","ภูมิ","กันต์","ธนภัทร","ปภังกร","ณัฐวุฒิ","ศุภวิชญ์","อชิรวิชญ์","พีรพัฒน์","กฤตภาส"];
const CHILD_FEMALE = ["น้ำหวาน","ปริยา","ชนิดา","พิมพ์ชนก","กัญญาณัฐ","ณิชาภัทร","ปวริศา","ธัญชนก","ศิริกัญญา","อริสา"];
const LAST_NAMES = ["ใจดี","แสงทอง","มูลคำ","อินทร์แก้ว","จันทร์แดง","สุขใจ","พรมมินทร์","คำอ้าย","ปัญญา","วงค์คำ","แก้วมา","ยอดแก้ว","หล้าคำ","สิทธิ","ชัยลังกา","ธรรมวงค์","อุดคำ","ท้าวบุญ","เทพวงค์","กันทะ","ศรีวิชัย","จิตตะ","เมืองมูล","ปิมปา","สมเพชร","ตุ้ยดี","หาญชัย","วังแก้ว","อินต๊ะ","พิมสาร"];

const NCD_POOL = [
  { code: "HT", name: "ความดันโลหิตสูง", nameEn: "Hypertension" },
  { code: "DM", name: "เบาหวาน", nameEn: "Diabetes Mellitus" },
  { code: "CKD", name: "โรคไตเรื้อรัง", nameEn: "Chronic Kidney Disease" },
  { code: "Stroke", name: "โรคหลอดเลือดสมอง", nameEn: "Stroke" },
  { code: "Heart", name: "โรคหัวใจ", nameEn: "Heart Disease" },
  { code: "COPD", name: "ถุงลมโป่งพอง", nameEn: "COPD" },
];

const COVERAGES = ["สิทธิ์ UC (บัตรทอง)", "สิทธิ์ UC (บัตรทอง)", "สิทธิ์ UC (บัตรทอง)", "สิทธิ์ประกันสังคม", "สิทธิ์ข้าราชการ"];

const EVENT_TEMPLATES = [
  { type: "visit" as const, title: "ตรวจติดตามโรคเรื้อรัง", desc: "ตรวจร่างกายตามนัด ผลอยู่ในเกณฑ์" },
  { type: "lab" as const, title: "ตรวจเลือดประจำปี", desc: "ผลตรวจ CBC, FBS, Lipid Profile" },
  { type: "screening" as const, title: "คัดกรองสุขภาพ", desc: "คัดกรองโรคเรื้อรังประจำปี" },
  { type: "visit" as const, title: "ตรวจสุขภาพประจำปี", desc: "ผลตรวจปกติทุกรายการ" },
  { type: "vaccination" as const, title: "รับวัคซีนไข้หวัดใหญ่", desc: "วัคซีนตามฤดูกาล" },
  { type: "referral" as const, title: "ส่งต่อพบผู้เชี่ยวชาญ", desc: "ส่งต่อเพื่อปรึกษาแพทย์เฉพาะทาง" },
];

const PROVIDERS_NAMES = ["รพ.สต.น้ำรีพัฒนา", "รพ.น่าน"];

import type { VaccineGroup } from "../types";

// ============================================
// Vaccine definitions — 5 Thai EPI groups
// ============================================
export const VACCINE_DEFS: { code: string; name: string; nameEn: string; group: VaccineGroup; ageMin: number; ageMax: number; gender?: "female"; doses: string[]; coverage: number }[] = [
  // กลุ่ม 1: EPI เด็กก่อนวัยเรียน
  { code: "BCG", name: "วัณโรค", nameEn: "BCG", group: "epi_child", ageMin: 0, ageMax: 6, doses: ["แรกเกิด"], coverage: 0.90 },
  { code: "HB", name: "ตับอักเสบ B", nameEn: "Hepatitis B", group: "epi_child", ageMin: 0, ageMax: 6, doses: ["เข็ม 1", "เข็ม 2", "เข็ม 3"], coverage: 0.85 },
  { code: "DTP-HB-Hib", name: "คอตีบ-บาดทะยัก-ไอกรน-ตับอักเสบบี-ฮิบ", nameEn: "DTP-HB-Hib", group: "epi_child", ageMin: 0, ageMax: 6, doses: ["เข็ม 1", "เข็ม 2", "เข็ม 3"], coverage: 0.82 },
  { code: "OPV", name: "โปลิโอ (หยอด)", nameEn: "OPV", group: "epi_child", ageMin: 0, ageMax: 6, doses: ["ครั้ง 1", "ครั้ง 2", "ครั้ง 3"], coverage: 0.85 },
  { code: "IPV", name: "โปลิโอ (ฉีด)", nameEn: "IPV", group: "epi_child", ageMin: 0, ageMax: 6, doses: ["เข็ม 1"], coverage: 0.78 },
  { code: "MMR", name: "หัด-คางทูม-หัดเยอรมัน", nameEn: "MMR", group: "epi_child", ageMin: 0, ageMax: 6, doses: ["เข็ม 1", "เข็ม 2"], coverage: 0.80 },
  { code: "JE", name: "ไข้สมองอักเสบเจอี", nameEn: "JE", group: "epi_child", ageMin: 0, ageMax: 6, doses: ["เข็ม 1", "เข็ม 2"], coverage: 0.75 },
  { code: "ROTA", name: "โรต้าไวรัส", nameEn: "Rotavirus", group: "epi_child", ageMin: 0, ageMax: 2, doses: ["ครั้ง 1", "ครั้ง 2"], coverage: 0.60 },
  // กลุ่ม 2: เด็กวัยเรียน
  { code: "dT", name: "คอตีบ-บาดทะยัก (กระตุ้น)", nameEn: "dT Booster", group: "school", ageMin: 7, ageMax: 14, doses: ["ป.1", "ป.6"], coverage: 0.80 },
  { code: "HPV", name: "ป้องกันมะเร็งปากมดลูก", nameEn: "HPV", group: "school", ageMin: 9, ageMax: 14, gender: "female", doses: ["เข็ม 1", "เข็ม 2"], coverage: 0.50 },
  // กลุ่ม 3: กลุ่มเสี่ยง / เฉพาะโรค
  { code: "FLU", name: "ไข้หวัดใหญ่", nameEn: "Influenza", group: "risk", ageMin: 60, ageMax: 120, doses: ["ประจำปี"], coverage: 0.45 },
  { code: "COVID", name: "โควิด-19", nameEn: "COVID-19", group: "risk", ageMin: 12, ageMax: 120, doses: ["เข็ม 1", "เข็ม 2", "เข็ม 3 (บูสเตอร์)"], coverage: 0.35 },
  { code: "RAB", name: "พิษสุนัขบ้า", nameEn: "Rabies", group: "risk", ageMin: 0, ageMax: 120, doses: ["PrEP เข็ม 1", "PrEP เข็ม 2"], coverage: 0.05 },
  // กลุ่ม 4: นำร่อง
  { code: "PCV", name: "นิวโมคอคคัส", nameEn: "PCV", group: "pilot", ageMin: 0, ageMax: 5, doses: ["เข็ม 1", "เข็ม 2", "เข็ม 3"], coverage: 0.25 },
  { code: "Tdap", name: "ไอกรนสูตรเด็กโต", nameEn: "Tdap", group: "pilot", ageMin: 10, ageMax: 18, doses: ["เข็ม 1"], coverage: 0.20 },
  // กลุ่ม 5: ทางเลือก
  { code: "VAR", name: "อีสุกอีใส", nameEn: "Varicella", group: "optional", ageMin: 1, ageMax: 120, doses: ["เข็ม 1", "เข็ม 2"], coverage: 0.10 },
  { code: "HA", name: "ตับอักเสบ A", nameEn: "Hepatitis A", group: "optional", ageMin: 1, ageMax: 120, doses: ["เข็ม 1", "เข็ม 2"], coverage: 0.06 },
  { code: "DEN", name: "ไข้เลือดออก", nameEn: "Dengue", group: "optional", ageMin: 9, ageMax: 45, doses: ["เข็ม 1", "เข็ม 2"], coverage: 0.04 },
];

export const VACCINE_GROUP_LABELS: Record<VaccineGroup, { name: string; color: string }> = {
  epi_child: { name: "EPI เด็กก่อนวัยเรียน", color: "#3B82F6" },
  school: { name: "เด็กวัยเรียน", color: "#10B981" },
  risk: { name: "กลุ่มเสี่ยง/เฉพาะโรค", color: "#F59E0B" },
  pilot: { name: "นำร่อง", color: "#8B5CF6" },
  optional: { name: "ทางเลือก", color: "#EC4899" },
};

// ============================================
// Generate persons for ALL 529 houses
// ============================================
function generatePersons(): { persons: Person[]; families: Family[] } {
  const rng = seededRandom(777);
  const allPersons: Person[] = [];
  const allFamilies: Family[] = [];
  let personIdx = 1;

  const pick = <T,>(arr: T[]) => arr[Math.floor(rng() * arr.length)];
  const statuses: ("controlled" | "uncontrolled" | "monitoring")[] = ["controlled", "controlled", "controlled", "uncontrolled", "monitoring"];

  for (const house of houses) {
    const familyId = `F-${String(house.id.replace("H-", ""))}`;
    const lastName = pick(LAST_NAMES);
    const coverage = pick(COVERAGES);

    // Track how many elderly/ncd we need to assign to match house counts
    let elderlyRemaining = house.elderlyCount;
    let ncdRemaining = house.ncdCount;

    for (let m = 0; m < house.memberCount; m++) {
      const pid = `P-${String(personIdx).padStart(5, "0")}`;
      const hn = `HN-${String(50000 + personIdx)}`;
      const cidNum = String(55080000 + personIdx).padStart(8, "0");
      const cidCheck = String(Math.floor(rng() * 90) + 10);
      const cid = `1-${cidNum.slice(0, 4)}-${cidNum.slice(4)}-${cidCheck}-${Math.floor(rng() * 10)}`;

      // Determine age: assign elderly first if needed, then adults, then children
      let age: number;
      let isElderly = false;
      let gender: "male" | "female";
      let prefix: string;
      let firstName: string;

      if (elderlyRemaining > 0 && m < house.elderlyCount) {
        // Elderly member
        age = 60 + Math.floor(rng() * 25); // 60-84
        isElderly = true;
        elderlyRemaining--;
        gender = rng() < 0.5 ? "male" : "female";
        prefix = gender === "male" ? "นาย" : "นาง";
        firstName = gender === "male" ? pick(MALE_FIRST) : pick(FEMALE_FIRST);
      } else if (m < house.memberCount - (rng() < 0.4 ? 1 : 0)) {
        // Working-age adult
        age = 25 + Math.floor(rng() * 34); // 25-58
        gender = rng() < 0.5 ? "male" : "female";
        prefix = gender === "male" ? "นาย" : (rng() < 0.6 ? "นาง" : "นางสาว");
        firstName = gender === "male" ? pick(MALE_FIRST) : pick(FEMALE_FIRST);
      } else {
        // Child/youth
        age = 2 + Math.floor(rng() * 16); // 2-17
        gender = rng() < 0.5 ? "male" : "female";
        prefix = gender === "male" ? (age >= 15 ? "นาย" : "ด.ช.") : (age >= 15 ? "นางสาว" : "ด.ญ.");
        firstName = gender === "male" ? pick(CHILD_MALE) : pick(CHILD_FEMALE);
      }

      const birthYear = 2026 - age;
      const birthMonth = String(Math.floor(rng() * 12) + 1).padStart(2, "0");
      const birthDay = String(Math.floor(rng() * 28) + 1).padStart(2, "0");

      // Assign NCD diseases
      const diseases: Person["chronicDiseases"] = [];
      if (ncdRemaining > 0 && age >= 30) {
        // Give this person 1-3 NCDs (weighted toward HT/DM)
        const ncdCount = rng() < 0.3 ? (rng() < 0.4 ? 3 : 2) : 1;
        const usedCodes = new Set<string>();
        for (let d = 0; d < ncdCount && ncdRemaining > 0; d++) {
          // Weight toward HT (40%) and DM (30%)
          let disease;
          const roll = rng();
          if (roll < 0.40) disease = NCD_POOL[0]; // HT
          else if (roll < 0.70) disease = NCD_POOL[1]; // DM
          else disease = pick(NCD_POOL.slice(2));
          if (!usedCodes.has(disease.code)) {
            usedCodes.add(disease.code);
            const diagYear = 2010 + Math.floor(rng() * 15);
            diseases.push({
              code: disease.code,
              name: disease.name,
              nameEn: disease.nameEn,
              diagnosedDate: `${diagYear}-${birthMonth}-${birthDay}`,
              status: pick(statuses),
            });
            ncdRemaining--;
          }
        }
      }

      // Determine risk
      let riskLevel: "low" | "medium" | "high" = "low";
      if (diseases.length >= 2 || (isElderly && diseases.length >= 1)) riskLevel = "high";
      else if (isElderly || diseases.length === 1) riskLevel = "medium";

      // Generate 0-3 health events
      const eventCount = diseases.length > 0 ? 1 + Math.floor(rng() * 3) : (rng() < 0.3 ? 1 : 0);
      const events: Person["healthEvents"] = [];
      for (let e = 0; e < eventCount; e++) {
        const tmpl = pick(EVENT_TEMPLATES);
        const eventMonth = Math.floor(rng() * 6) + 10; // Oct-Mar
        const eventYear = eventMonth > 12 ? 2025 : 2026;
        const adjMonth = eventMonth > 12 ? eventMonth - 12 : eventMonth;
        events.push({
          id: `E-${personIdx}-${e}`,
          date: `${eventYear}-${String(adjMonth).padStart(2, "0")}-${String(Math.floor(rng() * 28) + 1).padStart(2, "0")}`,
          type: tmpl.type,
          title: tmpl.title,
          description: tmpl.desc,
          provider: pick(PROVIDERS_NAMES),
        });
      }
      events.sort((a, b) => b.date.localeCompare(a.date));

      const lastVisitMonth = String(Math.floor(rng() * 3) + 1).padStart(2, "0");
      const lastVisitDay = String(Math.floor(rng() * 28) + 1).padStart(2, "0");

      // Generate vaccination history from VACCINE_DEFS
      const vaccinations: Vaccination[] = [];
      let vaxIdx = 0;
      for (const vd of VACCINE_DEFS) {
        // Check age eligibility
        if (age < vd.ageMin || age > vd.ageMax) continue;
        // Check gender eligibility
        if (vd.gender && gender !== vd.gender) continue;
        // Roll coverage probability
        if (rng() > vd.coverage) continue;

        // How many doses did they get? (weighted toward completing)
        const dosesReceived = rng() < 0.7 ? vd.doses.length : Math.max(1, Math.floor(rng() * vd.doses.length) + 1);
        for (let d = 0; d < Math.min(dosesReceived, vd.doses.length); d++) {
          const baseYear = vd.group === "epi_child" ? (2026 - age + Math.floor(d * 0.5))
            : vd.code === "COVID" ? (2021 + Math.floor(d / 2))
            : (2024 + Math.floor(rng() * 2));
          const mo = Math.floor(rng() * 12) + 1;
          const dy = Math.floor(rng() * 28) + 1;
          vaccinations.push({
            id: `V-${personIdx}-${vd.code}-${d}`,
            vaccineName: vd.name,
            vaccineNameEn: vd.nameEn,
            vaccineCode: vd.code,
            group: vd.group,
            dose: vd.doses[d],
            date: `${baseYear}-${String(mo).padStart(2, "0")}-${String(dy).padStart(2, "0")}`,
            provider: pick(PROVIDERS_NAMES),
            lot: rng() < 0.5 ? `${vd.code}${String(Math.floor(rng() * 9000) + 1000)}` : undefined,
          });
          vaxIdx++;
        }
      }
      vaccinations.sort((a, b) => b.date.localeCompare(a.date));

      allPersons.push({
        id: pid,
        hn,
        cid,
        prefix,
        firstName,
        lastName,
        gender,
        birthDate: `${birthYear}-${birthMonth}-${birthDay}`,
        age,
        houseId: house.id,
        familyId,
        moo: house.moo,
        healthCoverage: coverage,
        isElderly,
        riskLevel,
        lastVisit: `2026-${lastVisitMonth}-${lastVisitDay}`,
        chronicDiseases: diseases,
        healthEvents: events,
        vaccinations,
      });

      personIdx++;
    }

    allFamilies.push({
      id: familyId,
      houseId: house.id,
      headPersonId: allPersons[allPersons.length - house.memberCount].id,
      memberCount: house.memberCount,
    });
  }

  return { persons: allPersons, families: allFamilies };
}

const generated = generatePersons();
export const persons: Person[] = generated.persons;
export const families: Family[] = generated.families;

// ============================================
// Submission Logs
// ============================================
export const submissionLogs: SubmissionLog[] = [
  { id: "LOG-001", providerId: "PRV-001", providerName: "รพ.สต.น้ำรีพัฒนา", timestamp: "2026-03-25T08:45:00", recordCount: 45, successCount: 45, failedCount: 0, severity: "info", status: "success", message: "นำเข้าข้อมูลสำเร็จ 45 ระเบียน" },
  { id: "LOG-002", providerId: "PRV-002", providerName: "รพ.น่าน", timestamp: "2026-03-25T09:10:00", recordCount: 120, successCount: 118, failedCount: 2, severity: "warning", status: "partial", errorType: "duplicate_record", message: "พบข้อมูลซ้ำ 2 ระเบียน (CID ซ้ำ)" },
  { id: "LOG-003", providerId: "PRV-003", providerName: "รพ.สต.บ้านน้ำปาย", timestamp: "2026-03-24T22:30:00", recordCount: 30, successCount: 0, failedCount: 30, severity: "error", status: "failed", errorType: "connection_timeout", message: "เชื่อมต่อ API ล้มเหลว — Connection Timeout" },
  { id: "LOG-004", providerId: "PRV-001", providerName: "รพ.สต.น้ำรีพัฒนา", timestamp: "2026-03-24T20:00:00", recordCount: 38, successCount: 38, failedCount: 0, severity: "info", status: "success", message: "นำเข้าข้อมูลสำเร็จ 38 ระเบียน" },
  { id: "LOG-005", providerId: "PRV-002", providerName: "รพ.น่าน", timestamp: "2026-03-24T18:15:00", recordCount: 95, successCount: 90, failedCount: 5, severity: "warning", status: "partial", errorType: "schema_mismatch", message: "Schema ไม่ตรงกัน 5 ระเบียน — ฟิลด์ blood_pressure format ผิด" },
  { id: "LOG-006", providerId: "PRV-001", providerName: "รพ.สต.น้ำรีพัฒนา", timestamp: "2026-03-24T14:30:00", recordCount: 22, successCount: 22, failedCount: 0, severity: "info", status: "success", message: "นำเข้าข้อมูลสำเร็จ 22 ระเบียน" },
  { id: "LOG-007", providerId: "PRV-003", providerName: "รพ.สต.บ้านน้ำปาย", timestamp: "2026-03-24T10:00:00", recordCount: 15, successCount: 12, failedCount: 3, severity: "warning", status: "partial", errorType: "validation_error", message: "ข้อมูลไม่ผ่าน Validation 3 ระเบียน — อายุเป็นค่าลบ" },
  { id: "LOG-008", providerId: "PRV-002", providerName: "รพ.น่าน", timestamp: "2026-03-23T16:45:00", recordCount: 200, successCount: 200, failedCount: 0, severity: "info", status: "success", message: "นำเข้าข้อมูลสำเร็จ 200 ระเบียน (Batch รายเดือน)" },
];

// ============================================
// NCD Statistics — realistic for Nan province
// HT and DM are the dominant NCDs
// ============================================
export const ncdStats: NCDStats[] = [
  { disease: "ความดันโลหิตสูง", diseaseEn: "HT", moo11: 72, moo12: 85, total: 157 },
  { disease: "เบาหวาน", diseaseEn: "DM", moo11: 48, moo12: 56, total: 104 },
  { disease: "โรคไตเรื้อรัง", diseaseEn: "CKD", moo11: 12, moo12: 15, total: 27 },
  { disease: "โรคหลอดเลือดสมอง", diseaseEn: "Stroke", moo11: 5, moo12: 6, total: 11 },
  { disease: "โรคหัวใจ", diseaseEn: "Heart", moo11: 4, moo12: 5, total: 9 },
  { disease: "ถุงลมโป่งพอง", diseaseEn: "COPD", moo11: 3, moo12: 4, total: 7 },
];

// ============================================
// Population Comparison Data
// ============================================
export const populationComparison = [
  { category: "ประชากรทั้งหมด", moo11: 950, moo12: 1091 },
  { category: "ผู้สูงอายุ (≥60)", moo11: 181, moo12: 218 },
  { category: "ผู้ป่วย NCD", moo11: 142, moo12: 168 },
  { category: "Multi-morbidity", moo11: 28, moo12: 35 },
];

// ============================================
// Health Coverage Data
// ============================================
export const healthCoverageData = [
  { name: "สิทธิ์ UC (บัตรทอง)", value: 1327, percentage: 65 },
  { name: "สิทธิ์ประกันสังคม", value: 388, percentage: 19 },
  { name: "สิทธิ์ข้าราชการ", value: 245, percentage: 12 },
  { name: "สิทธิ์อื่นๆ", value: 81, percentage: 4 },
];

// ============================================
// Monthly Trend Data (Oct 2568 — Mar 2569)
// ============================================
export const monthlyTrend = [
  { month: "ต.ค.", ncd: 295, elderly: 385, deaths: 3 },
  { month: "พ.ย.", ncd: 298, elderly: 388, deaths: 2 },
  { month: "ธ.ค.", ncd: 302, elderly: 390, deaths: 4 },
  { month: "ม.ค.", ncd: 305, elderly: 393, deaths: 2 },
  { month: "ก.พ.", ncd: 308, elderly: 396, deaths: 3 },
  { month: "มี.ค.", ncd: 310, elderly: 399, deaths: 2 },
];

// ============================================
// AI Summary Generator
// ============================================
export function generateAISummary(): string {
  const totalPop = villages.reduce((s, v) => s + v.totalPopulation, 0);
  const totalHouses = villages.reduce((s, v) => s + v.totalHouses, 0);
  const moo11 = villages.find((v) => v.moo === 11)!;
  const moo12 = villages.find((v) => v.moo === 12)!;

  const elderlyPctMoo12 = ((moo12.elderlyCount / moo12.totalPopulation) * 100).toFixed(0);
  const elderlyPctMoo11 = ((moo11.elderlyCount / moo11.totalPopulation) * 100).toFixed(0);

  const highRiskTotal = riskCounts.high;

  return `ขณะนี้หมู่ 12 (บ้านน้ำรีพัฒนา) มีสัดส่วนผู้สูงอายุและผู้ป่วยโรคความดันโลหิตสูงสูงกว่าหมู่ 11 เล็กน้อย (ร้อยละ ${elderlyPctMoo12} เทียบกับ ${elderlyPctMoo11}) จากประชากรรวม ${totalPop.toLocaleString()} คน ใน ${totalHouses} ครัวเรือน ควรเฝ้าระวังกลุ่มเป้าหมายในบ้านที่มีความเสี่ยงสูงจำนวน ${highRiskTotal} ครัวเรือน โดยเฉพาะครัวเรือนที่มีผู้สูงอายุ ≥2 คน หรือผู้ป่วย NCD ≥2 โรค`;
}

// ============================================
// Outbreak Cases — last 14 days (simulated)
// 5 disease types reflecting Nan province epidemiology
// ============================================
const OUTBREAK_DISEASES = [
  { name: "ไข้หวัดใหญ่ (Influenza)", weight: 0.30 },              // highest volume, seasonal
  { name: "อุจจาระร่วง/อาหารเป็นพิษ (Diarrhea)", weight: 0.20 }, // community clusters
  { name: "ไข้เลือดออก (Dengue)", weight: 0.20 },                 // high incidence in Nan
  { name: "ปอดอักเสบ (Pneumonia)", weight: 0.15 },                // high mortality in elderly
  { name: "สครับไทฟัส (Scrub Typhus)", weight: 0.15 },            // Nan = 2nd highest in Thailand
];

function pickOutbreakDisease(rng: () => number): string {
  const roll = rng();
  let cumulative = 0;
  for (const d of OUTBREAK_DISEASES) {
    cumulative += d.weight;
    if (roll < cumulative) return d.name;
  }
  return OUTBREAK_DISEASES[0].name;
}

function generateOutbreakCases(): OutbreakCase[] {
  const rng = seededRandom(999);
  const cases: OutbreakCase[] = [];

  // ~4% of houses affected
  const outbreakHouses = houses.filter(() => rng() < 0.04);

  for (const house of outbreakHouses) {
    const housePersons = persons.filter((p) => p.houseId === house.id);
    if (housePersons.length === 0) continue;
    const person = housePersons[Math.floor(rng() * housePersons.length)];
    const daysAgo = Math.floor(rng() * 14);
    const reportDate = new Date(2026, 2, 26 - daysAgo);
    const status: OutbreakCase["status"] = rng() < 0.55 ? "confirmed" : rng() < 0.80 ? "suspected" : "recovered";

    const disease = pickOutbreakDisease(rng);

    // Pneumonia skews toward elderly; Diarrhea skews toward clusters (add extra case)
    cases.push({
      houseId: house.id,
      personId: person.id,
      disease,
      reportDate: reportDate.toISOString().split("T")[0],
      status,
    });

    // Diarrhea/food poisoning clusters: 40% chance of a second case in same house
    if (disease.includes("อุจจาระร่วง") && rng() < 0.4 && housePersons.length > 1) {
      const other = housePersons.find((p) => p.id !== person.id);
      if (other) {
        cases.push({
          houseId: house.id,
          personId: other.id,
          disease,
          reportDate: reportDate.toISOString().split("T")[0],
          status: "suspected",
        });
      }
    }
  }
  return cases;
}

export const outbreakCases: OutbreakCase[] = generateOutbreakCases();
export const outbreakHouseIds = new Set(outbreakCases.map((c) => c.houseId));
