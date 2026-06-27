"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Gallery } from "@/lib/types";
import { mapConfig, isMapConfigured } from "@/lib/maps";
import { DetailCard } from "@/components/detail-card";

interface GalleryMapProps {
  galleries: Gallery[];
  initialGallerySlug?: string;
}

export function GalleryMap({ galleries, initialGallerySlug }: GalleryMapProps) {
  const mapGalleries = galleries.filter(
    (g) => g.latitude != null && g.longitude != null,
  );

  const [selectedSlug, setSelectedSlug] = useState<string | undefined>(
    initialGallerySlug && mapGalleries.some((g) => g.slug === initialGallerySlug)
      ? initialGallerySlug
      : mapGalleries[0]?.slug,
  );

  const [mapLoadFailed, setMapLoadFailed] = useState(false);

  const selected = mapGalleries.find((g) => g.slug === selectedSlug);

  const showListFallback = !isMapConfigured() || mapLoadFailed;

  if (showListFallback) {
    return (
      <GalleryMapLayout
        galleries={mapGalleries}
        selectedSlug={selectedSlug}
        onSelect={setSelectedSlug}
        selected={selected}
        notice={
          mapLoadFailed
            ? "The map could not load. This is usually an API key referrer restriction. Galleries are listed below until that is fixed."
            : "The map needs a Google Maps API key to render. Galleries are listed below until the key is configured."
        }
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
      <GoogleMapCanvas
        galleries={mapGalleries}
        selectedSlug={selectedSlug}
        onSelect={setSelectedSlug}
        initialGallerySlug={initialGallerySlug}
        onLoadFailed={() => setMapLoadFailed(true)}
      />
      <div>{selected ? <DetailCard gallery={selected} /> : null}</div>
    </div>
  );
}

function GalleryMapLayout({
  galleries,
  selectedSlug,
  onSelect,
  selected,
  notice,
}: {
  galleries: Gallery[];
  selectedSlug: string | undefined;
  onSelect: (slug: string) => void;
  selected: Gallery | undefined;
  notice: string;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
      <div className="rounded-sm border border-line bg-line/20 p-6">
        <p className="text-sm text-muted">{notice}</p>
        <ul className="mt-6 divide-y divide-line">
          {galleries.map((g) => (
            <li key={g.id}>
              <button
                type="button"
                onClick={() => onSelect(g.slug)}
                className={`w-full py-3 text-left text-sm transition hover:text-ink ${
                  selectedSlug === g.slug ? "text-ink" : "text-muted"
                }`}
              >
                {g.name}
                {g.suburb && <span className="text-muted"> · {g.suburb}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>{selected ? <DetailCard gallery={selected} /> : null}</div>
    </div>
  );
}

function GoogleMapCanvas({
  galleries,
  selectedSlug,
  onSelect,
  initialGallerySlug,
  onLoadFailed,
}: {
  galleries: Gallery[];
  selectedSlug: string | undefined;
  onSelect: (slug: string) => void;
  initialGallerySlug?: string;
  onLoadFailed: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);

  const focusGallery = useCallback(
    (slug: string) => {
      const gallery = galleries.find((g) => g.slug === slug);
      if (!gallery || gallery.latitude == null || gallery.longitude == null) return;
      onSelect(slug);
      if (mapRef.current) {
        mapRef.current.panTo({ lat: gallery.latitude, lng: gallery.longitude });
        mapRef.current.setZoom(15);
      }
    },
    [galleries, onSelect],
  );

  useEffect(() => {
    if (initialGallerySlug) {
      focusGallery(initialGallerySlug);
    }
  }, [initialGallerySlug, focusGallery, mapReady]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const apiKey = mapConfig.apiKey;
    if (!apiKey) return;

    const scriptId = "google-maps-script";
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;

    window.gm_authFailure = () => {
      onLoadFailed();
    };

    function initMap() {
      if (!containerRef.current || !window.google?.maps) return;

      try {
        mapRef.current = new google.maps.Map(containerRef.current, {
          center: mapConfig.center,
          zoom: mapConfig.defaultZoom,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          restriction: {
            latLngBounds: mapConfig.bounds,
            strictBounds: false,
          },
        });

        markersRef.current = galleries.map((gallery) => {
          const marker = new google.maps.Marker({
            position: { lat: gallery.latitude!, lng: gallery.longitude! },
            map: mapRef.current!,
            title: gallery.name,
          });
          marker.addListener("click", () => focusGallery(gallery.slug));
          return marker;
        });

        setMapReady(true);

        if (initialGallerySlug) {
          focusGallery(initialGallerySlug);
        }
      } catch {
        onLoadFailed();
      }
    }

    if (existing && window.google?.maps) {
      initMap();
      return () => {
        delete window.gm_authFailure;
      };
    }

    const script = existing ?? document.createElement("script");
    if (!existing) {
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.onerror = () => onLoadFailed();
      document.head.appendChild(script);
    }
    script.addEventListener("load", initMap);

    return () => {
      script.removeEventListener("load", initMap);
      delete window.gm_authFailure;
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };
  }, [galleries, focusGallery, initialGallerySlug, onLoadFailed]);

  useEffect(() => {
    if (!mapReady) return;
    markersRef.current.forEach((marker, i) => {
      const gallery = galleries[i];
      marker.setIcon(
        selectedSlug === gallery.slug
          ? {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#16130e",
              fillOpacity: 1,
              strokeColor: "#f4efe2",
              strokeWeight: 1,
            }
          : {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 7,
              fillColor: "#a24b2c",
              fillOpacity: 1,
              strokeColor: "#f4efe2",
              strokeWeight: 1,
            },
      );
    });
  }, [selectedSlug, galleries, mapReady]);

  return (
    <div
      ref={containerRef}
      className="h-[min(70vh,32rem)] w-full rounded-sm border border-line bg-line/20"
      role="region"
      aria-label="Cape Town gallery map"
    />
  );
}

declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}
