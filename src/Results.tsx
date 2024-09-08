import { Link, useSearchParams } from "react-router-dom";
import { useLocationRise } from "./lib/elevation-api";
import { useCallback } from "react";
import { DataGraph } from "./components/DataGraph";
import { predictFindIntercept, predictForwardYears } from "./lib/climate_model";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function Results() {
  const btn = document.getElementById("share");

  if (btn) {
    btn.addEventListener("click", function () {
      navigator.share({
        url: document.URL,
        title: document.title,
        text: "Find out how long your perty has left before it's underwater",
      });
    });
  }
  const [searchParams] = useSearchParams();

  const latlon = {
    lat: Number(searchParams.get("lat")),
    lon: Number(searchParams.get("lon")),
  };

  const address = searchParams.get("address") ?? undefined;

  const { data, isLoading } = useLocationRise({ address, ...latlon });

  const getSmallestPositiveNumber = (predictions) => {
    return (
      Object.values(predictions)
        .filter((value) => typeof value === "number" && value > 0)
        .sort((a, b) => a - b)[0] || 0
    ); // Providing a fallback value if no positive numbers found
  };

  const getData = useCallback(() => {
    if (data && !("message" in data)) {
      return data;
    }

    return null;
  }, [data]);

  if (!searchParams.has("lat") || !searchParams.has("lon")) {
    return <>Please set the lat and lon and address parameters</>;
  }

  if (isLoading || !data) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <p>Loading</p>
      </div>
    );
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
      <section className="mt-4  mx-auto max-w-2xl rounded-md  p-8 ">
        <div className="p-4 bg-white border-gray-200 shadow-sm rounded-md">
          <h2 className="text-sm font-semibold"> Report for</h2>
          <p className="text-black text-sm">{address}</p>{" "}
        </div>
        <div className=" border rounded-md shadow-sm mb-4  mt-4 bg-white">
          <p className="text-xs border-b  p-4">
            Assuming nothing changes about carbon emissions..
          </p>

          <div className="p-4">
            <h2 className=" text-md">Your property will be underwater in: </h2>

            <h2 className="mt-2 text-4xl">
              {predictions
                ? Object.values(predictions).sort((a, b) => a - b)[0].year
                : "~"}
              &nbsp;Years
            </h2>
          </div>
        </div>
        {/* <div className=" border rounded-md shadow-sm mb-4  mt-4 bg-white">
          <p className="text-xs border-b p-4">Climate change impact</p>
          <div className="flex">
            <div className="flex-1 border-r p-4">
              <p className="text-sm text-gray-600">Cost per year</p>
              <h4 className="text-lg">$12,000 </h4>
              <p className="text-xs mt-2 text-gray-600">
                Until your house becomes unliveable
              </p>
            </div>

            <div className="flex-1 p-4">
              <p className="text-sm text-gray-600">Assuming a valuation of</p>
              <h4 className="text-lg">$120,000 </h4>
              <a
                className="text-xs mt-2 text-blue-600"
                href="https://www.aucklandcouncil.govt.nz/property-rates-valuations/pages/find-property-rates-valuation.aspx"
                target="_blank"
              >
                View Source
              </a>
            </div>
          </div>
        </div> */}
        <DataGraph
          getLevels={getData}
          years_to_predict={predictions.always_flooded?.year ?? 300}
        />
        <div className="bg-white flex flex-col gap-4 p-4 rounded-lg mt-4 shadow-sm">
          <section className="mb-4  rounded-lg border border-gray-200 bg-white">
            <h2 className="p-4  text-xs ">
              Stats for nerds &amp; modelling assumptions:
            </h2>
            <div className="p-4 border-t">
              {" "}
              <p className="font-semibold mb-3">Disclaimer</p>
              <ul className="list-disc list-outside pl-8 space-y-3">
                <li>Sea level rise is not necessarily linear</li>
                <li>If the emissions stop, the warming stops</li>
                <li className="">
                  {" "}
                  Drawdown is entirely technically possible (highly probable
                  that the Little Ice Age may have been caused by reforestation
                  in the americas after the columbian genocide)
                </li>
                <li>
                  If we remove greehouse gases the planet will cool over time,
                  it’s physics
                </li>
              </ul>
            </div>

            <div className="p-4 flex border-t flex-wrap">
              <h3 className="text-xs font-semibold">Surge Flood result: </h3>{" "}
              <p className="text-xs">
                {predictions.surge_flood?.year
                  ? `${predictions.surge_flood.year} Years`
                  : " Never!"}
              </p>
            </div>
            <div className="p-4 flex border-t flex-wrap">
              <h3 className="text-xs font-semibold">
                {" "}
                High Tide Flood result:{" "}
              </h3>{" "}
              <p className="text-xs">
                {predictions.high_tide_flood?.year
                  ? `${predictions.high_tide_flood.year} Years`
                  : "Never!"}
              </p>
            </div>

            <div className="p-4 flex border-t flex-wrap">
              <h3 className="text-xs font-semibold">
                {" "}
                On Average Flooded result:{" "}
              </h3>{" "}
              <p className="text-xs">
                {predictions.high_tide_flood?.year
                  ? `${predictions.high_tide_flood.year} Years`
                  : "Never!"}
              </p>
            </div>

            <div className="p-4 flex border-t flex-wrap">
              <h3 className="text-xs font-semibold">
                Average Tide Flood result:{" "}
              </h3>{" "}
              <p className="text-xs ">
                {predictions.average_tide_flood?.year || "Never!"}
              </p>
            </div>
            <div className="p-4 flex border-t flex-wrap">
              <h3 className="text-xs font-semibold">Low tide flood result: </h3>{" "}
              <p className="text-xs">
                {predictions.low_tide_flood?.year || "Never!"}
              </p>
            </div>
            <div className="p-4 flex border-t flex-wrap">
              <h3 className="text-xs font-semibold">
                Always underwater result:{" "}
              </h3>{" "}
              <p className="text-xs">
                {predictions.always_flooded?.year || "Never!"}
              </p>
            </div>

            <div className="p-4 flex border-t flex-wrap">
              <h3 className="text-xs font-semibold">Current elevation : </h3>
              <p className=" text-xs">
                &nbsp;
                {data.current_elevation.toFixed(2)} meters above sea level
              </p>
            </div>
            <div className="p-4 flex border-t flex-wrap">
              <h3 className="text-xs font-semibold">
                Surge tide estimation :{" "}
              </h3>
              <p className=" text-xs">
                {data.tide_estimation.surge_tide_min} -{" "}
                {data.tide_estimation.surge_tide_max}
              </p>
            </div>
            <div className="p-4 border-t flex flex-wrap">
              <h3 className="text-xs font-semibold">
                Spring tide estimation :{" "}
              </h3>
              <p className=" text-xs">
                {data.tide_estimation.spring_tide_min} -{" "}
                {data.tide_estimation.spring_tide_max}
              </p>
            </div>
            <div className="p-4 border-t flex flex-wrap">
              <h3 className="text-xs font-semibold">Neap Tide estimation : </h3>
              <p className=" text-xs">
                {data.tide_estimation.neap_tide_min} -{" "}
                {data.tide_estimation.neap_tide_max}
              </p>
            </div>
            <div className="p-4 border-t flex flex-col gap-2 flex-wrap">
              <h3 className="text-xs font-semibold">
                Vertical land movement estimation :{" "}
              </h3>
              <p className=" text-xs">
                lat: {data.vlm_estimation.closest_site.lat_lon.lat}
              </p>
              <p className=" text-xs">
                lon: {data.vlm_estimation.closest_site.lat_lon.lon}&nbsp;
              </p>
              <p className=" text-xs">
                rate mm per year: {data.vlm_estimation.rate_mm_per_year}
              </p>
            </div>
          </section>
        </div>
        <div className="bg-white flex flex-col gap-4 p-4 rounded-lg mt-4 shadow-sm">
          <button
            id="share"
            className="px-8 py-2 bg-blue-600 text-white rounded-md block text-center hover:text-blue-50 hover:bg-blue-700 w-full"
          >
            Share Result{" "}
          </button>
          <Link
            to="/"
            className="px-8 py-2 border-2 border-blue-600 text-blue-600 rounded-md block text-center hover:text-blue-50 hover:bg-blue-700"
          >
            Try another address{" "}
          </Link>
        </div>
      </section>
      <footer className="mt-8 text-center text-gray-500 max-w-lg mx-auto text-sm max-lg:my-4 max-lg:w-full">
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

export default Results;
