import { useNavigate } from "react-router-dom";
import { Select } from "@/components/Select";
import { useCompletion } from "./lib/elevation-api";
import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map } from "@/components/Map";

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

  return (
    <>
      <section className=" border border-gray-100 shadow-sm mx-auto max-w-2xl rounded-xl  p-8 bg-white mt-[40vh] max-lg:m-4 max-lg:max-w-none">
        <h1 className="text-xl font-semibold">Ocean Tax</h1>
        <p className="text-gray-500 mt-2">
          Find out when your home will be affected by climate change.
        </p>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="w-full gap-1 mt-4">
            <TabsTrigger
              className="bg-transparent data-[state=active]:bg-white flex-1 text-blue-600"
              value="account"
            >
              Search by Address
            </TabsTrigger>
            <TabsTrigger
              className="bg-transparent data-[state=active]:bg-white flex-1  text-blue-600"
              value="password"
            >
              Search on Map
            </TabsTrigger>
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
          </TabsContent>
          <TabsContent value="password">
            <Map />
          </TabsContent>
        </Tabs>
      </section>
      <footer className="mt-8 text-center text-gray-500 max-w-lg mx-auto text-sm">
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
