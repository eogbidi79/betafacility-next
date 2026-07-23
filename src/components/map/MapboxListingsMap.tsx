"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { ListingDTO } from "@/lib/listings";
import { CITY_COORDS } from "@/data/locations";
import { formatMoney } from "@/lib/currency";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

function coords(l: ListingDTO): [number, number] | null {
  // GeoJSON order is [lng, lat].
  if (l.latitude != null && l.longitude != null) return [l.longitude, l.latitude];
  const c = CITY_COORDS[l.city];
  return c ? [c.lng, c.lat] : null;
}

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}

function toFeatureCollection(listings: ListingDTO[]) {
  const features = listings
    .map((l) => {
      const pos = coords(l);
      if (!pos) return null;
      const price =
        l.rentPerYear != null
          ? `${formatMoney(l.rentPerYear, l.currencyCode)}/yr`
          : l.price != null
            ? `${formatMoney(l.price, l.currencyCode)}/night`
            : "On request";
      return {
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: pos },
        properties: {
          id: l.id,
          title: l.title,
          location: [l.city, l.state, l.country].filter(Boolean).join(", "),
          price,
          href: `/rentals/${l.id}`,
        },
      };
    })
    .filter(Boolean);
  return { type: "FeatureCollection" as const, features: features as any[] };
}

// Nigeria + Canada extent, used when nothing is plotted.
const DEFAULT_BOUNDS: [[number, number], [number, number]] = [
  [-141, 4], // SW (west Canada, south Nigeria)
  [15, 70], // NE (east Nigeria, north Canada)
];

export default function MapboxListingsMap({ listings }: { listings: ListingDTO[]; world?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const listingsRef = useRef(listings);
  listingsRef.current = listings;

  // Fit the map to the current features (or the NG+CA default).
  function fit(map: any, fc: any) {
    if (fc.features.length === 0) {
      map.fitBounds(DEFAULT_BOUNDS, { padding: 30, duration: 0 });
      return;
    }
    const b = new mapboxgl.LngLatBounds();
    for (const f of fc.features) b.extend(f.geometry.coordinates);
    map.fitBounds(b, { padding: 60, maxZoom: 13, duration: 0 });
  }

  // Init once.
  useEffect(() => {
    if (!containerRef.current || !TOKEN) return;
    mapboxgl.accessToken = TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [8.6753, 9.082],
      zoom: 2,
      attributionControl: true,
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      const fc = toFeatureCollection(listingsRef.current);
      map.addSource("listings", { type: "geojson", data: fc, cluster: true, clusterRadius: 50, clusterMaxZoom: 14 });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "listings",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#ff751f",
          "circle-opacity": 0.85,
          "circle-radius": ["step", ["get", "point_count"], 16, 10, 22, 50, 30],
        },
      });
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "listings",
        filter: ["has", "point_count"],
        layout: { "text-field": ["get", "point_count_abbreviated"], "text-size": 12 },
        paint: { "text-color": "#ffffff" },
      });
      map.addLayer({
        id: "unclustered",
        type: "circle",
        source: "listings",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#ff751f",
          "circle-radius": 8,
          "circle-stroke-width": 3,
          "circle-stroke-color": "#ffffff",
        },
      });

      // Click a cluster → zoom to expand it.
      map.on("click", "clusters", (e: any) => {
        const feature = map.queryRenderedFeatures(e.point, { layers: ["clusters"] })[0] as any;
        const clusterId = feature.properties.cluster_id;
        (map.getSource("listings") as any).getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
          if (err) return;
          map.easeTo({ center: feature.geometry.coordinates, zoom });
        });
      });

      // Click a listing → mini preview popup linking to the detail page.
      map.on("click", "unclustered", (e: any) => {
        const f = e.features[0];
        const p = f.properties;
        new mapboxgl.Popup({ offset: 12, closeButton: true })
          .setLngLat(f.geometry.coordinates)
          .setHTML(
            `<div style="font-family:sans-serif;min-width:160px">
               <strong style="display:block;color:#1a1a1a">${escapeHtml(p.title)}</strong>
               <span style="color:#666;font-size:12px">${escapeHtml(p.location)}</span>
               <div style="margin-top:4px;font-weight:700;color:#1a1a1a">${escapeHtml(p.price)}</div>
               <a href="${p.href}" style="display:inline-block;margin-top:6px;color:#ed5c0a;font-weight:600;font-size:13px">View details →</a>
             </div>`,
          )
          .addTo(map);
      });

      const setPointer = (v: boolean) => (map.getCanvas().style.cursor = v ? "pointer" : "");
      for (const layer of ["clusters", "unclustered"]) {
        map.on("mouseenter", layer, () => setPointer(true));
        map.on("mouseleave", layer, () => setPointer(false));
      }

      fit(map, fc);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update data + refit when the filtered listings change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      const src = map.getSource("listings");
      if (!src) return;
      const fc = toFeatureCollection(listings);
      src.setData(fc);
      fit(map, fc);
    };
    if (map.isStyleLoaded() && map.getSource("listings")) apply();
    else map.once("idle", apply);
  }, [listings]);

  if (!TOKEN) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100 text-sm text-ink-muted">
        Map unavailable
      </div>
    );
  }
  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
}
