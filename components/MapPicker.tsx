"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export interface MapPickerProps {
  lat: number;
  lng: number;
  onChange: (
    lat: number,
    lng: number,
    addressDetails?: { road?: string; city?: string; district?: string }
  ) => void;
}

function LocationMarker({ lat, lng, onChange }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number]>([lat, lng]);

  useEffect(() => {
    setPosition([lat, lng]);
  }, [lat, lng]);

  useMapEvents({
    async click(e) {
      const newLat = Number(e.latlng.lat.toFixed(4));
      const newLng = Number(e.latlng.lng.toFixed(4));
      setPosition([newLat, newLng]);

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${newLat}&lon=${newLng}&format=json`
        );
        const data = await res.json();
        const addr = data.address || {};
        const road = addr.road || addr.suburb || addr.pedestrian || "";
        const city = addr.city || addr.town || addr.regency || "";
        const district = addr.district || addr.suburb || addr.village || "";

        onChange(newLat, newLng, { road, city, district });
      } catch {
        onChange(newLat, newLng);
      }
    },
  });

  return <Marker position={position} icon={customIcon} />;
}

export default function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  return (
    <div className="h-48 w-full overflow-hidden rounded-2xl border border-soft/40 shadow-inner">
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker lat={lat} lng={lng} onChange={onChange} />
      </MapContainer>
    </div>
  );
}