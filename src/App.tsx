import { Link, useNavigate } from "react-router-dom";
import { Select } from "@/components/Select";
import { LatLon, useCompletion } from "./lib/elevation-api";
import { useEffect, useMemo, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY;

function App() {
  const [query, setQuery] = useState("");
  const [waiting, setWaiting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const { data, isLoading } = useCompletion({
    currentQuery: searchQuery.trim().replace(/,/g, ""),
  });
  const options = useMemo(() => {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map(({ lat_lon, display_name }) => ({
      value: { address: display_name, ...lat_lon },
      label: display_name,
    }));
  }, [data]);

  useEffect(() => {
    if (!waiting) {
      setWaiting(true);
      setTimeout(() => {
        setSearchQuery(query);
      }, 1000);
    } else {
      return () => {};
    }
  }, [query]);

  useEffect(() => {
    if (waiting && !isLoading) {
      setTimeout(() => setWaiting(false), 1000);
    }
  }, [waiting, isLoading]);

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
    <>
      <section className=" border border-gray-100 shadow-sm mx-auto max-w-2xl rounded-xl  p-8 bg-white mt-[40vh] max-lg:m-4 max-lg:max-w-none">
        <h1 className="text-xl font-semibold">Ocean Tax</h1>
        <p className="text-gray-500">
          Select a New Zealand address to find out when your house will be
          affected by climate change.
        </p>

        <Tabs defaultValue="account" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="account">Search by Address</TabsTrigger>
            <TabsTrigger value="password">Search on Map</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <Select
              options={options}
              onSelect={({ lat, lon, address }) => {
                navigate(`/results?lat=${lat}&lon=${lon}&address=${address}`);
              }}
              inputValue={query}
              onInputChange={setQuery}
              loading={isLoading}
            />

            {pinLocation ? (
              <Link
                to={`/Results?lat=${pinLocation.lat}&lon=${pinLocation.lon}`}
              >
                <button>Check at pin location</button>
              </Link>
            ) : (
              <></>
            )}
          </TabsContent>
          <TabsContent value="password">
            {" "}
            <div className="relative w-full h-[20rem]">
              <div ref={mapDiv} className="map-container w-full h-full"></div>
            </div>
          </TabsContent>
        </Tabs>
      </section>
      <footer className="mt-8 text-center text-gray-500 max-w-xl mx-auto ">
        <p>
          Built for the Govhack 2024 Hackathon by{" "}
          <a
            className="text-inherit underline font-normal"
            href="https://jmw.nz"
          >
            Jasper Miller-Waugh
          </a>
          ,{" "}
          <a
            className="text-inherit underline font-normal"
            href="https://laspruca.nz"
          >
            Connor Hare
          </a>
          ,{" "}
          <a
            className="text-inherit underline font-normal"
            href="https://linktr.ee/haunanipao"
          >
            Haunani Pao
          </a>
          ,{" "}
          <a
            className="text-inherit underline font-normal"
            href="https://www.linkedin.com/in/steffanie-r/"
          >
            Steffanie Relucio
          </a>
          ,{" "}
          <a
            className="text-inherit underline font-normal"
            href="https://www.linkedin.com/in/elle-lum"
          >
            Elle Lum
          </a>
          ,{" "}
          <a
            className="text-inherit underline font-normal"
            href="https://www.linkedin.com/in/uxwithjade/"
          >
            Jade Lim
          </a>
          ,{" "}
          <a
            className="text-inherit underline font-normal"
            href="https://www.linkedin.com/in/johncaveishere/"
          >
            John Cave
          </a>
          ,{" "}
          <a
            className="text-inherit underline font-normal"
            href="https://walt.online"
          >
            Walter Lim
          </a>
          .
        </p>
      </footer>
    </>
  );
}

export default App;
