import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Animated counter component
function AnimatedNumber({ value, duration = 800, className = "" }: { value: number; duration?: number; className?: string }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const from = prevValue.current;
    const to = value;
    const start = performance.now();

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (to - from) * eased);
      setDisplay(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        prevValue.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <span className={className}>{display.toLocaleString()}</span>;
}

function useScrollShadow() {
  const ref = useRef<HTMLDivElement>(null);
  const [shadowClass, setShadowClass] = useState("scroll-shadow-bottom");

  const onScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const atTop = scrollTop < 4;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 4;
    if (atTop && atBottom) setShadowClass("");
    else if (atTop) setShadowClass("scroll-shadow-bottom");
    else if (atBottom) setShadowClass("scroll-shadow-top");
    else setShadowClass("scroll-shadow-both");
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  return { ref, shadowClass };
}
import {
  X,
  Users,
  HeartPulse,
  AlertTriangle,
  Home,
  ChevronRight,
  Layers,
  MapPin,
  Stethoscope,
  UserRound,
  ShieldAlert,
  CircleDot,
  Activity,
  TrendingUp,
  Sparkles,
  Heart,
  Maximize2,
  Minimize2,
  ZoomOut,
  Map as MapIcon,
  Sun,
  Mountain,
  Globe,
  Search,
  ChevronDown as ChevronDownIcon,
  Bug,
  Syringe,
} from "lucide-react";
import { houses, persons, villages, ncdStats, riskCounts, generateAISummary, populationComparison, healthCoverageData, outbreakCases, outbreakHouseIds, VACCINE_GROUP_LABELS, VACCINE_DEFS } from "../data/mockData";
import type { House, VaccineGroup } from "../types";

// ============================================
// Inline SVG icon strings for DOM markers
// ============================================
const svgIcon = (path: string, color: string, size = 16) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;

const ICON_SVG = {
  home: (c: string) => svgIcon('<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>', c),
  alert: (c: string) => svgIcon('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>', c),
  stethoscope: (c: string) => svgIcon('<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>', c),
  user: (c: string) => svgIcon('<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>', c),
  mapPin: (c: string) => svgIcon('<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>', c),
  layers: (c: string) => svgIcon('<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m2 12 8.58 3.91a2 2 0 0 0 1.66 0L21 12"/><path d="m2 17 8.58 3.91a2 2 0 0 0 1.66 0L21 17"/>', c),
  circle: (c: string) => svgIcon('<circle cx="12" cy="12" r="10"/>', c, 12),
};

// ============================================
// Real coordinates: ต.ขุนน่าน อ.เฉลิมพระเกียรติ จ.น่าน
// Moo 11 center: 19.54656, 101.20928
// Moo 12 center: 19.51919, 101.22848
// ============================================

// ต.ขุนน่าน district boundary (approximate from terrain)
const KHUN_NAN_TAMBON: [number, number][] = [
  [101.16,19.50],[101.17,19.51],[101.18,19.52],[101.19,19.53],
  [101.19,19.55],[101.19,19.57],[101.20,19.58],[101.22,19.59],
  [101.24,19.59],[101.26,19.58],[101.27,19.57],[101.27,19.55],
  [101.26,19.53],[101.25,19.52],[101.25,19.51],[101.26,19.50],
  [101.25,19.49],[101.24,19.48],[101.22,19.48],[101.20,19.49],
  [101.18,19.50],[101.16,19.50],
];

// หมู่ 11 บ้านน้ำช้าง — from OSM residential landuse + road 1307 valley
const MOO_11_AREA: [number, number][] = [
  [101.2000,19.5525],[101.2015,19.5535],[101.2030,19.5540],
  [101.2045,19.5540],[101.2060,19.5535],[101.2075,19.5520],
  [101.2090,19.5510],[101.2100,19.5505],[101.2110,19.5498],
  [101.2120,19.5490],[101.2130,19.5478],[101.2125,19.5465],
  [101.2118,19.5460],[101.2100,19.5455],[101.2085,19.5448],
  [101.2070,19.5445],[101.2060,19.5448],[101.2055,19.5450],
  [101.2045,19.5445],[101.2035,19.5435],[101.2025,19.5428],
  [101.2015,19.5422],[101.2005,19.5420],[101.1998,19.5422],
  [101.1990,19.5440],[101.1985,19.5460],[101.1988,19.5480],
  [101.1993,19.5500],[101.1998,19.5515],[101.2000,19.5525],
];

// หมู่ 12 บ้านน้ำรีพัฒนา — from OSM residential landuse along Nam Ri creek
const MOO_12_AREA: [number, number][] = [
  [101.2194,19.5210],[101.2205,19.5215],[101.2215,19.5212],
  [101.2225,19.5210],[101.2232,19.5208],[101.2245,19.5207],
  [101.2258,19.5210],[101.2270,19.5207],[101.2280,19.5202],
  [101.2295,19.5200],[101.2302,19.5198],[101.2305,19.5195],
  [101.2305,19.5185],[101.2300,19.5170],[101.2295,19.5165],
  [101.2285,19.5160],[101.2270,19.5158],[101.2260,19.5162],
  [101.2250,19.5168],[101.2240,19.5170],[101.2230,19.5167],
  [101.2220,19.5162],[101.2210,19.5158],[101.2200,19.5150],
  [101.2195,19.5145],[101.2192,19.5142],[101.2190,19.5148],
  [101.2192,19.5155],[101.2190,19.5165],[101.2188,19.5175],
  [101.2187,19.5185],[101.2188,19.5195],[101.2190,19.5202],
  [101.2194,19.5210],
];

// ============================================
// Filters
// ============================================
// Health risk filters — top left (next to left panel)
const HEALTH_FILTERS = [
  { key: "all", label: "ทั้งหมด", Icon: Layers, color: "#1C85AD" },
  { key: "high", label: "เสี่ยงสูง", Icon: ShieldAlert, color: "#DC2626" },
  { key: "medium", label: "ปานกลาง", Icon: AlertTriangle, color: "#F59E0B" },
  { key: "low", label: "เสี่ยงต่ำ", Icon: Home, color: "#16A34A" },
  { key: "elderly", label: "ผู้สูงอายุ", Icon: UserRound, color: "#6EC3C3" },
  { key: "ncd", label: "ผู้ป่วย NCD", Icon: Stethoscope, color: "#DC2626" },
];

// View mode filters — bottom center
const VIEW_FILTERS = [
  { key: "outbreak", label: "โรคระบาด", Icon: Bug, color: "#9333EA" },
  { key: "vaccine", label: "วัคซีน", Icon: Syringe, color: "#0EA5E9" },
];

// Combined for lookup
const FILTERS = [...HEALTH_FILTERS, ...VIEW_FILTERS];

const RISK_COLORS: Record<string, string> = { high: "#DC2626", medium: "#F59E0B", low: "#16A34A" };
const RISK_LABELS: Record<string, string> = { high: "สูง", medium: "ปานกลาง", low: "ต่ำ" };

