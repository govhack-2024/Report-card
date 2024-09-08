import { useNavigate } from "react-router-dom";
import { Select } from "@/components/Select";
import { useCompletion } from "./lib/elevation-api";
import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map } from "@/components/Map";
import { AddressSelector } from "./components/AddressSelector";
import { Footer } from "./components/Footer";

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
      <section className=" border border-gray-100 shadow-sm mx-auto max-w-2xl rounded-xl  p-8 bg-white mt-8 max-lg:m-4 max-lg:max-w-none max-sm:p-4">
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
            {/* <Select
              options={options}
              onSelect={({ lat, lon, address }) => {
                navigate(`/results?lat=${lat}&lon=${lon}&address=${address}`);
              }}
              inputValue={query}
              onInputChange={setQuery}
              loading={isLoading}
            /> */}
            {/* Mapbox Search */}
            <AddressSelector />
          </TabsContent>
          <TabsContent value="password">
            <Map />
          </TabsContent>
        </Tabs>
      </section>
      <Footer />
    </>
  );
}

export default App;
