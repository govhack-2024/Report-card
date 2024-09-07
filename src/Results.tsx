import { Link, useSearchParams } from "react-router-dom";
import { useLocationRise } from "./lib/elevation-api";

function Results() {
  const [searchParams] = useSearchParams();

  const { data, isLoading } = useLocationRise({
    lat: Number(searchParams.get("lat")),
    lon: Number(searchParams.get("lon")),
  });

  if (!searchParams.has("lat") || !searchParams.has("lon")) {
    return <>Please set the lat and lon parameters</>;
  }

  if (isLoading || !data) {
    return <>Loading</>;
  }

  if ("message" in data) {
    return <>Error fetching data: {data.message}</>;
  }

  return (
    <>
      <section className="mt-8 border border-gray-100 shadow-sm mx-auto max-w-2xl rounded-md  p-8 bg-white">
        <Link to="/">Back </Link>
        <h1 className="text-lg">Report Card</h1>
        <p className="text-gray-500">
          This is a report card for the Vite + React setup.
        </p>
        <section className="my-4  rounded-lg border border-gray-200">
          <h2 className="p-4 border-b font-semibold">Current elevation</h2>
          <p className="p-4">{data.current_elevation}</p>
        </section>{" "}
        <section className="my-4  rounded-lg border border-gray-200">
          <h2 className="p-4 border-b font-semibold">
            Vertical land movent estimation
          </h2>
          <p className="p-4">
            lat: {data.vlm_estimation.closest_site.lat_lon.lat} lon:{" "}
            {data.vlm_estimation.closest_site.lat_lon.lon} rate mm per year:{" "}
            {data.vlm_estimation.rate_mm_per_year}
          </p>
        </section>{" "}
        <section className="my-4  rounded-lg border border-gray-200">
          <h2 className="p-4 border-b font-semibold">Neap Tide estimation</h2>
          <p className="p-4">
            {data.tide_estimation.neap_tide_min} -{" "}
            {data.tide_estimation.neap_tide_max}
          </p>
        </section>{" "}
        <section className="my-4  rounded-lg border border-gray-200">
          <h2 className="p-4 border-b font-semibold">Spring Tide estiamtion</h2>
          <p className="p-4">
            {data.tide_estimation.spring_tide_min} -{" "}
            {data.tide_estimation.spring_tide_max}
          </p>
        </section>{" "}
        <section className="my-4  rounded-lg border border-gray-200">
          <h2 className="p-4 border-b font-semibold">Surge tide estimation</h2>
          <p className="p-4">
            {data.tide_estimation.surge_tide_min} -{" "}
            {data.tide_estimation.surge_tide_max}
          </p>
        </section>
      </section>
    </>
  );
}

export default Results;
