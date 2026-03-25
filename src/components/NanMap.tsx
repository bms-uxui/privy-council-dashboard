import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { House } from "../types";

// ============================================
// Tha Wang Pha district boundary (simplified)
// ============================================
const THA_WANG_PHA: [number, number][] = [
  [100.68,19.05],[100.72,19.06],[100.76,19.08],[100.80,19.10],[100.84,19.11],
  [100.88,19.12],[100.90,19.14],[100.91,19.17],[100.90,19.20],[100.88,19.23],
  [100.86,19.25],[100.83,19.26],[100.80,19.27],[100.77,19.26],[100.74,19.24],
  [100.72,19.22],[100.70,19.20],[100.68,19.18],[100.67,19.15],[100.66,19.12],
  [100.67,19.09],[100.68,19.05],
];

// ============================================
// Filter categories (Lamphun-style pills)
// ============================================
export interface MapFilter {
  key: string;
  label: string;
  icon: string;
  active: boolean;
}

export const DEFAULT_FILTERS: MapFilter[] = [
  { key: "all", label: "ทั้งหมด", icon: "🏘️", active: true },
  { key: "high", label: "เสี่ยงสูง", icon: "🔴", active: false },
  { key: "medium", label: "เสี่ยงปานกลาง", icon: "🟡", active: false },
  { key: "low", label: "เสี่ยงต่ำ", icon: "🟢", active: false },
  { key: "elderly", label: "ผู้สูงอายุ", icon: "👴", active: false },
  { key: "ncd", label: "ผู้ป่วย NCD", icon: "🩺", active: false },
  { key: "moo11", label: "หมู่ 11", icon: "📍", active: false },
  { key: "moo12", label: "หมู่ 12", icon: "📍", active: false },
];

// ============================================
// Props
// ============================================
interface NanMapProps {
  houses: House[];
  onHouseClick: (house: House) => void;
  selectedHouseId?: string | null;
  activeFilter: string;
  onFilterChange: (key: string) => void;
}

const RISK_FILLS: Record<string, string> = { high: "#DC2626", medium: "#F59E0B", low: "#16A34A" };
const RISK_LABELS: Record<string, string> = { high: "สูง", medium: "ปานกลาง", low: "ต่ำ" };
const RISK_ICONS: Record<string, string> = { high: "⚠️", medium: "🏠", low: "🏡" };
const MOO_BG: Record<number, string> = { 11: "#EDE9FE", 12: "#FEF3C7" };
const MOO_ICON_COLOR: Record<number, string> = { 11: "#5B2D9E", 12: "#B8960C" };

// Pin marker SVG generator
function createPinElement(house: House, isSelected: boolean): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "nan-pin-marker";
  wrapper.style.cssText = `
    display:flex;flex-direction:column;align-items:center;cursor:pointer;
    transition:transform 0.2s ease, filter 0.2s ease;
    transform-origin:center bottom;
    transform:${isSelected ? "scale(1.25)" : "scale(1)"};
    filter:${isSelected ? "drop-shadow(0 4px 8px rgba(59,21,120,0.3))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.15))"};
    z-index:${isSelected ? "10" : "1"};
  `;

  // Pin body
  const pin = document.createElement("div");
  const bgColor = MOO_BG[house.moo] || "#F3F4F6";
  const iconColor = MOO_ICON_COLOR[house.moo] || "#6B7280";
  const riskColor = RISK_FILLS[house.riskLevel];

  pin.style.cssText = `
    width:36px;height:36px;border-radius:50% 50% 50% 0;
    background:white;border:2.5px solid ${riskColor};
    display:flex;align-items:center;justify-content:center;
    transform:rotate(-45deg);position:relative;
  `;

  // Inner icon circle
  const inner = document.createElement("div");
  inner.style.cssText = `
    width:24px;height:24px;border-radius:50%;
    background:${bgColor};
    display:flex;align-items:center;justify-content:center;
    transform:rotate(45deg);font-size:13px;
  `;

  // Icon based on risk
  if (house.ncdCount >= 2) {
    inner.textContent = "🩺";
  } else if (house.elderlyCount >= 2) {
    inner.textContent = "👴";
  } else if (house.riskLevel === "high") {
    inner.textContent = "⚠️";
  } else {
    inner.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
  }

  pin.appendChild(inner);
  wrapper.appendChild(pin);

  // Shadow dot
  const shadow = document.createElement("div");
  shadow.style.cssText = `
    width:8px;height:4px;border-radius:50%;
    background:rgba(0,0,0,0.15);margin-top:2px;
  `;
  wrapper.appendChild(shadow);

  return wrapper;
}

