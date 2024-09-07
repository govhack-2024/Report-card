import { Link, useSearchParams } from "react-router-dom";
import { useLocationRise } from "./lib/elevation-api";
import { useCallback } from "react";
import { DataGraph } from "./components/DataGraph";
import { predictFindIntercept } from "./lib/climate_model";

function Results() {
  const [searchParams] = useSearchParams();

  const latlon = {
    lat: Number(searchParams.get("lat")),
    lon: Number(searchParams.get("lon")),
  };

  const { data, isLoading } = useLocationRise(latlon);

  const getData = useCallback(
    (year: number) => {
      if (data && !("message" in data)) {
        return {
          elevation: data.current_elevation + Math.sin(year) / 100,
          lowTide: data.tide_estimation.spring_tide_min + year / 1000,
          highTide: data.tide_estimation.spring_tide_max + year / 1000,
        };
      }

      return {
        elevation: 0,
        lowTide: 0,
        highTide: 0,
      };
    },
    [data],
  );

  if (!searchParams.has("lat") || !searchParams.has("lon")) {
    return <>Please set the lat and lon parameters</>;
  }

  if (isLoading || !data) {
    return <>Loading</>;
  }

  if ("message" in data) {
    return <>Error fetching data: {data.message}</>;
  }

  let start_time = new Date();
  let predictions = predictFindIntercept(data);
  let end_time = new Date();
  console.log("Time taken MS: ", end_time.getTime() - start_time.getTime());

  return (
    <>
      <section className="mt-8 border border-gray-100 shadow-sm mx-auto max-w-2xl rounded-md  p-8 bg-white">
        <Link to="/">Back </Link>
        <h1 className="text-lg">Report Card</h1>
        <p className="text-gray-500">
          This is a report card for the Vite + React setup.
        </p>
        <DataGraph getLevels={getData} />
        <section className="my-4  rounded-lg border border-gray-200">
          <h2 className="p-4 border-b font-semibold">Timeline</h2>
          <p className="p-4">Surge Flood: {predictions.surge_flood?.year || "Never!"}</p>
          <p className="p-4">High Tide Flood: {predictions.high_tide_flood?.year || "Never!"}</p>
          <p className="p-4">On Average Flooded: {predictions.average_tide_flood?.year || "Never!"}</p>
          <p className="p-4">Low Tide Flood: {predictions.low_tide_flood?.year || "Never!"}</p>
          <p className="p-4">Always Underwater: {predictions.always_flooded?.year || "Never!"}</p>


        </section>
        <section className="my-4  rounded-lg border border-gray-200">
          <h2 className="p-4 border-b font-semibold">Current elevation</h2>
          <p className="p-4">{data.current_elevation}</p>
        </section>
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
