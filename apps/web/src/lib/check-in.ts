// Client-only check-in: browser geolocation and distance to gallery coordinates.
// No server verification. Radius is a single global default tuned for city-centre GPS drift.

import type { Gallery } from "@/lib/types";

/** Default geofence radius in metres. City-centre browser GPS is often off by 50 m or more. */
export const CHECK_IN_RADIUS_METRES = 100;

export interface LatLng {
  lat: number;
  lng: number;
}

export type CheckInResult =
  | { status: "success"; distanceMetres: number }
  | { status: "out_of_range"; distanceMetres: number }
  | { status: "permission_denied" }
  | { status: "unavailable"; message: string };

type GeolocationErrorCode = "permission_denied" | "unavailable";

export class GeolocationError extends Error {
  constructor(
    readonly code: GeolocationErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "GeolocationError";
  }
}

/** Request the user's current position. Rejects with GeolocationError on failure. */
export function getUserPosition(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new GeolocationError("unavailable", "Geolocation is not supported in this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new GeolocationError("permission_denied", "Location permission was denied."));
          return;
        }
        reject(
          new GeolocationError(
            "unavailable",
            error.code === error.TIMEOUT
              ? "Location request timed out. Try again when you have a clearer signal."
              : "Location could not be determined right now.",
          ),
        );
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 },
    );
  });
}

const EARTH_RADIUS_METRES = 6_371_000;

/** Haversine distance between two points in metres. */
export function distanceMetres(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_METRES * Math.asin(Math.sqrt(h));
}

export function evaluateCheckIn(
  user: LatLng,
  gallery: Pick<Gallery, "latitude" | "longitude">,
  radiusMetres: number = CHECK_IN_RADIUS_METRES,
): CheckInResult {
  if (gallery.latitude == null || gallery.longitude == null) {
    return { status: "unavailable", message: "This gallery has no map coordinates yet." };
  }

  const galleryPoint = { lat: gallery.latitude, lng: gallery.longitude };
  const dist = distanceMetres(user, galleryPoint);

  if (dist <= radiusMetres) {
    return { status: "success", distanceMetres: dist };
  }

  return { status: "out_of_range", distanceMetres: dist };
}