export default function NanMap({ houses, onHouseClick, selectedHouseId, activeFilter, onFilterChange }: NanMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  // Initialize map — focused on Moo 11/12 area
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          carto: {
            type: "raster",
            tiles: ["https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png"],
            tileSize: 256,
            attribution: "&copy; CARTO &copy; OSM",
          },
        },
        layers: [{ id: "carto-tiles", type: "raster", source: "carto" }],
      },
      center: [100.824, 19.142],
      zoom: 13.5,
      minZoom: 10,
      maxZoom: 17,
      maxBounds: [[100.5, 18.9], [101.1, 19.4]],
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");

    map.on("load", () => {
      // District outline
      map.addSource("district-outline", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "Polygon", coordinates: [THA_WANG_PHA] },
        },
      });
      map.addLayer({
        id: "district-fill",
        type: "fill",
        source: "district-outline",
        paint: { "fill-color": "#3B1578", "fill-opacity": 0.03 },
      });
      map.addLayer({
        id: "district-stroke",
        type: "line",
        source: "district-outline",
        paint: { "line-color": "#5B2D9E", "line-width": 2, "line-opacity": 0.4 },
      });

      // District label
      const cx = THA_WANG_PHA.reduce((s, c) => s + c[0], 0) / THA_WANG_PHA.length;
      const cy = THA_WANG_PHA.reduce((s, c) => s + c[1], 0) / THA_WANG_PHA.length;
      map.addSource("district-label", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: { name: "อ.ท่าวังผา" },
          geometry: { type: "Point", coordinates: [cx, cy + 0.06] },
        },
      });
      map.addLayer({
        id: "district-label-text",
        type: "symbol",
        source: "district-label",
        layout: {
          "text-field": "อ.ท่าวังผา",
          "text-size": 14,
          "text-font": ["Open Sans Bold"],
        },
        paint: {
          "text-color": "#3B1578",
          "text-opacity": 0.25,
          "text-halo-color": "#ffffff",
          "text-halo-width": 2,
        },
      });
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Update markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    houses.forEach((house) => {
      const isSelected = house.id === selectedHouseId;
      const el = createPinElement(house, isSelected);

      // Hover
      el.addEventListener("mouseenter", () => {
        if (!isSelected) el.style.transform = "scale(1.15)";
        el.style.zIndex = "5";
        el.style.filter = "drop-shadow(0 4px 8px rgba(59,21,120,0.25))";
        // Show popup
        const riskBg = house.riskLevel === "high" ? "#FEE2E2" : house.riskLevel === "medium" ? "#FEF3C7" : "#DCFCE7";
        const riskTxt = house.riskLevel === "high" ? "#DC2626" : house.riskLevel === "medium" ? "#D97706" : "#16A34A";
        const mooColor = MOO_ICON_COLOR[house.moo] || "#6B7280";
        const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 24, className: "nan-map-popup" })
          .setLngLat([house.lng, house.lat])
          .setHTML(`
            <div style="font-family:'Google Sans','Noto Sans Thai',sans-serif;font-size:12px;line-height:1.6;min-width:160px">
              <div style="font-weight:700;font-size:13px;margin-bottom:2px">${house.houseCode}</div>
              <div style="color:${mooColor};font-weight:600;font-size:11px">${house.moo === 11 ? "หมู่ 11 บ้านน้ำช้าง" : "หมู่ 12 บ้านน้ำรีพัฒนา"}</div>
              <div style="border-top:1px solid #eee;margin:5px 0;padding-top:5px;display:flex;gap:10px">
                <span>👥 ${house.memberCount}</span><span>👴 ${house.elderlyCount}</span><span>🩺 ${house.ncdCount}</span>
              </div>
              <span style="display:inline-block;padding:2px 10px;border-radius:99px;font-size:10px;font-weight:600;background:${riskBg};color:${riskTxt};margin-top:2px">
                ความเสี่ยง${RISK_LABELS[house.riskLevel]}
              </span>
            </div>
          `)
          .addTo(map);
        popupRef.current = popup;
      });

      el.addEventListener("mouseleave", () => {
        if (!isSelected) {
          el.style.transform = "scale(1)";
          el.style.zIndex = "1";
          el.style.filter = "drop-shadow(0 2px 4px rgba(0,0,0,0.15))";
        }
        popupRef.current?.remove();
        popupRef.current = null;
      });

      el.addEventListener("click", () => onHouseClick(house));

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([house.lng, house.lat])
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [houses, selectedHouseId, onHouseClick]);

  return (
    <div className="relative w-full h-full">
      {/* Filter pills — horizontal scroll like Lamphun site */}
      <div className="absolute top-3 left-3 right-3 z-10">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {DEFAULT_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all min-h-[36px] shadow-sm border ${
                activeFilter === f.key
                  ? "bg-royal-blue text-white border-royal-blue shadow-md"
                  : "bg-white text-text-muted border-gray-200 hover:bg-gray-50"
              }`}
            >
              <span className="text-sm">{f.icon}</span>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div ref={mapContainer} className="w-full h-full rounded-2xl" />

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md border border-gray-200/80 z-10 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center text-[8px]" style={{ borderColor: "#DC2626" }}>🏠</div>
          <span className="text-[10px] text-text-muted">เสี่ยงสูง</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center text-[8px]" style={{ borderColor: "#F59E0B" }}>🏠</div>
          <span className="text-[10px] text-text-muted">ปานกลาง</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center text-[8px]" style={{ borderColor: "#16A34A" }}>🏠</div>
          <span className="text-[10px] text-text-muted">ต่ำ</span>
        </div>
        <div className="w-px h-4 bg-gray-200" />
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#EDE9FE" }} />
          <span className="text-[10px] text-text-muted">ม.11</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#FEF3C7" }} />
          <span className="text-[10px] text-text-muted">ม.12</span>
        </div>
      </div>
    </div>
  );
}
