"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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

export default function RentalsMap({ listings }: { listings: ListingDTO[] }) {
  const pts = listings
    .map((l) => ({ l, pos: coords(l) }))
    .filter((x): x is { l: ListingDTO; pos: [number, number] } => x.pos !== null);

  const center: [number, number] = pts[0]?.pos ?? [9.082, 8.6753]; // Nigeria centroid fallback

  return (
    <MapContainer
      center={center}
      zoom={pts.length ? 12 : 6}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution={tiles.attribution}
        url={tiles.url}
        tileSize={tiles.tileSize}
        zoomOffset={tiles.zoomOffset}
      />
      {pts.map(({ l, pos }) => (
        <Marker
          key={l.id}
          position={pos}
          icon={pin}
          eventHandlers={{ click: () => scrollTo(l.id) }}
        >
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
