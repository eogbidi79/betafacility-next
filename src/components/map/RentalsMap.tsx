"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { ListingDTO } from "@/lib/listings";
import { CITY_COORDS } from "@/data/locations";

const pin = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#ff751f;border:3px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.45)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// Larger ringed pin for country-level coverage markers.
const coveragePin = L.divIcon({
  className: "",
  html: `<div style="width:24px;height:24px;border-radius:50%;background:rgba(255,117,31,.25);border:2px solid #ff751f;display:flex;align-items:center;justify-content:center"><div style="width:9px;height:9px;border-radius:50%;background:#ff751f"></div></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Countries Beta Facility operates in — shown as a world-view coverage map
// when there are no specific listings plotted.
const COVERAGE: { name: string; pos: [number, number] }[] = [
  { name: "Canada", pos: [56.1304, -106.3468] },
  { name: "United Kingdom", pos: [54.0, -2.4] },
  { name: "Nigeria", pos: [9.082, 8.6753] },
];

function coords(l: ListingDTO): [number, number] | null {
  if (l.latitude != null && l.longitude != null) return [l.latitude, l.longitude];
  const c = CITY_COORDS[l.city];
  return c ? [c.lat, c.lng] : null;
}

function scrollTo(id: string) {
  document.getElementById(`listing-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

// Use Mapbox tiles when a public token is configured; otherwise fall back to
// OpenStreetMap so the map always renders (no key required in dev).
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const tiles = MAPBOX_TOKEN
  ? {
      url: `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/512/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`,
      attribution:
        '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      tileSize: 512,
      zoomOffset: -1,
    }
  : {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      tileSize: 256,
      zoomOffset: 0,
    };

// Imperatively fit the map to the given points after mount/updates.
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 12);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
  }, [map, points]);
  return null;
}

export default function RentalsMap({
  listings,
  world = false,
}: {
  listings: ListingDTO[];
  world?: boolean;
}) {
  const pts = listings
    .map((l) => ({ l, pos: coords(l) }))
    .filter((x): x is { l: ListingDTO; pos: [number, number] } => x.pos !== null);

  // `world`: always show the global coverage view (Canada, UK, Nigeria) with any
  // listings plotted on top. Otherwise (e.g. a single property page) zoom to the
  // listing(s), falling back to the coverage view when there's nothing to plot.
  const showCoverage = world || pts.length === 0;
  const coveragePts = COVERAGE.map((c) => c.pos);
  const fitPoints: [number, number][] = world
    ? [...coveragePts, ...pts.map((p) => p.pos)]
    : pts.length
      ? pts.map((p) => p.pos)
      : coveragePts;

  return (
    <MapContainer
      center={[30, -20]}
      zoom={2}
      minZoom={2}
      worldCopyJump
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution={tiles.attribution}
        url={tiles.url}
        tileSize={tiles.tileSize}
        zoomOffset={tiles.zoomOffset}
      />

      <FitBounds points={fitPoints} />

      {showCoverage &&
        COVERAGE.map((c) => (
          <Marker key={c.name} position={c.pos} icon={coveragePin}>
            <Tooltip permanent direction="top" offset={[0, -10]} className="bf-coverage-label">
              {c.name}
            </Tooltip>
            <Popup>
              <strong>{c.name}</strong>
              <br />
              Beta Facility operating region
            </Popup>
          </Marker>
        ))}

      {pts.map(({ l, pos }) => (
        <Marker key={l.id} position={pos} icon={pin} eventHandlers={{ click: () => scrollTo(l.id) }}>
          <Popup>
            <strong>{l.title}</strong>
            <br />
            {l.city}, {l.state}
            <br />
            <button
              type="button"
              onClick={() => scrollTo(l.id)}
              style={{ color: "#ed5c0a", fontWeight: 600, background: "none", border: 0, cursor: "pointer", padding: 0 }}
            >
              View listing →
            </button>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
