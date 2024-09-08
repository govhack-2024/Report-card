import { Link, useSearchParams } from "react-router-dom";
import { useLocationRise } from "./lib/elevation-api";
import { useCallback } from "react";
import { DataGraph } from "./components/DataGraph";
import { predictFindIntercept, predictForwardYears } from "./lib/climate_model";

function Results() {
  const [searchParams] = useSearchParams();

  const latlon = {
    lat: Number(searchParams.get("lat")),
    lon: Number(searchParams.get("lon")),
  };

  const address = searchParams.get("address") ?? "";

  const { data, isLoading } = useLocationRise({ address, ...latlon });

  const getData = useCallback(
    () => {
      if (data && !("message" in data)) {
        return data
      }

      return null;
    },
    [data],
  );

  if (
    !searchParams.has("lat") ||
    !searchParams.has("lon") ||
    !searchParams.has("address")
  ) {
    return <>Please set the lat and lon and address parameters</>;
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
        <p className="text-gray-500">{address}</p>
        <DataGraph getLevels={getData} years_to_predict={predictions.always_flooded?.year ?? 300} />
        <section className="my-4  rounded-lg border border-gray-200">
          <h2 className="p-4 border-b font-semibold">Timeline</h2>
          <p className="p-4">
            Surge Flood: {predictions.surge_flood?.year || "Never!"}
          </p>
          <p className="p-4">
            High Tide Flood: {predictions.high_tide_flood?.year || "Never!"}
          </p>
          <p className="p-4">
            On Average Flooded:{" "}
            {predictions.average_tide_flood?.year || "Never!"}
          </p>
          <p className="p-4">
            Low Tide Flood: {predictions.low_tide_flood?.year || "Never!"}
          </p>
          <p className="p-4">
            Always Underwater: {predictions.always_flooded?.year || "Never!"}
          </p>
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
        Street
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
