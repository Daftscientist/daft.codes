"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export default function MapSection() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    import("leaflet").then((L) => {
      if (!mapRef.current || mapInstance.current) return;

      function makeIcon(size: number, colorClass: string) {
        // Clickable area is larger than the visual dot
        const hitArea = Math.max(size * 2.5, 24);
        return L.divIcon({
          className: "",
          html: `<div class="map-marker-hit" style="width:${hitArea}px;height:${hitArea}px;display:flex;align-items:center;justify-content:center;"><div class="map-marker${colorClass ? " " + colorClass : ""}" style="width:${size}px;height:${size}px;"></div></div>`,
          iconSize: [hitArea, hitArea],
          iconAnchor: [hitArea / 2, hitArea / 2],
        });
      }

      const pins = [
        { lat: 51.88, lng: 0.9, label: "<strong>Essex, England</strong><br>Home", icon: makeIcon(12, "") },
        { lat: 51.3, lng: -1.2, label: "<strong>Microsoft</strong><br>Reading — Work experience, 2024", icon: makeIcon(9, "secondary") },
        { lat: 53.0, lng: -2.2, label: "<strong>bookinglab</strong><br>Remote — Work experience, 2024", icon: makeIcon(9, "secondary") },
        { lat: 55.95, lng: -3.2, label: "<strong>Edinburgh</strong><br>Visited", icon: makeIcon(8, "secondary") },
        { lat: -9.19, lng: -75.01, label: "<strong>Peru</strong><br><em>mi otra casa</em>", icon: makeIcon(12, "peru") },
      ];

      const map = L.map(mapRef.current, {
        center: [25, -15],
        zoom: 2.4,
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        maxBounds: [[-80, -180], [85, 180]],
        maxBoundsViscosity: 1.0,
      });

      mapInstance.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd",
        maxZoom: 6,
        minZoom: 2,
      }).addTo(map);

      pins.forEach((p) => {
        const marker = L.marker([p.lat, p.lng], { icon: p.icon })
          .addTo(map)
          .bindPopup(p.label, {
            className: "map-popup",
            closeButton: false,
            offset: [0, -8],
            autoPan: false,
          });

        // Open on hover so closely packed UK pins are all accessible
        marker.on("mouseover", function () {
          marker.openPopup();
        });
        marker.on("mouseout", function () {
          marker.closePopup();
        });
      });

      // Arc line Peru → Essex
      const arcPoints: [number, number][] = [];
      const startLat = -9.19,
        startLng = -75.01,
        endLat = 51.88,
        endLng = 0.9;
      for (let i = 0; i <= 50; i++) {
        const t = i / 50;
        const lat = startLat + t * (endLat - startLat);
        const lng = startLng + t * (endLng - startLng);
        const arc = Math.sin(t * Math.PI) * 15;
        arcPoints.push([lat + arc, lng]);
      }
      L.polyline(arcPoints, {
        color: "rgba(189,188,189,0.15)",
        weight: 1,
        dashArray: "6 6",
      }).addTo(map);

      // Robust resize handling — force recalculate after layout settles
      const invalidate = () => map.invalidateSize();
      setTimeout(invalidate, 0);
      setTimeout(invalidate, 150);
      setTimeout(invalidate, 400);
      setTimeout(invalidate, 1000);
      setTimeout(invalidate, 2500);

      // ResizeObserver for when the container dimensions change
      let ro: ResizeObserver | undefined;
      if (typeof ResizeObserver !== "undefined" && mapRef.current) {
        ro = new ResizeObserver(() => {
          requestAnimationFrame(invalidate);
        });
        ro.observe(mapRef.current);
      }

      // Also re-invalidate when the section scrolls into view
      let io: IntersectionObserver | undefined;
      if (typeof IntersectionObserver !== "undefined" && mapRef.current) {
        io = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                invalidate();
              }
            });
          },
          { threshold: 0.1 }
        );
        io.observe(mapRef.current);
      }
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="map-wrap r rd1" style={{ opacity: 1 }}>
      <div
        ref={mapRef}
        style={{ width: "100%", height: "100%", background: "var(--onyx)" }}
      />
    </div>
  );
}
