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
  const handleMapLoadFailed = useCallback(() => setMapLoadFailed(true), []);

  if (showListFallback) {
    return (
      <GalleryMapLayout
        galleries={mapGalleries}
        selectedSlug={selectedSlug}
        onSelect={setSelectedSlug}
        selected={selected}
        notice={
          mapLoadFailed
            ? "The map could not load. Check the browser console for the Google Maps API error. Galleries are listed below until that is fixed."
            : "The map needs a Google Maps API key to render. Galleries are listed below until the key is configured."
        }
      />
    );
  }

  return (
    <div className="relative h-[calc(100dvh-4.5rem)] min-h-[34rem] w-full overflow-hidden bg-line/20">
      <GoogleMapCanvas
        galleries={mapGalleries}
        selectedSlug={selectedSlug}
        onSelect={setSelectedSlug}
        initialGallerySlug={initialGallerySlug}
        onLoadFailed={handleMapLoadFailed}
      />
      {selected ? (
        <aside className="absolute inset-x-3 bottom-3 z-10 max-h-[42vh] overflow-y-auto rounded-sm border border-line bg-paper/95 p-4 shadow-card backdrop-blur md:inset-x-auto md:bottom-auto md:left-4 md:top-4 md:max-h-[calc(100%-2rem)] md:w-[18.5rem] [&>div>article]:border-0 [&>div>article]:bg-transparent [&>div>article]:p-0">
          <div className="mx-auto max-w-lg md:max-w-none">
            <DetailCard gallery={selected} />
          </div>
        </aside>
      ) : null}
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
    <div className="grid h-[calc(100dvh-4.5rem)] min-h-[34rem] w-full overflow-hidden bg-line/20 md:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)]">
      <div className="overflow-y-auto border-b border-line bg-paper/95 p-5 md:border-b-0 md:border-r">
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
      <div className="min-h-0 overflow-y-auto p-4 md:p-6">
        {selected ? <DetailCard gallery={selected} /> : null}
      </div>
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
    const callbackName = "__groundedArtInitMap";
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
          backgroundColor: "#f8f8f4",
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: mapConfig.styles,
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

    window[callbackName] = initMap;

    if (existing && window.google?.maps) {
      initMap();
      return () => {
        delete window[callbackName];
        delete window.gm_authFailure;
      };
    }

    const script = existing ?? document.createElement("script");
    if (!existing) {
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&callback=${callbackName}`;
      script.async = true;
      script.onerror = () => onLoadFailed();
      document.head.appendChild(script);
    }

    return () => {
      delete window[callbackName];
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
              strokeColor: "#f8f8f4",
              strokeWeight: 1,
            }
          : {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 7,
              fillColor: "#a24b2c",
              fillOpacity: 1,
              strokeColor: "#f8f8f4",
              strokeWeight: 1,
            },
      );
    });
  }, [selectedSlug, galleries, mapReady]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full bg-line/20"
      role="region"
      aria-label="Cape Town gallery map"
    />
  );
}

declare global {
  interface Window {
    __groundedArtInitMap?: () => void;
    gm_authFailure?: () => void;
  }
}
