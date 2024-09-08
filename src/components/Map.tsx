import { LatLon } from "@/lib/elevation-api";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY;

export const Map = () => {
  const mapDiv = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const pin = useRef<mapboxgl.Marker | null>(null);

  const [pinLocation, setDroppedPin] = useState<LatLon | undefined>(undefined);

  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapDiv.current!,
      center: { lat: -36.8594224, lon: 174.5413166 },
      zoom: 7,
    });

    map.current.on("click", (clickEvent) => {
      const { lat, lng } = clickEvent.lngLat;
      setDroppedPin({
        lon: lng,
        lat,
      });
    });
  });

  useEffect(() => {
    if (!pinLocation) {
      if (pin.current) {
        pin.current.remove();
      }

      pin.current = null;
      return;
    }

    if (!pin.current) {
      pin.current = new mapboxgl.Marker()
        .setLngLat(pinLocation)
        .addTo(map.current!);
    } else {
      pin.current.setLngLat(pinLocation);
    }
  }, [pinLocation]);

  return (
    <div className="flex flex-col justify-center items-center w-full gap-2">
      <div className="relative w-full h-[20rem]">
        <div ref={mapDiv} className="map-container w-full h-full"></div>
      </div>

      {pinLocation ? (
        <Link to={`/Results?lat=${pinLocation.lat}&lon=${pinLocation.lon}`}>
          <button>Check at pin location</button>
        </Link>
      ) : (
        <></>
      )}
    </div>
  );
};