export default function GISMap() {
  const [searchParams] = useSearchParams();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(13.5);
  const [visibleArea, setVisibleArea] = useState<string | null>(null);
  const [selectedNCD, setSelectedNCD] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState("light");
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ type: "house" | "person"; house: House; personName?: string }[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(false);
  const [outbreakMode, setOutbreakMode] = useState(false);
  const [outbreakView, setOutbreakView] = useState<"mini" | "full">("mini");
  const [vaccineGroup, setVaccineGroup] = useState<VaccineGroup | "all">("all");
  const [vaccineView, setVaccineView] = useState<"mini" | "full">("mini");
  const [villageTab, setVillageTab] = useState<number>(11);
  const [mobilePanel, setMobilePanel] = useState<"left" | "right" | null>(null);
  const leftScroll = useScrollShadow();
  const rightScroll = useScrollShadow();

  // Auto-zoom to house from query param (e.g. from Household page)
  useEffect(() => {
    const houseId = searchParams.get("house");
    if (!houseId) return;
    const house = houses.find((h) => h.id === houseId);
    if (!house) return;
    setSelectedHouse(house);
    // Wait for map to be ready then zoom
    const tryZoom = () => {
      const map = mapRef.current;
      if (map) {
        map.easeTo({ center: [house.lng, house.lat], zoom: 16, duration: 800 });
      } else {
        setTimeout(tryZoom, 200);
      }
    };
    tryZoom();
  }, [searchParams]);

  const filteredHouses = useMemo(() => {
    return houses.filter((h) => {
      if (activeFilter === "outbreak") return outbreakHouseIds.has(h.id);
      if (activeFilter === "vaccine") return true; // show all houses, persons plotted separately
      if (activeFilter === "all") return true;
      if (activeFilter === "high" || activeFilter === "medium" || activeFilter === "low") return h.riskLevel === activeFilter;
      if (activeFilter === "elderly") return h.elderlyCount > 0;
      if (activeFilter === "ncd") return h.ncdCount > 0;
      if (activeFilter === "moo11") return h.moo === 11;
      if (activeFilter === "moo12") return h.moo === 12;
      return true;
    });
  }, [activeFilter]);

  // Toggle outbreak mode when filter changes
  const isOutbreakActive = activeFilter === "outbreak";

  const houseMembers = selectedHouse ? persons.filter((p) => p.houseId === selectedHouse.id) : [];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query || query.length < 1) {
      setSearchResults([]);
      return;
    }
    const q = query.toLowerCase();
    const results: typeof searchResults = [];

    // Search by house number
    houses.forEach((h) => {
      if (h.houseCode.includes(q) || h.address.toLowerCase().includes(q)) {
        results.push({ type: "house", house: h });
      }
    });

    // Search by person name
    persons.forEach((p) => {
      if (
        p.firstName.includes(q) ||
        p.lastName.includes(q) ||
        `${p.prefix}${p.firstName}`.includes(q) ||
        `${p.firstName} ${p.lastName}`.includes(q) ||
        p.hn.toLowerCase().includes(q)
      ) {
        const house = houses.find((h) => h.id === p.houseId);
        if (house) {
          results.push({ type: "person", house, personName: `${p.prefix}${p.firstName} ${p.lastName}` });
        }
      }
    });

    setSearchResults(results.slice(0, 8));
  };

  const zoomToHouse = (house: House) => {
    setSelectedHouse(house);
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
    mapRef.current?.easeTo({
      center: [house.lng, house.lat],
      zoom: 16,
      duration: 800,
    });
  };

  // Map tile styles
  const MAP_STYLES: Record<string, { name: string; tiles: string[] }> = {
    light: {
      name: "สว่าง",
      tiles: ["https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png", "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png"],
    },
    satellite: {
      name: "ดาวเทียม",
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
    },
    street: {
      name: "ถนน",
      tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png", "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png"],
    },
    topo: {
      name: "ภูมิประเทศ",
      tiles: ["https://a.tile.opentopomap.org/{z}/{x}/{y}.png", "https://b.tile.opentopomap.org/{z}/{x}/{y}.png"],
    },
  };

  // Change map tiles when style changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.loaded()) return;
    const source = map.getSource("basemap") as maplibregl.RasterTileSource;
    if (source) {
      // Remove and re-add source with new tiles
      const center = map.getCenter();
      const zoom = map.getZoom();
      map.removeLayer("basemap-tiles");
      map.removeSource("basemap");
      map.addSource("basemap", {
        type: "raster",
        tiles: MAP_STYLES[mapStyle].tiles,
        tileSize: 256, maxzoom: 16,
      });
      map.addLayer({ id: "basemap-tiles", type: "raster", source: "basemap" }, map.getStyle().layers[1]?.id);
      map.setCenter(center);
      map.setZoom(zoom);
    }
  }, [mapStyle]);

  // Init map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          "basemap": {
            type: "raster",
            tiles: MAP_STYLES[mapStyle].tiles,
            tileSize: 256, maxzoom: 16,
            attribution: "&copy; CARTO &copy; OpenStreetMap",
          },
        },
        layers: [
          { id: "basemap-tiles", type: "raster", source: "basemap", minzoom: 0, maxzoom: 20 },
        ],
      },
      center: [101.220, 19.533],
      zoom: 13.5,
      minZoom: 10,
      maxZoom: 16,
      maxBounds: [[101.0, 19.4], [101.4, 19.7]],
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      // White wash overlay (like Bangkok site)
      map.addLayer({
        id: "white-overlay",
        type: "background",
        paint: { "background-color": "#FFFFFF", "background-opacity": 0.35 },
      });

      // ต.ขุนน่าน tambon boundary
      map.addSource("tambon", {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [KHUN_NAN_TAMBON] } },
      });
      map.addLayer({
        id: "tambon-fill",
        type: "fill",
        source: "tambon",
        paint: { "fill-color": "#1C85AD", "fill-opacity": 0.06 },
      });
      map.addLayer({
        id: "tambon-border",
        type: "line",
        source: "tambon",
        paint: { "line-color": "#1C85AD", "line-width": 1.5, "line-opacity": 0.4, "line-dasharray": [6, 3] },
      });

      // Labels as HTML markers (raster tiles don't support symbol layers)
      const labels = [
        { name: "ต.ขุนน่าน อ.เฉลิมพระเกียรติ", coords: [101.215, 19.49] as [number, number], size: 11, opacity: 0.25, bold: false },
        { name: "หมู่ 11 บ้านน้ำช้าง", coords: [101.206, 19.548] as [number, number], size: 13, opacity: 0.7, bold: true },
        { name: "หมู่ 12 บ้านน้ำรีพัฒนา", coords: [101.225, 19.518] as [number, number], size: 13, opacity: 0.7, bold: true },
      ];
      labels.forEach((l) => {
        const el = document.createElement("div");
        el.style.cssText = `font-family:'Google Sans','Noto Sans Thai',sans-serif;font-size:${l.size}px;color:#1C85AD;opacity:${l.opacity};font-weight:${l.bold ? 700 : 400};text-shadow:0 0 4px #fff,0 0 4px #fff,0 0 4px #fff;pointer-events:none;white-space:nowrap;`;
        el.textContent = l.name;
        new maplibregl.Marker({ element: el, anchor: "center" }).setLngLat(l.coords).addTo(map);
      });
    });

    // Track zoom and detect which area user is looking at
    const MOO11_CENTER: [number, number] = [101.206, 19.548];
    const MOO12_CENTER: [number, number] = [101.225, 19.518];

    const detectArea = () => {
      const z = map.getZoom();
      setZoomLevel(z);
      if (z < 14) {
        setVisibleArea(null);
        return;
      }
      const center = map.getCenter();
      const d11 = Math.sqrt(Math.pow(center.lng - MOO11_CENTER[0], 2) + Math.pow(center.lat - MOO11_CENTER[1], 2));
      const d12 = Math.sqrt(Math.pow(center.lng - MOO12_CENTER[0], 2) + Math.pow(center.lat - MOO12_CENTER[1], 2));
      if (d11 < 0.015) setVisibleArea("moo11");
      else if (d12 < 0.015) setVisibleArea("moo12");
      else setVisibleArea("both");
    };

    map.on("zoomend", detectArea);
    map.on("moveend", detectArea);

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Clustered house markers using MapLibre native clustering
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const SOURCE_ID = "houses-source";
    const CLUSTER_LAYER = "house-clusters";
    const CLUSTER_COUNT_LAYER = "house-cluster-count";
    const UNCLUSTER_LAYER = "house-unclustered";

    const setupClusters = () => {
      // Cleanup vaccine layers from previous render
      if ((map as any)._vaxCleanup) { (map as any)._vaxCleanup(); (map as any)._vaxCleanup = null; }

      // Remove existing layers/source if re-rendering
      [CLUSTER_COUNT_LAYER, CLUSTER_LAYER, CLUSTER_LAYER + "-halo", UNCLUSTER_LAYER].forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id);
      });
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);

      // Clear DOM markers from previous render
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Build GeoJSON from filtered houses
      const outbreakDiseaseMap = new Map<string, string>();
      if (activeFilter === "outbreak") {
        outbreakCases.forEach((c) => { if (!outbreakDiseaseMap.has(c.houseId)) outbreakDiseaseMap.set(c.houseId, c.disease); });
      }

      const geojson: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: filteredHouses.map((h) => ({
          type: "Feature",
          properties: {
            id: h.id,
            houseCode: h.houseCode,
            moo: h.moo,
            riskLevel: h.riskLevel,
            memberCount: h.memberCount,
            elderlyCount: h.elderlyCount,
            ncdCount: h.ncdCount,
            address: h.address,
            outbreakDisease: outbreakDiseaseMap.get(h.id) || "",
          },
          geometry: { type: "Point", coordinates: [h.lng, h.lat] },
        })),
      };

      const isOutbreak = activeFilter === "outbreak";

      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: geojson,
        cluster: !isOutbreak && activeFilter !== "vaccine",
        clusterMaxZoom: 14,
        clusterRadius: 40,
      });

      // Cluster halo (outbreak only) — soft glow behind cluster
      if (isOutbreak) {
        map.addLayer({
          id: CLUSTER_LAYER + "-halo",
          type: "circle",
          source: SOURCE_ID,
          filter: ["has", "point_count"],
          paint: {
            "circle-color": "#DC2626",
            "circle-radius": [
              "step", ["get", "point_count"],
              28, 5, 34, 15, 42,
            ],
            "circle-opacity": 0.12,
          },
        });
      }

      // Cluster circles — size based on point count
      map.addLayer({
        id: CLUSTER_LAYER,
        type: "circle",
        source: SOURCE_ID,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": isOutbreak
            ? [
                "step", ["get", "point_count"],
                "#F87171",  // < 5: light red
                5, "#DC2626", // 5-15: red
                15, "#991B1B", // 15+: dark red
              ]
            : [
                "step", ["get", "point_count"],
                "#6EC3C3",  // < 10
                10, "#1C85AD", // 10-30
                30, "#156A8A", // 30+
              ],
          "circle-radius": isOutbreak
            ? [
                "step", ["get", "point_count"],
                20, 5, 26, 15, 34,
              ]
            : [
                "step", ["get", "point_count"],
                18, 10, 24, 30, 32,
              ],
          "circle-stroke-width": activeFilter === "vaccine" ? 0 : isOutbreak ? 2.5 : 3,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": activeFilter === "vaccine" ? 0 : isOutbreak ? 0.9 : 0.85,
          "circle-stroke-opacity": activeFilter === "vaccine" ? 0 : 1,
        },
      });

      // Cluster count labels
      map.addLayer({
        id: CLUSTER_COUNT_LAYER,
        type: "symbol",
        source: SOURCE_ID,
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-size": isOutbreak ? 14 : 13,
          "text-font": ["Open Sans Bold"],
        },
        paint: {
          "text-color": "#ffffff",
        },
      });

      // Individual unclustered points
      map.addLayer({
        id: UNCLUSTER_LAYER,
        type: "circle",
        source: SOURCE_ID,
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": activeFilter === "outbreak"
            ? [
                "match", ["get", "outbreakDisease"],
                "ไข้หวัดใหญ่ (Influenza)", "#3B82F6",
                "อุจจาระร่วง/อาหารเป็นพิษ (Diarrhea)", "#F59E0B",
                "ไข้เลือดออก (Dengue)", "#DC2626",
                "ปอดอักเสบ (Pneumonia)", "#10B981",
                "สครับไทฟัส (Scrub Typhus)", "#EC4899",
                "#9333EA",
              ]
            : [
                "match", ["get", "riskLevel"],
                "high", "#DC2626",
                "medium", "#F59E0B",
                "low", "#16A34A",
                "#1C85AD",
              ],
          "circle-radius": activeFilter === "outbreak" ? 9 : 8,
          "circle-stroke-width": 2.5,
          "circle-stroke-color": activeFilter === "outbreak"
            ? "#ffffff"
            : [
                "match", ["get", "moo"],
                11, "#1C85AD",
                12, "#6EC3C3",
                "#1C85AD",
              ],
          "circle-opacity": 0.9,
        },
      });

      // Outbreak pulse rings (DOM markers) — color matches disease
      if (activeFilter === "outbreak") {
        const pulseColors: Record<string, { bg: string; shadow: string }> = {
          "ไข้หวัดใหญ่ (Influenza)": { bg: "rgba(59,130,246,0.25)", shadow: "59,130,246" },
          "อุจจาระร่วง/อาหารเป็นพิษ (Diarrhea)": { bg: "rgba(245,158,11,0.25)", shadow: "245,158,11" },
          "ไข้เลือดออก (Dengue)": { bg: "rgba(220,38,38,0.25)", shadow: "220,38,38" },
          "ปอดอักเสบ (Pneumonia)": { bg: "rgba(16,185,129,0.25)", shadow: "16,185,129" },
          "สครับไทฟัส (Scrub Typhus)": { bg: "rgba(236,72,153,0.25)", shadow: "236,72,153" },
        };
        filteredHouses.forEach((h) => {
          const disease = outbreakDiseaseMap.get(h.id) || "";
          const colors = pulseColors[disease] || { bg: "rgba(147,51,234,0.25)", shadow: "147,51,234" };
          const el = document.createElement("div");
          el.style.cssText = `width:28px;height:28px;background:${colors.bg};pointer-events:none;border-radius:50%;animation:outbreakPulseCustom 1.5s ease-out infinite;--pulse-rgb:${colors.shadow};`;
          const marker = new maplibregl.Marker({ element: el, anchor: "center" })
            .setLngLat([h.lng, h.lat])
            .addTo(map);
          markersRef.current.push(marker);
        });
      }

      // Vaccine household layer (no clustering — one dot per house)
      if (activeFilter === "vaccine") {
        const VG_COLORS: Record<string, string> = {
          epi_child: "#3B82F6", school: "#10B981", risk: "#F59E0B", pilot: "#8B5CF6", optional: "#EC4899",
        };
        const VAX_SOURCE = "vaccine-houses";
        const VAX_POINTS = "vaccine-dots";

        // Aggregate to household level
        const vaxHouseMap = new Map<string, { house: House; group: string; vaxCount: number; personCount: number; moo: number }>();
        persons.forEach((p) => {
          const matchVax = vaccineGroup === "all" ? p.vaccinations : p.vaccinations.filter((v) => v.group === vaccineGroup);
          if (matchVax.length === 0) return;
          const house = houses.find((h) => h.id === p.houseId);
          if (!house) return;
          const existing = vaxHouseMap.get(house.id);
          if (existing) {
            existing.vaxCount += matchVax.length;
            existing.personCount += 1;
          } else {
            // Dominant group for this person
            const gc = new Map<string, number>();
            matchVax.forEach((v) => gc.set(v.group, (gc.get(v.group) || 0) + 1));
            const topGroup = Array.from(gc.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "risk";
            vaxHouseMap.set(house.id, { house, group: topGroup, vaxCount: matchVax.length, personCount: 1, moo: house.moo });
          }
        });

        const vaxGeoJSON: GeoJSON.FeatureCollection = {
          type: "FeatureCollection",
          features: Array.from(vaxHouseMap.values()).map((h) => ({
            type: "Feature" as const,
            properties: { id: h.house.id, group: h.group, moo: h.moo, personCount: h.personCount, vaxCount: h.vaxCount, houseCode: h.house.houseCode },
            geometry: { type: "Point" as const, coordinates: [h.house.lng, h.house.lat] },
          })),
        };

        map.addSource(VAX_SOURCE, { type: "geojson", data: vaxGeoJSON });

        // Individual house dots — color by dominant vaccine group, size by person count
        map.addLayer({
          id: VAX_POINTS,
          type: "circle",
          source: VAX_SOURCE,
          paint: {
            "circle-color": [
              "match", ["get", "group"],
              "epi_child", "#3B82F6",
              "school", "#10B981",
              "risk", "#F59E0B",
              "pilot", "#8B5CF6",
              "optional", "#EC4899",
              "#0EA5E9",
            ],
            "circle-radius": [
              "interpolate", ["linear"], ["get", "personCount"],
              1, 5, 3, 7, 6, 10,
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
            "circle-opacity": 0.85,
          },
        });

        // Click → open house drawer
        map.on("click", VAX_POINTS, (e) => {
          const feat = e.features?.[0];
          if (!feat) return;
          const house = houses.find((h) => h.id === feat.properties?.id);
          if (house) { setSelectedHouse(house); setMobilePanel(null); }
        });

        // Hover popup
        map.on("mouseenter", VAX_POINTS, (e) => {
          map.getCanvas().style.cursor = "pointer";
          popupRef.current?.remove();
          const feat = e.features?.[0];
          if (!feat) return;
          const coords = (feat.geometry as GeoJSON.Point).coordinates as [number, number];
          const groupColor = VG_COLORS[feat.properties?.group] || "#0EA5E9";
          const groupName = VACCINE_GROUP_LABELS[feat.properties?.group as VaccineGroup]?.name || "";
          popupRef.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 8, className: "nan-map-popup" })
            .setLngLat(coords)
            .setHTML(`<div style="font-family:'Google Sans','Noto Sans Thai',sans-serif;font-size:12px;min-width:150px">
              <div style="font-weight:700">บ้านเลขที่ ${feat.properties?.houseCode}</div>
              <div style="color:${groupColor};font-size:11px;font-weight:600">${groupName}</div>
              <div style="color:#6B7280;font-size:11px">หมู่ ${feat.properties?.moo} · ${feat.properties?.personCount} คน · ${feat.properties?.vaxCount} วัคซีน</div>
            </div>`)
            .addTo(map);
        });
        map.on("mouseleave", VAX_POINTS, () => {
          map.getCanvas().style.cursor = "";
          popupRef.current?.remove();
          popupRef.current = null;
        });

        // Cleanup
        const cleanupVax = () => {
          if (map.getLayer(VAX_POINTS)) map.removeLayer(VAX_POINTS);
          if (map.getSource(VAX_SOURCE)) map.removeSource(VAX_SOURCE);
        };
        (map as any)._vaxCleanup = cleanupVax;
      }

      // Click cluster → zoom in
      map.on("click", CLUSTER_LAYER, (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: [CLUSTER_LAYER] });
        if (!features.length) return;
        const clusterId = features[0].properties?.cluster_id;
        const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource;
        source.getClusterExpansionZoom(clusterId).then((zoom) => {
          map.easeTo({
            center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
            zoom: Math.min(zoom, 16),
            duration: 500,
          });
        });
      });

      // Click individual point → open drawer
      map.on("click", UNCLUSTER_LAYER, (e) => {
        const feat = e.features?.[0];
        if (!feat) return;
        const houseId = feat.properties?.id;
        const house = filteredHouses.find((h) => h.id === houseId);
        if (house) { setSelectedHouse(house); setMobilePanel(null); }
      });

      // Hover individual point → popup (remove old one first)
      map.on("mouseenter", UNCLUSTER_LAYER, (e) => {
        map.getCanvas().style.cursor = "pointer";
        // Always remove previous popup
        popupRef.current?.remove();
        popupRef.current = null;

        const feat = e.features?.[0];
        if (!feat) return;
        const props = feat.properties!;
        const coords = (feat.geometry as GeoJSON.Point).coordinates as [number, number];
        const mooColor = props.moo === 11 ? "#1C85AD" : "#6EC3C3";
        const mooLabel = props.moo === 11 ? "หมู่ 11 บ้านน้ำช้าง" : "หมู่ 12 บ้านน้ำรีพัฒนา";
        const riskBg = props.riskLevel === "high" ? "#FEE2E2" : props.riskLevel === "medium" ? "#FEF3C7" : "#DCFCE7";
        const riskTxt = props.riskLevel === "high" ? "#DC2626" : props.riskLevel === "medium" ? "#D97706" : "#16A34A";

        popupRef.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 12, className: "nan-map-popup" })
          .setLngLat(coords)
          .setHTML(`
            <div style="font-family:'Google Sans','Noto Sans Thai',sans-serif;font-size:12px;line-height:1.6;min-width:170px">
              <div style="font-weight:700;font-size:13px;color:#1A2E3B">บ้านเลขที่ ${props.houseCode}</div>
              <div style="color:${mooColor};font-weight:600;font-size:11px">${mooLabel}</div>
              <div style="border-top:1px solid #eee;margin:4px 0;padding-top:4px;display:flex;gap:10px;color:#5A7A8A">
                <span>สมาชิก ${props.memberCount}</span><span>สูงอายุ ${props.elderlyCount}</span><span>NCD ${props.ncdCount}</span>
              </div>
              <span style="display:inline-block;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:600;background:${riskBg};color:${riskTxt}">
                ความเสี่ยง${RISK_LABELS[props.riskLevel]}
              </span>
            </div>
          `)
          .addTo(map);
      });

      map.on("mouseleave", UNCLUSTER_LAYER, () => {
        map.getCanvas().style.cursor = "";
        popupRef.current?.remove();
        popupRef.current = null;
      });

      // Hover cluster → pointer cursor
      map.on("mouseenter", CLUSTER_LAYER, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", CLUSTER_LAYER, () => {
        map.getCanvas().style.cursor = "";
      });
    };

    if (map.loaded()) {
      setupClusters();
    } else {
      map.on("load", setupClusters);
    }
  }, [filteredHouses, vaccineGroup]);

  // Computed stats — reactive to filter
  const selectedVillages = useMemo(() => {
    if (activeFilter === "moo11") return villages.filter((v) => v.moo === 11);
    if (activeFilter === "moo12") return villages.filter((v) => v.moo === 12);
    return villages;
  }, [activeFilter]);
  const totalPop = selectedVillages.reduce((s, v) => s + v.totalPopulation, 0);
  const totalHouses = selectedVillages.reduce((s, v) => s + v.totalHouses, 0);
  const totalElderly = selectedVillages.reduce((s, v) => s + v.elderlyCount, 0);
  const totalNCD = selectedVillages.reduce((s, v) => s + v.ncdCount, 0);
  const ncdPct = ((totalNCD / totalPop) * 100).toFixed(1);
  const elderlyPct = ((totalElderly / totalPop) * 100).toFixed(1);

  return (
    <div className="relative w-full h-full">
      {/* Map canvas */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* ══════ TOP BAR: Search + Indicator + Map Style (desktop only) ══════ */}
      <div className="absolute top-[76px] left-1/2 -translate-x-1/2 z-20 hidden lg:flex items-start gap-2 pointer-events-none">
        {/* Search — left */}
        <div className="pointer-events-auto relative">
          <button
            onClick={() => { setShowSearch(!showSearch); setShowStylePicker(false); }}
            className="relative group w-10 h-10 rounded-xl bg-white/95 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors text-text-muted"
          >
            <Search size={18} />
            <span className="absolute top-full mt-1.5 px-2 py-0.5 rounded bg-gray-900 text-white text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">ค้นหา</span>
          </button>
          {showSearch && (
            <div className="absolute top-full mt-2 left-0 w-[320px] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-30">
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
                <Search size={15} className="text-text-light flex-shrink-0" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ, บ้านเลขที่, HN..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  autoFocus
                  className="flex-1 text-sm outline-none bg-transparent text-text placeholder:text-text-light"
                />
                {searchQuery && (
                  <button onClick={(e) => { e.stopPropagation(); setSearchQuery(""); setSearchResults([]); }} className="text-text-light hover:text-text">
                    <X size={14} />
                  </button>
                )}
              </div>
              {searchResults.length > 0 ? (
                <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                  {searchResults.map((r, i) => (
                    <button
                      key={`${r.house.id}-${i}`}
                      onClick={() => zoomToHouse(r.house)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{
                        backgroundColor: r.type === "person" ? "#E0F2FE" : "#F0FDF4",
                      }}>
                        {r.type === "person" ? <UserRound size={14} className="text-royal-blue" /> : <Home size={14} className="text-green-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        {r.type === "person" ? (
                          <>
                            <p className="text-sm font-medium text-text truncate">{r.personName}</p>
                            <p className="text-sm text-text-muted">บ้านเลขที่ {r.house.houseCode} ม.{r.house.moo}</p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-medium text-text">บ้านเลขที่ {r.house.houseCode}</p>
                            <p className="text-sm text-text-muted">{r.house.address}</p>
                          </>
                        )}
                      </div>
                      <ChevronRight size={14} className="text-text-light flex-shrink-0" />
                    </button>
                  ))}
                </div>
              ) : searchQuery.length > 0 ? (
                <div className="px-4 py-6 text-center text-sm text-text-muted">ไม่พบผลลัพธ์</div>
              ) : (
                <div className="px-4 py-4 text-center text-sm text-text-muted">พิมพ์ชื่อ, บ้านเลขที่ หรือ HN เพื่อค้นหา</div>
              )}
            </div>
          )}
        </div>

        {/* Indicator — center (hidden on small mobile) */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-sm rounded-full shadow-md px-4 h-10 hidden sm:flex items-center gap-2 text-sm">
          <button
            onClick={() => { mapRef.current?.easeTo({ center: [101.220, 19.533], zoom: 13.5, duration: 600 }); }}
            className="text-royal-blue font-medium hover:underline"
          >
            ต.ขุนน่าน
          </button>
          {visibleArea && (
            <>
              <ChevronRight size={12} className="text-text-light" />
              {visibleArea === "moo11" ? (
                <span className="font-semibold text-text">หมู่ 11 บ้านน้ำช้าง</span>
              ) : visibleArea === "moo12" ? (
                <span className="font-semibold text-text">หมู่ 12 บ้านน้ำรีพัฒนา</span>
              ) : (
                <span className="font-semibold text-text">หมู่ 11 — 12</span>
              )}
            </>
          )}
          {activeFilter !== "all" && (
            <>
              <span className="text-text-light">|</span>
              <span className="text-royal-blue font-medium">
                {FILTERS.find((f) => f.key === activeFilter)?.label}
              </span>
            </>
          )}
          <span className="text-text-light">|</span>
          <span className="text-text-muted">{filteredHouses.length} ครัวเรือน</span>
          {zoomLevel > 14.5 && (
            <button
              onClick={() => { mapRef.current?.easeTo({ center: [101.220, 19.533], zoom: 13.5, duration: 600 }); }}
              className="relative group ml-1 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <ZoomOut size={12} className="text-text-muted" />
              <span className="absolute top-full mt-1.5 px-2 py-0.5 rounded bg-gray-900 text-white text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">ซูมออก</span>
            </button>
          )}
        </div>

        {/* Map style — right */}
        <div className="pointer-events-auto relative">
          <button
            onClick={() => { setShowStylePicker(!showStylePicker); setShowSearch(false); }}
            className="relative group w-10 h-10 rounded-xl bg-white/95 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors text-text-muted"
          >
            <Layers size={18} />
            <span className="absolute top-full mt-1.5 px-2 py-0.5 rounded bg-gray-900 text-white text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">{MAP_STYLES[mapStyle].name}</span>
          </button>
          {showStylePicker && (
            <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-lg border border-gray-100 p-1.5 min-w-[140px] z-30">
              {Object.entries(MAP_STYLES).map(([key, s]) => {
                const isActive = mapStyle === key;
                const icons: Record<string, typeof Sun> = { light: Sun, satellite: Globe, street: MapIcon, topo: Mountain };
                const Icon = icons[key] || MapIcon;
                return (
                  <button
                    key={key}
                    onClick={() => { setMapStyle(key); setShowStylePicker(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive ? "bg-royal-blue text-white" : "text-text hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{s.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Reset zoom */}
        <button
          onClick={() => { mapRef.current?.easeTo({ center: [101.220, 19.533], zoom: 13.5, duration: 600 }); }}
          className="pointer-events-auto relative group w-10 h-10 rounded-xl bg-white/95 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors text-text-muted"
        >
          <ZoomOut size={18} />
          <span className="absolute top-full mt-1.5 px-2 py-0.5 rounded bg-gray-900 text-white text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">รีเซ็ตแผนที่</span>
        </button>
      </div>

      {/* ══════ LEFT PANEL — Dashboard widgets ══════ */}
      <div ref={leftScroll.ref} className={`absolute top-20 left-3 bottom-14 z-10 w-[380px] flex-col gap-3 overflow-y-auto no-scrollbar ${leftScroll.shadowClass} hidden lg:flex`}>
        {/* Title + filters + KPIs */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-5 flex-shrink-0 cursor-pointer hover:shadow-xl hover:ring-1 hover:ring-royal-blue/20 active:scale-[0.98] transition-all" onClick={() => setExpandedWidget("overview")}>
          <div className="flex items-start justify-between mb-1">
            <p className="text-sm text-text-muted uppercase tracking-wider">ความครอบคลุมการดูแลสุขภาพ</p>
            <button onClick={() => setExpandedWidget("overview")} className="relative group w-6 h-6 rounded-md hover:bg-gray-100 flex items-center justify-center text-text-light hover:text-royal-blue transition-colors flex-shrink-0" title="ดูรายละเอียด">
              <Maximize2 size={12} />
              <span className="absolute bottom-full mb-1.5 px-2 py-0.5 rounded bg-gray-900 text-white text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">ดูเพิ่มเติม</span>
            </button>
          </div>
          <h2 className="text-2xl font-bold text-text mb-3">สุขภาพระดับหมู่บ้าน</h2>

          <div className="flex gap-1.5 mb-4" onClick={(e) => e.stopPropagation()}>
            {(["all", "moo11", "moo12"] as const).map((key) => (
              <button key={key} onClick={() => setActiveFilter(key)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${activeFilter === key ? "bg-royal-blue text-white border-royal-blue" : "bg-white text-text-muted border-gray-200"}`}>
                {key === "all" ? "ทุกหมู่" : key === "moo11" ? "หมู่ 11" : "หมู่ 12"}
              </button>
            ))}
          </div>

          {/* KPI grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <Users size={14} className="text-royal-blue mb-1" />
              <p className="text-lg font-bold text-text"><AnimatedNumber value={totalPop} /></p>
              <p className="text-sm text-text-muted">ประชากร</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <Home size={14} className="text-royal-blue mb-1" />
              <p className="text-lg font-bold text-text"><AnimatedNumber value={totalHouses} /></p>
              <p className="text-sm text-text-muted">ครัวเรือน</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <UserRound size={14} className="text-[#6EC3C3] mb-1" />
              <p className="text-lg font-bold text-text"><AnimatedNumber value={totalElderly} /></p>
              <p className="text-sm text-text-muted">ผู้สูงอายุ</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <HeartPulse size={14} className="text-red-500 mb-1" />
              <p className="text-lg font-bold text-text"><AnimatedNumber value={totalNCD} /></p>
              <p className="text-sm text-text-muted">ผู้ป่วย NCD</p>
            </div>
          </div>

          {/* Coverage progress */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-text-muted">อัตราคัดกรอง NCD</span>
              <span className="text-sm font-bold text-royal-blue">87%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#1C85AD] to-[#6EC3C3]" style={{ width: "87%" }} />
            </div>
          </div>
        </div>

        {/* สรุปสถานะแบ่งตามหมู่ */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-5 flex-shrink-0 cursor-pointer hover:shadow-xl hover:ring-1 hover:ring-royal-blue/20 active:scale-[0.98] transition-all" onClick={() => setExpandedWidget("village-status")}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-text">สรุปสถานะตามหมู่</p>
            <button onClick={() => setExpandedWidget("village-status")} className="relative group w-6 h-6 rounded-md hover:bg-gray-100 flex items-center justify-center text-text-light hover:text-royal-blue transition-colors" title="ดูรายละเอียด">
              <Maximize2 size={12} />
              <span className="absolute bottom-full mb-1.5 px-2 py-0.5 rounded bg-gray-900 text-white text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">ดูเพิ่มเติม</span>
            </button>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-500" /><span className="text-xs text-text-muted">เสี่ยงสูง</span></div>
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /><span className="text-xs text-text-muted">ปานกลาง</span></div>
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-500" /><span className="text-xs text-text-muted">ต่ำ</span></div>
          </div>
          {/* Compare bars */}
          {(() => {
            const rows = villages.map((v) => {
              const vHouses = houses.filter((h) => h.moo === v.moo);
              return {
                label: `หมู่ ${v.moo}`,
                name: v.name,
                total: vHouses.length,
                high: vHouses.filter((h) => h.riskLevel === "high").length,
                medium: vHouses.filter((h) => h.riskLevel === "medium").length,
                low: vHouses.filter((h) => h.riskLevel === "low").length,
              };
            });
            const maxTotal = Math.max(...rows.map((r) => r.total));
            return (
              <div className="space-y-2.5">
                {rows.map((r) => (
                  <div key={r.label} className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-text w-[42px] flex-shrink-0">{r.label}</span>
                    <div className="flex-1 h-6 flex" style={{ maxWidth: `${(r.total / maxTotal) * 100}%` }}>
                      {r.high > 0 && (
                        <div className="h-full bg-red-500 relative group/seg first:rounded-l last:rounded-r cursor-default" style={{ width: `${(r.high / r.total) * 100}%` }}>
                          <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-gray-900 text-white text-xs whitespace-nowrap opacity-0 group-hover/seg:opacity-100 pointer-events-none transition-opacity shadow-lg z-50">
                            {r.label} {r.name} — เสี่ยงสูง {r.high} หลัง ({((r.high / r.total) * 100).toFixed(0)}%)
                          </span>
                        </div>
                      )}
                      {r.medium > 0 && (
                        <div className="h-full bg-amber-400 relative group/seg cursor-default" style={{ width: `${(r.medium / r.total) * 100}%` }}>
                          <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-gray-900 text-white text-xs whitespace-nowrap opacity-0 group-hover/seg:opacity-100 pointer-events-none transition-opacity shadow-lg z-50">
                            {r.label} {r.name} — ปานกลาง {r.medium} หลัง ({((r.medium / r.total) * 100).toFixed(0)}%)
                          </span>
                        </div>
                      )}
                      {r.low > 0 && (
                        <div className="h-full bg-green-500 relative group/seg last:rounded-r cursor-default" style={{ width: `${(r.low / r.total) * 100}%` }}>
                          <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-gray-900 text-white text-xs whitespace-nowrap opacity-0 group-hover/seg:opacity-100 pointer-events-none transition-opacity shadow-lg z-50">
                            {r.label} {r.name} — ต่ำ {r.low} หลัง ({((r.low / r.total) * 100).toFixed(0)}%)
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-bold text-text w-[28px] text-right flex-shrink-0">{r.total}</span>
                  </div>
                ))}
              </div>
            );
          })()}
          {/* Total */}
          <div className="border-t border-gray-200 pt-2 mt-3 flex items-center justify-between">
            <span className="text-xs font-bold text-text">รวม {houses.length} หลัง / {persons.length.toLocaleString()} ราย</span>
          </div>
        </div>

        {/* NCD Breakdown */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-4 flex-shrink-0 cursor-pointer hover:shadow-xl hover:ring-1 hover:ring-royal-blue/20 active:scale-[0.98] transition-all" onClick={() => setExpandedWidget("ncd")}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-text-muted uppercase tracking-wider">โรคเรื้อรัง NCD</p>
            <button onClick={() => setExpandedWidget("ncd")} className="relative group w-6 h-6 rounded-md hover:bg-gray-100 flex items-center justify-center text-text-light hover:text-royal-blue transition-colors" title="ดูรายละเอียด">
              <Maximize2 size={12} />
              <span className="absolute bottom-full mb-1.5 px-2 py-0.5 rounded bg-gray-900 text-white text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">ดูเพิ่มเติม</span>
            </button>
          </div>
          <div className="space-y-2">
            {ncdStats.map((ncd) => {
              const val = activeFilter === "moo11" ? ncd.moo11 : activeFilter === "moo12" ? ncd.moo12 : ncd.total;
              return (
                <div key={ncd.diseaseEn}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-sm text-text">{ncd.disease}</span>
                    <span className="text-sm font-bold text-text"><AnimatedNumber value={val} duration={600} /></span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(val / 200) * 100}%`, backgroundColor: ncd.diseaseEn === "HT" ? "#1C85AD" : ncd.diseaseEn === "DM" ? "#6EC3C3" : ncd.diseaseEn === "CKD" ? "#F59E0B" : ncd.diseaseEn === "Stroke" ? "#DC2626" : ncd.diseaseEn === "Heart" ? "#EC4899" : "#8B5CF6" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk + Gender + Age */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-4 flex-shrink-0 cursor-pointer hover:shadow-xl hover:ring-1 hover:ring-royal-blue/20 active:scale-[0.98] transition-all" onClick={() => setExpandedWidget("demographics")}>
          {/* Risk */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted uppercase tracking-wider">ความเสี่ยงครัวเรือน</p>
            <button onClick={() => setExpandedWidget("demographics")} className="relative group w-6 h-6 rounded-md hover:bg-gray-100 flex items-center justify-center text-text-light hover:text-royal-blue transition-colors" title="ดูรายละเอียด">
              <Maximize2 size={12} />
              <span className="absolute bottom-full mb-1.5 px-2 py-0.5 rounded bg-gray-900 text-white text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">ดูเพิ่มเติม</span>
            </button>
          </div>
          <div className="flex gap-2 mb-4">
            {([
              { label: "สูง", count: filteredHouses.filter((h) => h.riskLevel === "high").length, color: "#DC2626", bg: "#FEE2E2" },
              { label: "กลาง", count: filteredHouses.filter((h) => h.riskLevel === "medium").length, color: "#D97706", bg: "#FEF3C7" },
              { label: "ต่ำ", count: filteredHouses.filter((h) => h.riskLevel === "low").length, color: "#16A34A", bg: "#DCFCE7" },
            ]).map((r) => (
              <div key={r.label} className="flex-1 rounded-lg p-2 text-center" style={{ backgroundColor: r.bg }}>
                <p className="text-lg font-bold" style={{ color: r.color }}><AnimatedNumber value={r.count} /></p>
                <p className="text-sm" style={{ color: r.color }}>{r.label}</p>
              </div>
            ))}
          </div>

          {/* Gender */}
          <p className="text-sm text-text-muted uppercase tracking-wider mb-2">เพศ</p>
          {(() => {
            const filteredPersons = activeFilter === "moo11" ? persons.filter((p) => p.moo === 11) : activeFilter === "moo12" ? persons.filter((p) => p.moo === 12) : persons;
            const male = filteredPersons.filter((p) => p.gender === "male").length;
            const female = filteredPersons.length - male;
            const malePctVal = filteredPersons.length > 0 ? ((male / filteredPersons.length) * 100).toFixed(0) : "0";
            return (
              <div className="flex gap-2 mb-4">
                <div className="flex-1 bg-blue-50 rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-blue-600"><AnimatedNumber value={male} /></p>
                  <p className="text-sm text-blue-500">ชาย ({malePctVal}%)</p>
                </div>
                <div className="flex-1 bg-pink-50 rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-pink-600"><AnimatedNumber value={female} /></p>
                  <p className="text-sm text-pink-500">หญิง ({(100 - Number(malePctVal))}%)</p>
                </div>
              </div>
            );
          })()}

          {/* Age */}
          <p className="text-sm text-text-muted uppercase tracking-wider mb-2">ช่วงอายุ</p>
          <div className="space-y-1.5">
            <div>
              <div className="flex justify-between mb-0.5">
                <span className="text-sm text-text">วัยทำงาน (25-59)</span>
                <span className="text-sm font-bold text-text">{(totalPop - totalElderly).toLocaleString()}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-[#1C85AD]" style={{ width: `${((totalPop - totalElderly) / totalPop) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-0.5">
                <span className="text-sm text-text">ผู้สูงอายุ (60+)</span>
                <span className="text-sm font-bold text-text">{totalElderly.toLocaleString()}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-[#6EC3C3]" style={{ width: `${(totalElderly / totalPop) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Health Coverage */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-4 flex-shrink-0 cursor-pointer hover:shadow-xl hover:ring-1 hover:ring-royal-blue/20 active:scale-[0.98] transition-all" onClick={() => setExpandedWidget("coverage")}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-text-muted uppercase tracking-wider">สิทธิการรักษา</p>
            <button onClick={() => setExpandedWidget("coverage")} className="relative group w-6 h-6 rounded-md hover:bg-gray-100 flex items-center justify-center text-text-light hover:text-royal-blue transition-colors" title="ดูรายละเอียด">
              <Maximize2 size={12} />
              <span className="absolute bottom-full mb-1.5 px-2 py-0.5 rounded bg-gray-900 text-white text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">ดูเพิ่มเติม</span>
            </button>
          </div>
          <div className="space-y-2">
            {healthCoverageData.map((item, i) => (
              <div key={item.name}>
                <div className="flex justify-between mb-0.5">
                  <span className="text-sm text-text">{item.name}</span>
                  <span className="text-sm font-bold text-text">{item.percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${item.percentage}%`, backgroundColor: ["#1C85AD", "#6EC3C3", "#F59E0B", "#94A3B8"][i] }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════ RIGHT PANEL — Summary insight + list (hidden when house selected) ══════ */}
      {!selectedHouse && (
      <div ref={rightScroll.ref} className={`absolute top-20 right-3 bottom-14 z-10 w-[400px] flex-col gap-3 overflow-y-auto no-scrollbar ${rightScroll.shadowClass} hidden lg:flex`}>

        {/* ── Vaccine Mode: Right Panel ── */}
        {activeFilter === "vaccine" ? (
        <>
          {/* Vaccine summary card — click to open modal */}
          {(() => {
            const relevantDefs = vaccineGroup === "all" ? VACCINE_DEFS : VACCINE_DEFS.filter((d) => d.group === vaccineGroup);
            const personsWithAnyVax = vaccineGroup === "all"
              ? persons.filter((p) => p.vaccinations.length > 0).length
              : persons.filter((p) => p.vaccinations.some((v) => v.group === vaccineGroup)).length;
            const totalEligible = relevantDefs.reduce((sum, vd) => sum + persons.filter((p) => p.age >= vd.ageMin && p.age <= vd.ageMax && (!vd.gender || p.gender === vd.gender)).length, 0);
            const totalVaccinated = relevantDefs.reduce((sum, vd) => sum + persons.filter((p) => p.vaccinations.some((v) => v.vaccineCode === vd.code)).length, 0);
            const coveragePct = totalEligible > 0 ? ((totalVaccinated / totalEligible) * 100).toFixed(1) : "0";

            return (
          <div
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-5 flex-shrink-0 cursor-pointer hover:shadow-xl hover:ring-1 hover:ring-sky-200 active:scale-[0.98] transition-all overflow-visible"
            onClick={() => setExpandedWidget("vaccine")}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Syringe size={20} className="text-sky-500" />
                <p className="text-base font-bold text-text">ความครอบคลุมวัคซีน</p>
              </div>
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-text-muted">
                <Maximize2 size={13} />
              </div>
            </div>

            {/* Group pills */}
            <div className="flex flex-wrap gap-1.5 mb-4" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setVaccineGroup("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${vaccineGroup === "all" ? "bg-sky-500 text-white border-sky-500" : "bg-white text-text-muted border-gray-200"}`}
              >ทั้งหมด</button>
              {(Object.entries(VACCINE_GROUP_LABELS) as [VaccineGroup, { name: string; color: string }][]).map(([key, { name, color }]) => (
                <button
                  key={key}
                  onClick={() => setVaccineGroup(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${vaccineGroup === key ? "text-white border-transparent" : "bg-white text-text-muted border-gray-200"}`}
                  style={vaccineGroup === key ? { backgroundColor: color, borderColor: color } : {}}
                >
                  {name}
                </button>
              ))}
            </div>

            {/* KPIs — always visible */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-sky-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-sky-600">{personsWithAnyVax}</p>
                <p className="text-xs text-sky-400">ได้รับวัคซีน</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-text">{persons.length}</p>
                <p className="text-xs text-text-muted">ประชากร</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-green-600">{coveragePct}%</p>
                <p className="text-xs text-green-400">ครอบคลุม</p>
              </div>
            </div>

            {/* Moo comparison — always visible */}
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">แยกตามหมู่</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {villages.map((v) => {
                const mooPers = persons.filter((p) => p.moo === v.moo);
                const mooVax = mooPers.filter((p) => {
                  if (vaccineGroup === "all") return p.vaccinations.length > 0;
                  return p.vaccinations.some((vx) => vx.group === vaccineGroup);
                }).length;
                const mooPct = mooPers.length > 0 ? ((mooVax / mooPers.length) * 100).toFixed(0) : "0";
                const mooHouses = houses.filter((h) => h.moo === v.moo).length;
                return (
                  <div key={v.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-text">หมู่ {v.moo}</span>
                      <span className="text-sm font-bold text-sky-600">{mooPct}%</span>
                    </div>
                    <p className="text-xs text-text-muted mb-2">{v.name} · {mooHouses} ครัวเรือน</p>
                    <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden mb-1.5">
                      <div className="h-full rounded-full bg-sky-500 transition-all duration-500" style={{ width: `${mooPct}%` }} />
                    </div>
                    <p className="text-xs text-text-muted">ได้รับวัคซีน {mooVax} จาก {mooPers.length} คน</p>
                  </div>
                );
              })}
            </div>

            {/* Group segment bar + legend — always visible */}
            {(() => {
              const groupCounts = (Object.entries(VACCINE_GROUP_LABELS) as [VaccineGroup, { name: string; color: string }][]).map(([key, { name, color }]) => ({
                key, name, color,
                count: persons.filter((p) => p.vaccinations.some((v) => v.group === key)).length,
              }));
              const totalVax = groupCounts.reduce((s, g) => s + g.count, 0) || 1;
              return (
                <>
                  <div className="flex h-3 rounded-full mb-2">
                    {groupCounts.map((g, i) => (
                      <div key={g.key} className={`h-full relative group/seg cursor-default ${i === 0 ? "rounded-l-full" : ""} ${i === groupCounts.length - 1 ? "rounded-r-full" : ""}`} style={{ width: `${(g.count / totalVax) * 100}%`, backgroundColor: g.color }}>
                        <span className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-gray-900 text-white text-xs whitespace-nowrap opacity-0 group-hover/seg:opacity-100 pointer-events-none transition-opacity shadow-lg z-50">
                          {g.name} — {g.count} คน ({((g.count / totalVax) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {groupCounts.map((g) => (
                      <span key={g.key} className="flex items-center gap-1 text-xs text-text-muted">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: g.color }} />
                        {g.name} {g.count}
                      </span>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
            );
          })()}
        </>
        ) : activeFilter === "outbreak" ? (
        <>
          {/* Outbreak Summary Card — individual-focused */}
          {(() => {
            const DISEASE_COLORS: Record<string, { bg: string; dot: string }> = {
              "ไข้หวัดใหญ่ (Influenza)": { bg: "rgba(59,130,246,0.15)", dot: "#3B82F6" },
              "อุจจาระร่วง/อาหารเป็นพิษ (Diarrhea)": { bg: "rgba(245,158,11,0.15)", dot: "#F59E0B" },
              "ไข้เลือดออก (Dengue)": { bg: "rgba(220,38,38,0.15)", dot: "#DC2626" },
              "ปอดอักเสบ (Pneumonia)": { bg: "rgba(16,185,129,0.15)", dot: "#10B981" },
              "สครับไทฟัส (Scrub Typhus)": { bg: "rgba(236,72,153,0.15)", dot: "#EC4899" },
            };
            const diseaseMap = new Map<string, number>();
            outbreakCases.forEach((c) => diseaseMap.set(c.disease, (diseaseMap.get(c.disease) || 0) + 1));
            const sorted = Array.from(diseaseMap.entries()).sort((a, b) => b[1] - a[1]);
            const totalCases = outbreakCases.length;
            const confirmed = outbreakCases.filter((c) => c.status === "confirmed").length;
            const suspected = outbreakCases.filter((c) => c.status === "suspected").length;
            const recovered = outbreakCases.filter((c) => c.status === "recovered").length;
            const maxDisease = sorted.length > 0 ? sorted[0][1] : 1;

            // Individual-level stats
            const affectedPersons = outbreakCases.map((c) => persons.find((p) => p.id === c.personId)).filter(Boolean);
            const elderlyCount = affectedPersons.filter((p) => p!.isElderly).length;
            const ncdCount = affectedPersons.filter((p) => p!.chronicDiseases.length > 0).length;
            const childCount = affectedPersons.filter((p) => p!.age < 5).length;
            const noFluVaccine = affectedPersons.filter((p) => !p!.vaccinations.some((v) => v.vaccineNameEn === "Influenza" && v.date >= "2025-06-01")).length;

            // Daily trend (last 14 days)
            const dailyMap = new Map<string, number>();
            for (let i = 0; i < 14; i++) {
              const d = new Date(2026, 2, 26 - 13 + i);
              dailyMap.set(d.toISOString().split("T")[0], 0);
            }
            outbreakCases.forEach((c) => { if (dailyMap.has(c.reportDate)) dailyMap.set(c.reportDate, (dailyMap.get(c.reportDate) || 0) + 1); });
            const dailyData = Array.from(dailyMap.entries());
            const maxDaily = Math.max(...dailyData.map((d) => d[1]), 1);

            return (
          <div
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-5 flex-shrink-0 cursor-pointer hover:shadow-xl hover:ring-1 hover:ring-purple-200 active:scale-[0.98] transition-all"
            onClick={() => setExpandedWidget("outbreak")}
          >
            {/* Header with toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bug size={20} className="text-purple-500" />
                <p className="text-base font-bold text-text">เฝ้าระวังโรคระบาด</p>
              </div>
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-text-muted">
                <Maximize2 size={13} />
              </div>
            </div>

            {/* KPI row — always visible */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-text">{totalCases}</p>
                <p className="text-xs text-text-muted">ผู้ป่วย</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{confirmed}</p>
                <p className="text-xs text-red-400">ยืนยัน</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-text">{outbreakHouseIds.size}</p>
                <p className="text-xs text-text-muted">ครัวเรือน</p>
              </div>
            </div>

            {/* Status bar — always visible */}
            <div className="flex h-3 rounded-full overflow-hidden mb-1.5 bg-gray-100">
              <div className="h-full bg-red-500" style={{ width: `${(confirmed / totalCases) * 100}%` }} />
              <div className="h-full bg-amber-400" style={{ width: `${(suspected / totalCases) * 100}%` }} />
              <div className="h-full bg-green-500" style={{ width: `${(recovered / totalCases) * 100}%` }} />
            </div>
            <div className="flex justify-between text-xs mb-4">
              <span className="text-red-500 font-medium">ยืนยันแล้ว {confirmed}</span>
              <span className="text-amber-500 font-medium">สงสัย {suspected}</span>
              <span className="text-green-500 font-medium">หายแล้ว {recovered}</span>
            </div>

            {/* Disease dots — always visible (compact) */}
            <div className="flex flex-wrap gap-1.5">
              {sorted.map(([disease, count]) => {
                const color = DISEASE_COLORS[disease] || { bg: "rgba(0,0,0,0.05)", dot: "#6B7280" };
                return (
                  <span key={disease} className="flex items-center gap-1 text-xs px-2 py-1 rounded-full" style={{ backgroundColor: color.bg }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color.dot }} />
                    {disease.split("(")[0].trim()} {count}
                  </span>
                );
              })}
            </div>

          </div>
            );
          })()}

          {/* Outbreak Case List */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-4 flex-1 flex flex-col min-h-0">
            <p className="text-sm font-semibold text-text mb-3 flex-shrink-0">รายงานผู้ป่วย ({outbreakCases.length} ราย)</p>
            <div className="space-y-2 overflow-y-auto no-scrollbar flex-1">
              {outbreakCases
                .sort((a, b) => b.reportDate.localeCompare(a.reportDate))
                .map((c, i) => {
                  const person = persons.find((p) => p.id === c.personId);
                  const house = houses.find((h) => h.id === c.houseId);
                  const statusColor = c.status === "confirmed" ? "bg-red-50 text-red-600" : c.status === "suspected" ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600";
                  const statusLabel = c.status === "confirmed" ? "ยืนยันแล้ว" : c.status === "suspected" ? "สงสัย" : "หายแล้ว";
                  const diseaseColorMap: Record<string, string> = {
                    "ไข้หวัดใหญ่ (Influenza)": "#3B82F6",
                    "อุจจาระร่วง/อาหารเป็นพิษ (Diarrhea)": "#F59E0B",
                    "ไข้เลือดออก (Dengue)": "#DC2626",
                    "ปอดอักเสบ (Pneumonia)": "#10B981",
                    "สครับไทฟัส (Scrub Typhus)": "#EC4899",
                  };
                  const dotColor = diseaseColorMap[c.disease] || "#9333EA";
                  return (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                      style={{ borderLeft: `3px solid ${dotColor}` }}
                      onClick={() => { if (house) { setSelectedHouse(house); setMobilePanel(null); } }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-text-muted">{c.reportDate}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>{statusLabel}</span>
                      </div>
                      {person && (
                        <p className="text-sm font-medium text-text">{person.prefix}{person.firstName} {person.lastName}</p>
                      )}
                      <p className="text-xs font-medium mt-0.5 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dotColor }} />
                        <span style={{ color: dotColor }}>{c.disease}</span>
                      </p>
                      {house && (
                        <p className="text-xs text-text-muted mt-0.5">บ้านเลขที่ {house.houseCode} · หมู่ {house.moo}</p>
                      )}
                      {person && (
                        <div className="flex gap-1.5 mt-1.5">
                          {person.isElderly && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">ผู้สูงอายุ</span>}
                          {person.chronicDiseases.length > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-600">NCD {person.chronicDiseases.length} โรค</span>}
                          {!person.vaccinations.some((v) => v.vaccineNameEn === "Influenza" && v.date >= "2025-06-01") && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600">ไม่มีวัคซีนไข้หวัดใหญ่</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </>
        ) : (
        <>
        {/* AI Summary — moved from left panel */}
        <div
          className="bg-gradient-to-br from-[#1C85AD] to-[#6EC3C3] rounded-2xl shadow-lg p-4 text-white flex-shrink-0 cursor-pointer select-none active:scale-[0.99] transition-transform"
          onClick={() => setAiExpanded(!aiExpanded)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-white/80" />
              <p className="text-sm font-semibold text-white/80">การวิเคราะห์จาก AI</p>
            </div>
            <ChevronDownIcon
              size={16}
              className="text-white/60"
              style={{ transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)", transform: aiExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </div>

          <p className="text-sm leading-relaxed text-white/90 line-clamp-3">
            {generateAISummary()}
          </p>

          <div className="grid" style={{ gridTemplateRows: aiExpanded ? "1fr" : "0fr", transition: "grid-template-rows 0.35s cubic-bezier(0.4,0,0.2,1)" }}>
            <div className="overflow-hidden">
              <p className="text-sm leading-relaxed text-white/90 pt-0.5">
                {generateAISummary()}
              </p>
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/20 text-white/80 text-sm">
                <span>สร้างจากข้อมูล HDC API</span>
                <span>25 มี.ค. 2569, 09:10</span>
              </div>
            </div>
          </div>

          <div className="grid" style={{ gridTemplateRows: aiExpanded ? "0fr" : "1fr", transition: "grid-template-rows 0.3s cubic-bezier(0.4,0,0.2,1)" }}>
            <div className="overflow-hidden">
              <p className="text-sm text-white/50 mt-1.5">แตะเพื่ออ่านเพิ่มเติม</p>
            </div>
          </div>
        </div>

        {/* NCD Type list (scrollable, expandable detail) */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-4 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <p className="text-sm font-semibold text-text">รายชื่อกลุ่มโรค</p>
            <button onClick={() => setExpandedWidget("ncd")} className="relative group w-6 h-6 rounded-md hover:bg-gray-100 flex items-center justify-center text-text-light hover:text-royal-blue transition-colors" title="ดูรายละเอียด">
              <Maximize2 size={12} />
              <span className="absolute bottom-full mb-1.5 px-2 py-0.5 rounded bg-gray-900 text-white text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">ดูเพิ่มเติม</span>
            </button>
          </div>
          <div className="space-y-2 overflow-y-auto no-scrollbar flex-1">
            {ncdStats.map((ncd) => {
              const isOpen = selectedNCD === ncd.diseaseEn;
              const ncdColor = ncd.diseaseEn === "HT" ? "#1C85AD" : ncd.diseaseEn === "DM" ? "#16A34A" : ncd.diseaseEn === "CKD" ? "#D97706" : "#DC2626";
              const ncdBg = ncd.diseaseEn === "HT" ? "#E0F2FE" : ncd.diseaseEn === "DM" ? "#D1FAE5" : ncd.diseaseEn === "CKD" ? "#FEF3C7" : ncd.diseaseEn === "Stroke" ? "#FEE2E2" : ncd.diseaseEn === "Heart" ? "#FCE7F3" : "#EDE9FE";
              const patientsWithDisease = persons.filter((p) => p.chronicDiseases.some((d) => d.code === ncd.diseaseEn));
              return (
                <div key={ncd.diseaseEn}>
                  {/* Row */}
                  <button
                    onClick={() => setSelectedNCD(isOpen ? null : ncd.diseaseEn)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${isOpen ? "bg-royal-blue/5 ring-1 ring-royal-blue/20" : "bg-gray-50 hover:bg-gray-100"}`}
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: ncdBg }}>
                      <HeartPulse size={16} style={{ color: ncdColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text">{ncd.disease}</p>
                      <p className="text-sm text-text-muted">{ncd.diseaseEn}</p>
                    </div>
                    <span className="text-sm font-bold text-text">{ncd.total} <span className="text-sm font-normal text-text-muted">ราย</span></span>
                    <ChevronRight size={14} className={`text-text-light transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  </button>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="mt-1 ml-2 mr-1 p-3 rounded-xl bg-white border border-gray-100 shadow-sm space-y-3">
                      {/* Moo breakdown */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-royal-blue/5 rounded-lg p-2 text-center">
                          <p className="text-lg font-bold text-royal-blue">{ncd.moo11}</p>
                          <p className="text-sm text-text-muted">หมู่ 11</p>
                        </div>
                        <div className="rounded-lg p-2 text-center" style={{ backgroundColor: "#6EC3C310" }}>
                          <p className="text-lg font-bold" style={{ color: "#4FAAAA" }}>{ncd.moo12}</p>
                          <p className="text-sm text-text-muted">หมู่ 12</p>
                        </div>
                      </div>

                      {/* Percentage bar */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-text-muted">สัดส่วนต่อประชากร</span>
                          <span className="text-sm font-bold" style={{ color: ncdColor }}>{((ncd.total / totalPop) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(ncd.total / totalPop) * 100}%`, backgroundColor: ncdColor }} />
                        </div>
                      </div>

                      {/* Patient list */}
                      <div>
                        <p className="text-sm font-semibold text-text mb-2">ผู้ป่วย ({patientsWithDisease.length} ราย)</p>
                        <div className="space-y-1 max-h-[160px] overflow-y-auto no-scrollbar">
                          {patientsWithDisease.slice(0, 20).map((p) => (
                            <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 text-sm">
                              <div className="w-6 h-6 rounded-full bg-royal-blue/10 flex items-center justify-center text-sm font-bold text-royal-blue flex-shrink-0">
                                {p.firstName[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-text truncate">{p.prefix}{p.firstName} {p.lastName}</p>
                                <p className="text-text-muted">อายุ {p.age} | ม.{p.moo}</p>
                              </div>
                              {p.chronicDiseases.filter((d) => d.code !== ncd.diseaseEn).map((d) => (
                                <span key={d.code} className="text-sm px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 font-medium flex-shrink-0">{d.code}</span>
                              ))}
                            </div>
                          ))}
                          {patientsWithDisease.length > 20 && (
                            <p className="text-sm text-text-muted text-center py-1">และอีก {patientsWithDisease.length - 20} ราย...</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        </>
        )}
      </div>
      )}

      {/* ══════ HEALTH FILTERS — top, right of left panel (desktop only) ══════ */}
      <div className="absolute top-[76px] left-[400px] z-10 hidden lg:block">
        <div className="flex gap-1.5">
          {HEALTH_FILTERS.map((f) => {
            const isActive = activeFilter === f.key;
            const isViewMode = activeFilter === "outbreak" || activeFilter === "vaccine";
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(isActive ? "all" : f.key)}
                className={`relative group flex items-center gap-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shadow-sm border h-10 ${
                  isActive && !isViewMode
                    ? "pl-3 pr-3.5 text-white border-transparent"
                    : "px-3 bg-white/95 backdrop-blur-sm text-text-muted border-gray-200/80 hover:shadow-md"
                }`}
                style={isActive && !isViewMode ? { backgroundColor: f.color, borderColor: f.color } : {}}
              >
                <f.Icon size={14} />
                {isActive && !isViewMode && <span>{f.label}</span>}
                {(!isActive || isViewMode) && (
                  <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-gray-900 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg">{f.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════ VIEW MODE FILTERS — top right (desktop only) ══════ */}
      <div className="absolute top-[76px] right-[420px] z-10 hidden lg:block">
        <div className="flex gap-1.5">
          {VIEW_FILTERS.map((f) => {
            const isActive = activeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(isActive ? "all" : f.key)}
                className={`relative group flex items-center gap-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shadow-sm border h-10 ${
                  isActive
                    ? "pl-3 pr-3.5 text-white border-transparent"
                    : "px-3 bg-white/95 backdrop-blur-sm text-text-muted border-gray-200/80 hover:shadow-md"
                }`}
                style={isActive ? { backgroundColor: f.color, borderColor: f.color } : {}}
              >
                <f.Icon size={14} />
                {isActive && <span>{f.label}</span>}
                {!isActive && (
                  <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-gray-900 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg">{f.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════ MOBILE: Google Maps–style layout ══════ */}

      {/* Mobile search bar — full width at top */}
      <div className="absolute top-3 left-3 right-3 z-20 lg:hidden">
        <div className="bg-white rounded-2xl shadow-lg px-4 py-2.5 flex items-center gap-3">
          <Search size={18} className="text-text-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, บ้านเลขที่, HN..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none text-text placeholder:text-text-light"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(""); setSearchResults([]); }} className="text-text-light">
              <X size={16} />
            </button>
          )}
          <button onClick={() => { mapRef.current?.easeTo({ center: [101.220, 19.533], zoom: 13.5, duration: 600 }); }} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-text-muted">
            <ZoomOut size={16} />
          </button>
        </div>
        {/* Mobile search results */}
        {searchResults.length > 0 && (
          <div className="mt-2 bg-white rounded-xl shadow-lg border border-gray-100 max-h-[300px] overflow-y-auto">
            {searchResults.map((r, i) => (
              <button
                key={`m-${r.house.id}-${i}`}
                onClick={() => { zoomToHouse(r.house); setSearchQuery(""); setSearchResults([]); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: r.type === "person" ? "#E0F2FE" : "#F0FDF4" }}>
                  {r.type === "person" ? <UserRound size={14} className="text-royal-blue" /> : <Home size={14} className="text-green-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  {r.type === "person" ? (
                    <>
                      <p className="text-sm font-medium text-text truncate">{r.personName}</p>
                      <p className="text-xs text-text-muted">บ้านเลขที่ {r.house.houseCode} หมู่ {r.house.moo}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-text">บ้านเลขที่ {r.house.houseCode}</p>
                      <p className="text-xs text-text-muted">{r.house.address}</p>
                    </>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile filter pills — horizontal scroll below search */}
      <div className="absolute top-16 left-0 right-0 z-10 lg:hidden">
        <div className="flex gap-2 px-3 overflow-x-auto no-scrollbar pb-1">
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => { setActiveFilter(isActive ? "all" : f.key); setMobilePanel(null); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap shadow-sm border transition-all ${
                  isActive ? "text-white border-transparent shadow-md" : "bg-white text-text-muted border-gray-200"
                }`}
                style={isActive ? { backgroundColor: f.color } : {}}
              >
                <f.Icon size={13} />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile bottom sheet */}
      <div className="absolute left-0 right-0 bottom-0 z-20 lg:hidden transition-all duration-300">
        {/* Handle + summary */}
        <div className="bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>
          <div className="flex items-center gap-3 px-4 pb-3">
            <div className="flex-1">
              <p className="text-sm font-bold text-text">ต.ขุนน่าน</p>
              <p className="text-xs text-text-muted">{filteredHouses.length} ครัวเรือน · {persons.length.toLocaleString()} คน</p>
            </div>
            <button
              onClick={() => setMobilePanel(mobilePanel ? null : "left")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${mobilePanel ? "bg-gray-200 text-text" : "bg-royal-blue text-white"}`}
            >
              {mobilePanel ? "ปิด" : "ดูข้อมูล"}
            </button>
          </div>
        </div>

        {/* Expanded: horizontal scrollable cards */}
        {mobilePanel && (
          <div className="bg-gray-50 px-4 pb-4 max-h-[55vh] overflow-y-auto no-scrollbar">
            {/* Card row — horizontal scroll */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-3 -mx-4 px-4">
              {/* KPI Card */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 min-w-[280px] flex-shrink-0">
                <p className="text-xs font-semibold text-text-muted mb-3">ภาพรวม</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "ครัวเรือน", value: filteredHouses.length, color: "#1C85AD" },
                    { label: "ประชากร", value: persons.length, color: "#0D9488" },
                    { label: "ผู้สูงอายุ", value: persons.filter((p) => p.isElderly).length, color: "#F59E0B" },
                    { label: "NCD", value: persons.filter((p) => p.chronicDiseases.length > 0).length, color: "#DC2626" },
                  ].map((k) => (
                    <div key={k.label} className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold" style={{ color: k.color }}>{k.value.toLocaleString()}</p>
                      <p className="text-[10px] text-text-muted">{k.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Card */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 min-w-[240px] flex-shrink-0">
                <p className="text-xs font-semibold text-text-muted mb-3">ความเสี่ยง</p>
                <div className="space-y-2">
                  {[
                    { label: "เสี่ยงสูง", count: filteredHouses.filter((h) => h.riskLevel === "high").length, color: "#DC2626", bg: "#FEE2E2" },
                    { label: "ปานกลาง", count: filteredHouses.filter((h) => h.riskLevel === "medium").length, color: "#D97706", bg: "#FEF3C7" },
                    { label: "ต่ำ", count: filteredHouses.filter((h) => h.riskLevel === "low").length, color: "#16A34A", bg: "#DCFCE7" },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center gap-3 rounded-lg p-2" style={{ backgroundColor: r.bg }}>
                      <p className="text-lg font-bold w-10 text-center" style={{ color: r.color }}>{r.count}</p>
                      <p className="text-xs font-medium" style={{ color: r.color }}>{r.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* NCD Card */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 min-w-[260px] flex-shrink-0">
                <p className="text-xs font-semibold text-text-muted mb-3">โรคเรื้อรัง NCD</p>
                <div className="space-y-2">
                  {ncdStats.map((ncd) => {
                    const maxVal = Math.max(...ncdStats.map((n) => n.total));
                    return (
                      <div key={ncd.diseaseEn}>
                        <div className="flex justify-between mb-0.5">
                          <span className="text-xs text-text">{ncd.disease}</span>
                          <span className="text-xs font-bold text-text">{ncd.total}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-royal-blue" style={{ width: `${(ncd.total / maxVal) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Outbreak Card */}
              {outbreakCases.length > 0 && (
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100 min-w-[260px] flex-shrink-0">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Bug size={14} className="text-purple-500" />
                    <p className="text-xs font-semibold text-text-muted">โรคระบาด</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-base font-bold text-text">{outbreakCases.length}</p>
                      <p className="text-[10px] text-text-muted">ผู้ป่วย</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-2 text-center">
                      <p className="text-base font-bold text-red-600">{outbreakCases.filter((c) => c.status === "confirmed").length}</p>
                      <p className="text-[10px] text-red-400">ยืนยันแล้ว</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-base font-bold text-text">{outbreakHouseIds.size}</p>
                      <p className="text-[10px] text-text-muted">ครัวเรือน</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(() => {
                      const dm = new Map<string, number>();
                      outbreakCases.forEach((c) => dm.set(c.disease, (dm.get(c.disease) || 0) + 1));
                      const OB_DOT: Record<string, string> = { "ไข้หวัดใหญ่ (Influenza)": "#3B82F6", "อุจจาระร่วง/อาหารเป็นพิษ (Diarrhea)": "#F59E0B", "ไข้เลือดออก (Dengue)": "#DC2626", "ปอดอักเสบ (Pneumonia)": "#10B981", "สครับไทฟัส (Scrub Typhus)": "#EC4899" };
                      return Array.from(dm.entries()).sort((a, b) => b[1] - a[1]).map(([d, c]) => (
                        <span key={d} className="flex items-center gap-1 text-[10px] text-text-muted">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: OB_DOT[d] || "#9333EA" }} />
                          {d.split("(")[0].trim()} {c}
                        </span>
                      ));
                    })()}
                  </div>
                </div>
              )}

              {/* Vaccine Card */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100 min-w-[240px] flex-shrink-0">
                <div className="flex items-center gap-1.5 mb-3">
                  <Syringe size={14} className="text-sky-500" />
                  <p className="text-xs font-semibold text-text-muted">วัคซีน</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-sky-50 rounded-lg p-2 text-center">
                    <p className="text-base font-bold text-sky-600">{persons.filter((p) => p.vaccinations.length > 0).length}</p>
                    <p className="text-[10px] text-sky-400">ได้รับ</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <p className="text-base font-bold text-text">{persons.length}</p>
                    <p className="text-[10px] text-text-muted">ประชากร</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 text-center">
                    <p className="text-base font-bold text-green-600">{persons.length > 0 ? ((persons.filter((p) => p.vaccinations.length > 0).length / persons.length) * 100).toFixed(0) : 0}%</p>
                    <p className="text-[10px] text-green-400">ครอบคลุม</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>


      {/* ══════ HOUSE DETAIL DRAWER (on click) ══════ */}
      {selectedHouse && (
        <div className="absolute lg:top-20 lg:right-3 lg:bottom-16 lg:w-[400px] bottom-0 left-0 right-0 max-h-[80vh] lg:max-h-none bg-white rounded-t-2xl lg:rounded-2xl shadow-2xl z-30 overflow-y-auto flex flex-col animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#156A8A] to-[#1C85AD] text-white p-4 rounded-t-2xl flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                  <Home size={18} className="text-gold" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">บ้านเลขที่ {selectedHouse.houseCode}</h3>
                  <p className="text-sm text-white/60">{selectedHouse.address}</p>
                </div>
              </div>
              <button onClick={() => setSelectedHouse(null)} className="relative group w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center">
                <X size={14} />
                <span className="absolute top-full mt-1.5 px-2 py-0.5 rounded bg-gray-900 text-white text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">ปิด</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium" style={{
                backgroundColor: selectedHouse.riskLevel === "high" ? "#FEE2E240" : selectedHouse.riskLevel === "medium" ? "#FEF3C740" : "#DCFCE740",
                color: selectedHouse.riskLevel === "high" ? "#FCA5A5" : selectedHouse.riskLevel === "medium" ? "#FDE68A" : "#86EFAC",
              }}>
                <AlertTriangle size={10} /> {RISK_LABELS[selectedHouse.riskLevel]}
              </span>
              <span className="text-sm text-white/50">
                {selectedHouse.moo === 11 ? "ม.11 น้ำช้าง" : "ม.12 น้ำรีพัฒนา"}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 p-3">
            {[
              { icon: Users, label: "สมาชิก", val: selectedHouse.memberCount, color: "#1C85AD" },
              { icon: Users, label: "สูงอายุ", val: selectedHouse.elderlyCount, color: "#6EC3C3" },
              { icon: HeartPulse, label: "NCD", val: selectedHouse.ncdCount, color: "#DC2626" },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-lg p-2 text-center">
                <s.icon size={14} style={{ color: s.color }} className="mx-auto mb-0.5" />
                <p className="text-lg font-bold text-text"><AnimatedNumber value={s.val} duration={600} /></p>
                <p className="text-sm text-text-muted">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Outbreak cases for this house */}
          {(() => {
            const houseCases = outbreakCases.filter((c) => c.houseId === selectedHouse.id);
            if (houseCases.length === 0) return null;
            const OB_DOT: Record<string, string> = {
              "ไข้หวัดใหญ่ (Influenza)": "#3B82F6", "อุจจาระร่วง/อาหารเป็นพิษ (Diarrhea)": "#F59E0B",
              "ไข้เลือดออก (Dengue)": "#DC2626", "ปอดอักเสบ (Pneumonia)": "#10B981", "สครับไทฟัส (Scrub Typhus)": "#EC4899",
            };
            return (
              <div className="mx-3 mb-3 p-3 rounded-xl bg-purple-50 border border-purple-200">
                <div className="flex items-center gap-1.5 mb-2">
                  <Bug size={14} className="text-purple-500" />
                  <span className="text-xs font-semibold text-purple-700">โรคระบาด ({houseCases.length} ราย)</span>
                </div>
                <div className="space-y-1.5">
                  {houseCases.map((c, i) => {
                    const p = persons.find((p) => p.id === c.personId);
                    const stLabel = c.status === "confirmed" ? "ยืนยันแล้ว" : c.status === "suspected" ? "สงสัย" : "หายแล้ว";
                    const stColor = c.status === "confirmed" ? "text-red-600 bg-red-50" : c.status === "suspected" ? "text-amber-600 bg-amber-50" : "text-green-600 bg-green-50";
                    return (
                      <a key={i} href={p ? `#/household?person=${p.id}` : undefined} className="flex items-center gap-2 bg-white rounded-lg p-2 hover:bg-purple-50 transition-colors">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: OB_DOT[c.disease] || "#9333EA" }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-text truncate">{p ? `${p.prefix}${p.firstName}` : "—"}</p>
                          <p className="text-[10px] text-purple-500">{c.disease.split("(")[0].trim()}</p>
                        </div>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${stColor}`}>{stLabel}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Members */}
          <div className="px-3 pb-3 flex-1">
            <h4 className="text-sm font-semibold text-text mb-2">สมาชิก ({houseMembers.length})</h4>
            <div className="space-y-1.5">
              {houseMembers.length > 0 ? houseMembers.map((p) => (
                <a key={p.id} href={`#/household?person=${p.id}`}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-royal-blue/10 flex items-center justify-center text-sm font-bold text-royal-blue flex-shrink-0">
                    {p.firstName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">{p.prefix}{p.firstName} {p.lastName}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-sm text-text-muted">อายุ {p.age}</span>
                      {p.chronicDiseases.map((d) => (
                        <span key={d.code} className="text-sm px-1 py-0 rounded-full bg-red-50 text-red-600 font-medium">{d.code}</span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight size={12} className="text-text-light group-hover:text-royal-blue" />
                </a>
              )) : (
                <p className="text-sm text-text-muted text-center py-4">ไม่พบข้อมูล</p>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ══════ EXPANDED WIDGET MODAL ══════ */}
      {expandedWidget && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setExpandedWidget(null)} />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-[90%] max-w-[700px] max-h-[85vh] overflow-y-auto no-scrollbar p-6">
            {/* Close */}
            <button onClick={() => setExpandedWidget(null)} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10 group">
              <X size={16} />
              <span className="absolute top-full mt-1.5 px-2 py-0.5 rounded bg-gray-900 text-white text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">ปิด</span>
            </button>

            {/* OVERVIEW */}
            {expandedWidget === "overview" && (
              <div>
                <p className="text-sm text-text-muted uppercase tracking-wider mb-1">ข้อมูลภาพรวม</p>
                <h2 className="text-2xl font-bold text-text mb-5">สุขภาพระดับหมู่บ้าน — ต.ขุนน่าน อ.เฉลิมพระเกียรติ จ.น่าน</h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    { icon: Users, label: "ประชากรทั้งหมด", val: totalPop.toLocaleString(), sub: "คน", color: "#1C85AD" },
                    { icon: Home, label: "ครัวเรือน", val: totalHouses.toLocaleString(), sub: "หลัง", color: "#1C85AD" },
                    { icon: UserRound, label: "ผู้สูงอายุ (60+)", val: totalElderly.toString(), sub: `${elderlyPct}%`, color: "#6EC3C3" },
                    { icon: HeartPulse, label: "ผู้ป่วย NCD", val: totalNCD.toString(), sub: `${ncdPct}%`, color: "#DC2626" },
                  ].map((k) => (
                    <div key={k.label} className="bg-gray-50 rounded-xl p-4">
                      <k.icon size={18} style={{ color: k.color }} className="mb-2" />
                      <p className="text-2xl font-bold text-text">{k.val}</p>
                      <p className="text-sm text-text-muted">{k.label}</p>
                      <p className="text-sm text-text-light">{k.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Moo comparison */}
                <h3 className="text-sm font-semibold text-text mb-3">เปรียบเทียบรายหมู่</h3>
                <div className="overflow-hidden rounded-xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50">
                      <th className="text-left px-4 py-2.5 text-sm font-semibold text-text-muted">รายการ</th>
                      <th className="text-center px-4 py-2.5 text-sm font-semibold text-royal-blue">หมู่ 11 น้ำช้าง</th>
                      <th className="text-center px-4 py-2.5 text-sm font-semibold" style={{ color: "#6EC3C3" }}>หมู่ 12 น้ำรีพัฒนา</th>
                      <th className="text-center px-4 py-2.5 text-sm font-semibold text-text-muted">รวม</th>
                    </tr></thead>
                    <tbody>
                      {populationComparison.map((row) => (
                        <tr key={row.category} className="border-t border-gray-50">
                          <td className="px-4 py-2.5 text-sm text-text">{row.category}</td>
                          <td className="px-4 py-2.5 text-center text-sm font-medium text-text">{row.moo11.toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-center text-sm font-medium text-text">{row.moo12.toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-center text-sm font-bold text-text">{(row.moo11 + row.moo12).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* AI Summary */}
                <div className="bg-gradient-to-r from-[#1C85AD] to-[#6EC3C3] rounded-xl p-4 mt-5 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} />
                    <p className="text-sm font-semibold">การวิเคราะห์จาก AI</p>
                  </div>
                  <p className="text-sm leading-relaxed text-white/90 mb-3">{generateAISummary()}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-white/20 text-white/80 text-sm">
                    <span>สร้างจากข้อมูล HDC API</span>
                    <span>25 มี.ค. 2569, 09:10</span>
                  </div>
                </div>
              </div>
            )}

            {/* NCD */}
            {expandedWidget === "ncd" && (
              <div>
                <p className="text-sm text-text-muted uppercase tracking-wider mb-1">รายละเอียด</p>
                <h2 className="text-2xl font-bold text-text mb-5">โรคไม่ติดต่อเรื้อรัง (NCD)</h2>

                <div className="overflow-hidden rounded-xl border border-gray-100 mb-5">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50">
                      <th className="text-left px-4 py-2.5 text-sm font-semibold text-text-muted">โรค</th>
                      <th className="text-center px-4 py-2.5 text-sm font-semibold text-royal-blue">หมู่ 11</th>
                      <th className="text-center px-4 py-2.5 text-sm font-semibold" style={{ color: "#6EC3C3" }}>หมู่ 12</th>
                      <th className="text-center px-4 py-2.5 text-sm font-semibold text-text-muted">รวม</th>
                      <th className="text-center px-4 py-2.5 text-sm font-semibold text-text-muted">สัดส่วน</th>
                    </tr></thead>
                    <tbody>
                      {ncdStats.map((ncd) => (
                        <tr key={ncd.diseaseEn} className="border-t border-gray-50">
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-text">{ncd.disease}</span>
                              <span className="text-sm text-text-light">({ncd.diseaseEn})</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-center text-sm font-medium text-text">{ncd.moo11}</td>
                          <td className="px-4 py-2.5 text-center text-sm font-medium text-text">{ncd.moo12}</td>
                          <td className="px-4 py-2.5 text-center text-sm font-bold text-text">{ncd.total}</td>
                          <td className="px-4 py-2.5 text-center">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-royal-blue" style={{ width: `${(ncd.total / 200) * 100}%` }} />
                              </div>
                              <span className="text-sm text-text-muted w-8 text-right">{((ncd.total / totalPop) * 100).toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-gray-200 bg-gray-50">
                        <td className="px-4 py-2.5 text-sm font-bold text-text">รวมทั้งหมด</td>
                        <td className="px-4 py-2.5 text-center text-sm font-bold text-text">{ncdStats.reduce((s, n) => s + n.moo11, 0)}</td>
                        <td className="px-4 py-2.5 text-center text-sm font-bold text-text">{ncdStats.reduce((s, n) => s + n.moo12, 0)}</td>
                        <td className="px-4 py-2.5 text-center text-sm font-bold text-royal-blue">{ncdStats.reduce((s, n) => s + n.total, 0)}</td>
                        <td />
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-text-muted">* ผู้ป่วย 1 คนสามารถเป็นได้มากกว่า 1 โรค ตัวเลขรวมอาจมากกว่าจำนวนผู้ป่วย NCD ทั้งหมด</p>
              </div>
            )}

            {/* DEMOGRAPHICS */}
            {expandedWidget === "demographics" && (() => {
              const male = persons.filter((p) => p.gender === "male").length;
              const female = persons.length - male;
              const malePctVal = ((male / persons.length) * 100).toFixed(1);
              const femalePctVal = ((female / persons.length) * 100).toFixed(1);
              return (
                <div>
                  <p className="text-sm text-text-muted uppercase tracking-wider mb-1">รายละเอียด</p>
                  <h2 className="text-2xl font-bold text-text mb-5">ข้อมูลประชากรและความเสี่ยง</h2>

                  {/* Risk breakdown */}
                  <h3 className="text-sm font-semibold text-text mb-3">ระดับความเสี่ยงครัวเรือน</h3>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { label: "เสี่ยงสูง", desc: "ผู้สูงอายุ >= 2 หรือ NCD >= 2", count: riskCounts.high, color: "#DC2626", bg: "#FEE2E2" },
                      { label: "เสี่ยงปานกลาง", desc: "ผู้สูงอายุ = 1 หรือ NCD = 1", count: riskCounts.medium, color: "#D97706", bg: "#FEF3C7" },
                      { label: "เสี่ยงต่ำ", desc: "ไม่มีปัจจัยเสี่ยง", count: riskCounts.low, color: "#16A34A", bg: "#DCFCE7" },
                    ].map((r) => (
                      <div key={r.label} className="rounded-xl p-4 text-center" style={{ backgroundColor: r.bg }}>
                        <p className="text-3xl font-bold" style={{ color: r.color }}>{r.count}</p>
                        <p className="text-sm font-semibold mt-1" style={{ color: r.color }}>{r.label}</p>
                        <p className="text-sm mt-1" style={{ color: r.color, opacity: 0.7 }}>{r.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* Gender */}
                  <h3 className="text-sm font-semibold text-text mb-3">เพศ</h3>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-blue-600"><AnimatedNumber value={male} /></p>
                      <p className="text-sm font-semibold text-blue-600 mt-1">ชาย</p>
                      <p className="text-sm text-blue-400">{malePctVal}% ของประชากร</p>
                    </div>
                    <div className="bg-pink-50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-pink-600"><AnimatedNumber value={female} /></p>
                      <p className="text-sm font-semibold text-pink-600 mt-1">หญิง</p>
                      <p className="text-sm text-pink-400">{femalePctVal}% ของประชากร</p>
                    </div>
                  </div>

                  {/* Age breakdown */}
                  <h3 className="text-sm font-semibold text-text mb-3">ช่วงอายุ</h3>
                  <div className="space-y-3">
                    {[
                      { label: "วัยทำงาน (25-59 ปี)", count: totalPop - totalElderly, color: "#1C85AD" },
                      { label: "ผู้สูงอายุ (60 ปีขึ้นไป)", count: totalElderly, color: "#6EC3C3" },
                    ].map((a) => (
                      <div key={a.label}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-text">{a.label}</span>
                          <span className="text-sm font-bold text-text">{a.count.toLocaleString()} คน ({((a.count / totalPop) * 100).toFixed(1)}%)</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(a.count / totalPop) * 100}%`, backgroundColor: a.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* VILLAGE STATUS */}
            {expandedWidget === "village-status" && (() => {
              const v = villages.find((v) => v.moo === villageTab) || villages[0];
              const vHouses = houses.filter((h) => h.moo === v.moo);
              const vPersons = persons.filter((p) => p.moo === v.moo);
              const avg = vHouses.length > 0 ? (vPersons.length / vHouses.length).toFixed(1) : "0";
              const high = vHouses.filter((h) => h.riskLevel === "high");
              const medium = vHouses.filter((h) => h.riskLevel === "medium");
              const low = vHouses.filter((h) => h.riskLevel === "low");
              const riskTotal = vHouses.length;

              return (
              <div>
                <p className="text-sm text-text-muted uppercase tracking-wider mb-1">รายละเอียด</p>
                <h2 className="text-2xl font-bold text-text mb-5">สรุปสถานะแบ่งตามหมู่</h2>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
                  {villages.map((tab) => (
                    <button
                      key={tab.moo}
                      onClick={() => setVillageTab(tab.moo)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        villageTab === tab.moo
                          ? "bg-white text-royal-blue shadow-sm"
                          : "text-text-muted hover:text-text"
                      }`}
                    >
                      หมู่ {tab.moo} {tab.name}
                    </button>
                  ))}
                </div>

                {/* Summary */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-text">ม.{v.moo} {v.name}</h3>
                  <span className="text-sm text-text-muted">{vHouses.length} หลัง / {vPersons.length.toLocaleString()} คน / เฉลี่ย {avg} คน/หลัง</span>
                </div>

                {/* Risk cards */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="bg-red-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">{high.length}</p>
                    <p className="text-sm text-red-500">เสี่ยงสูง</p>
                    <p className="text-xs text-red-400 mt-1">{riskTotal > 0 ? ((high.length / riskTotal) * 100).toFixed(0) : 0}%</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-amber-600">{medium.length}</p>
                    <p className="text-sm text-amber-500">ปานกลาง</p>
                    <p className="text-xs text-amber-400 mt-1">{riskTotal > 0 ? ((medium.length / riskTotal) * 100).toFixed(0) : 0}%</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{low.length}</p>
                    <p className="text-sm text-green-500">ต่ำ</p>
                    <p className="text-xs text-green-400 mt-1">{riskTotal > 0 ? ((low.length / riskTotal) * 100).toFixed(0) : 0}%</p>
                  </div>
                </div>


                {/* Household table */}
                <h3 className="text-sm font-semibold text-text mb-3">ครัวเรือนทั้งหมด ({vHouses.length} หลัง)</h3>
                <div className="overflow-hidden rounded-xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-4 py-2.5 text-sm font-semibold text-text-muted">บ้านเลขที่</th>
                        <th className="text-center px-3 py-2.5 text-sm font-semibold text-text-muted">สมาชิก</th>
                        <th className="text-center px-3 py-2.5 text-sm font-semibold text-text-muted">ผู้สูงอายุ</th>
                        <th className="text-center px-3 py-2.5 text-sm font-semibold text-text-muted">NCD</th>
                        <th className="text-center px-3 py-2.5 text-sm font-semibold text-text-muted">ความเสี่ยง</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vHouses.sort((a, b) => {
                        const order = { high: 0, medium: 1, low: 2 };
                        return order[a.riskLevel] - order[b.riskLevel];
                      }).map((h) => {
                        const riskBg = h.riskLevel === "high" ? "bg-red-50 text-red-600" : h.riskLevel === "medium" ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600";
                        const riskLabel = h.riskLevel === "high" ? "สูง" : h.riskLevel === "medium" ? "กลาง" : "ต่ำ";
                        return (
                          <tr key={h.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                            <td className="px-4 py-2.5 font-medium text-text">{h.houseCode}</td>
                            <td className="px-3 py-2.5 text-center text-text">{h.memberCount}</td>
                            <td className="px-3 py-2.5 text-center text-text">{h.elderlyCount}</td>
                            <td className="px-3 py-2.5 text-center text-text">{h.ncdCount}</td>
                            <td className="px-3 py-2.5 text-center">
                              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${riskBg}`}>{riskLabel}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              );
            })()}

            {/* COVERAGE */}
            {/* OUTBREAK */}
            {expandedWidget === "outbreak" && (() => {
              const OB_COLORS: Record<string, { bg: string; dot: string }> = {
                "ไข้หวัดใหญ่ (Influenza)": { bg: "rgba(59,130,246,0.1)", dot: "#3B82F6" },
                "อุจจาระร่วง/อาหารเป็นพิษ (Diarrhea)": { bg: "rgba(245,158,11,0.1)", dot: "#F59E0B" },
                "ไข้เลือดออก (Dengue)": { bg: "rgba(220,38,38,0.1)", dot: "#DC2626" },
                "ปอดอักเสบ (Pneumonia)": { bg: "rgba(16,185,129,0.1)", dot: "#10B981" },
                "สครับไทฟัส (Scrub Typhus)": { bg: "rgba(236,72,153,0.1)", dot: "#EC4899" },
              };
              const obDiseaseMap = new Map<string, number>();
              outbreakCases.forEach((c) => obDiseaseMap.set(c.disease, (obDiseaseMap.get(c.disease) || 0) + 1));
              const obSorted = Array.from(obDiseaseMap.entries()).sort((a, b) => b[1] - a[1]);
              const obTotal = outbreakCases.length;
              const obConfirmed = outbreakCases.filter((c) => c.status === "confirmed").length;
              const obSuspected = outbreakCases.filter((c) => c.status === "suspected").length;
              const obRecovered = outbreakCases.filter((c) => c.status === "recovered").length;
              const obMaxDisease = obSorted.length > 0 ? obSorted[0][1] : 1;
              const obPersons = outbreakCases.map((c) => persons.find((p) => p.id === c.personId)).filter(Boolean);
              const obElderly = obPersons.filter((p) => p!.isElderly).length;
              const obNcd = obPersons.filter((p) => p!.chronicDiseases.length > 0).length;
              const obChild = obPersons.filter((p) => p!.age < 5).length;
              const obNoFlu = obPersons.filter((p) => !p!.vaccinations.some((v) => v.vaccineNameEn === "Influenza" && v.date >= "2025-06-01")).length;
              const obDailyMap = new Map<string, number>();
              for (let i = 0; i < 14; i++) { const d = new Date(2026, 2, 26 - 13 + i); obDailyMap.set(d.toISOString().split("T")[0], 0); }
              outbreakCases.forEach((c) => { if (obDailyMap.has(c.reportDate)) obDailyMap.set(c.reportDate, (obDailyMap.get(c.reportDate) || 0) + 1); });
              const obDailyData = Array.from(obDailyMap.entries());
              const obMaxDaily = Math.max(...obDailyData.map((d) => d[1]), 1);

              return (
              <div>
                <p className="text-sm text-text-muted uppercase tracking-wider mb-1">รายละเอียด</p>
                <h2 className="text-2xl font-bold text-text mb-5 flex items-center gap-2">
                  <Bug size={24} className="text-purple-500" />
                  เฝ้าระวังโรคระบาด
                </h2>

                {/* KPI */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-text">{obTotal}</p>
                    <p className="text-sm text-text-muted">ผู้ป่วยทั้งหมด</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-red-600">{obConfirmed}</p>
                    <p className="text-sm text-red-400">ยืนยัน</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-amber-600">{obSuspected}</p>
                    <p className="text-sm text-amber-400">สงสัย</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-green-600">{obRecovered}</p>
                    <p className="text-sm text-green-400">หายแล้ว</p>
                  </div>
                </div>

                {/* Vulnerability */}
                <h3 className="text-sm font-semibold text-text mb-3">กลุ่มเปราะบาง</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="flex items-center gap-3 bg-amber-50 rounded-xl p-4">
                    <UserRound size={20} className="text-amber-600" />
                    <div>
                      <p className="text-xl font-bold text-amber-700">{obElderly}</p>
                      <p className="text-xs text-amber-500">ผู้สูงอายุ</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-red-50 rounded-xl p-4">
                    <HeartPulse size={20} className="text-red-500" />
                    <div>
                      <p className="text-xl font-bold text-red-600">{obNcd}</p>
                      <p className="text-xs text-red-400">มีโรคเรื้อรัง</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-4">
                    <Users size={20} className="text-blue-500" />
                    <div>
                      <p className="text-xl font-bold text-blue-600">{obChild}</p>
                      <p className="text-xs text-blue-400">เด็กเล็ก (&lt;5 ปี)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-purple-50 rounded-xl p-4">
                    <ShieldAlert size={20} className="text-purple-500" />
                    <div>
                      <p className="text-xl font-bold text-purple-600">{obNoFlu}</p>
                      <p className="text-xs text-purple-400">ไม่มีวัคซีนไข้หวัดใหญ่</p>
                    </div>
                  </div>
                </div>

                {/* Disease bars */}
                <h3 className="text-sm font-semibold text-text mb-3">จำนวนผู้ป่วยตามโรค</h3>
                <div className="space-y-3 mb-6">
                  {obSorted.map(([disease, count]) => {
                    const color = OB_COLORS[disease] || { bg: "rgba(0,0,0,0.05)", dot: "#6B7280" };
                    return (
                      <div key={disease}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-text flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color.dot }} />
                            {disease}
                          </span>
                          <span className="text-sm font-bold text-text">{count} คน</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(count / obMaxDisease) * 100}%`, backgroundColor: color.dot, opacity: 0.75 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 14-day sparkline */}

                {/* Patient list */}
                <h3 className="text-sm font-semibold text-text mb-3">รายชื่อผู้ป่วย ({obTotal} ราย)</h3>
                <div className="overflow-hidden rounded-xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-4 py-2.5 text-sm font-semibold text-text-muted">ชื่อ</th>
                        <th className="text-left px-4 py-2.5 text-sm font-semibold text-text-muted">โรค</th>
                        <th className="text-center px-4 py-2.5 text-sm font-semibold text-text-muted">สถานะ</th>
                        <th className="text-center px-4 py-2.5 text-sm font-semibold text-text-muted">วันที่</th>
                      </tr>
                    </thead>
                    <tbody>
                      {outbreakCases.sort((a, b) => b.reportDate.localeCompare(a.reportDate)).map((c, i) => {
                        const p = persons.find((p) => p.id === c.personId);
                        const color = OB_COLORS[c.disease]?.dot || "#6B7280";
                        const stColor = c.status === "confirmed" ? "bg-red-50 text-red-600" : c.status === "suspected" ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600";
                        const stLabel = c.status === "confirmed" ? "ยืนยันแล้ว" : c.status === "suspected" ? "สงสัย" : "หายแล้ว";
                        return (
                          <tr key={i} className="border-t border-gray-50">
                            <td className="px-4 py-2.5">
                              {p ? (
                                <div>
                                  <p className="font-medium text-text">{p.prefix}{p.firstName} {p.lastName}</p>
                                  <p className="text-xs text-text-muted">อายุ {p.age} · หมู่ {p.moo}</p>
                                </div>
                              ) : <span className="text-text-muted">—</span>}
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="flex items-center gap-1.5 text-sm">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                {c.disease.split("(")[0].trim()}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${stColor}`}>{stLabel}</span>
                            </td>
                            <td className="px-4 py-2.5 text-center text-sm text-text-muted">{c.reportDate}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              );
            })()}

            {/* VACCINE COVERAGE */}
            {expandedWidget === "vaccine" && (() => {
              const vgFilter = vaccineGroup;
              const relDefs = vgFilter === "all" ? VACCINE_DEFS : VACCINE_DEFS.filter((d) => d.group === vgFilter);

              return (
              <div>
                <p className="text-sm text-text-muted uppercase tracking-wider mb-1">รายละเอียด</p>
                <h2 className="text-2xl font-bold text-text mb-5 flex items-center gap-2">
                  <Syringe size={24} className="text-sky-500" />
                  ความครอบคลุมวัคซีน
                </h2>

                {/* Group filter in modal */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <button onClick={() => setVaccineGroup("all")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${vgFilter === "all" ? "bg-sky-500 text-white border-sky-500" : "bg-white text-text-muted border-gray-200"}`}
                  >ทั้งหมด</button>
                  {(Object.entries(VACCINE_GROUP_LABELS) as [VaccineGroup, { name: string; color: string }][]).map(([key, { name, color }]) => (
                    <button key={key} onClick={() => setVaccineGroup(key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${vgFilter === key ? "text-white border-transparent" : "bg-white text-text-muted border-gray-200"}`}
                      style={vgFilter === key ? { backgroundColor: color, borderColor: color } : {}}
                    >{name}</button>
                  ))}
                </div>

                {/* Moo comparison */}
                <h3 className="text-sm font-semibold text-text mb-3">แยกตามหมู่</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {villages.map((v) => {
                    const mooPers = persons.filter((p) => p.moo === v.moo);
                    const mooVax = mooPers.filter((p) => vgFilter === "all" ? p.vaccinations.length > 0 : p.vaccinations.some((vx) => vx.group === vgFilter)).length;
                    const mooPct = mooPers.length > 0 ? ((mooVax / mooPers.length) * 100).toFixed(0) : "0";
                    const mooHouses = houses.filter((h) => h.moo === v.moo).length;
                    return (
                      <div key={v.id} className="bg-gray-50 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-base font-bold text-text">หมู่ {v.moo}</span>
                          <span className="text-base font-bold text-sky-600">{mooPct}%</span>
                        </div>
                        <p className="text-sm text-text-muted mb-3">{v.name} · {mooHouses} ครัวเรือน</p>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                          <div className="h-full rounded-full bg-sky-500 transition-all duration-500" style={{ width: `${mooPct}%` }} />
                        </div>
                        <p className="text-sm text-text-muted">ได้รับวัคซีน {mooVax} จาก {mooPers.length} คน</p>
                      </div>
                    );
                  })}
                </div>

                {/* Per-vaccine table */}
                <h3 className="text-sm font-semibold text-text mb-3">รายวัคซีน</h3>
                <div className="overflow-hidden rounded-xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-4 py-2.5 text-sm font-semibold text-text-muted">วัคซีน</th>
                        <th className="text-center px-4 py-2.5 text-sm font-semibold text-text-muted">กลุ่มเป้าหมาย</th>
                        <th className="text-center px-4 py-2.5 text-sm font-semibold text-text-muted">ได้รับ</th>
                        <th className="text-center px-4 py-2.5 text-sm font-semibold text-text-muted">ครอบคลุม</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relDefs.map((vd) => {
                        const eligible = persons.filter((p) => p.age >= vd.ageMin && p.age <= vd.ageMax && (!vd.gender || p.gender === vd.gender)).length;
                        const received = persons.filter((p) => p.vaccinations.some((v) => v.vaccineCode === vd.code)).length;
                        const pct = eligible > 0 ? ((received / eligible) * 100).toFixed(0) : "0";
                        const groupColor = VACCINE_GROUP_LABELS[vd.group].color;
                        return (
                          <tr key={vd.code} className="border-t border-gray-50">
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: groupColor }} />
                                <div>
                                  <p className="font-medium text-text">{vd.code}</p>
                                  <p className="text-xs text-text-muted">{vd.name}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-center text-text-muted">{eligible}</td>
                            <td className="px-4 py-2.5 text-center font-medium text-text">{received}</td>
                            <td className="px-4 py-2.5 text-center">
                              <div className="flex items-center gap-2 justify-center">
                                <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: groupColor }} />
                                </div>
                                <span className="text-sm font-bold" style={{ color: groupColor }}>{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              );
            })()}

            {expandedWidget === "coverage" && (
              <div>
                <p className="text-sm text-text-muted uppercase tracking-wider mb-1">รายละเอียด</p>
                <h2 className="text-2xl font-bold text-text mb-5">สิทธิการรักษาพยาบาล</h2>

                <div className="space-y-4">
                  {healthCoverageData.map((item, i) => (
                    <div key={item.name} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-text">{item.name}</span>
                        <span className="text-sm font-bold text-text">{item.value.toLocaleString()} คน</span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-1">
                        <div className="h-full rounded-full" style={{ width: `${item.percentage}%`, backgroundColor: ["#1C85AD", "#6EC3C3", "#F59E0B", "#94A3B8"][i] }} />
                      </div>
                      <p className="text-sm text-text-muted text-right">{item.percentage}% ของประชากรทั้งหมด</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold text-text">รวมทั้งหมด</span>
                    <span className="text-sm font-bold text-royal-blue">{healthCoverageData.reduce((s, d) => s + d.value, 0).toLocaleString()} คน</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
