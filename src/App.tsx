import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Select } from "@/components/Select";
import { useCompletion } from "./lib/elevation-api";
import { useEffect, useMemo, useState } from "react";

function App() {
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  let loading = false;

  const { data } = useCompletion({ currentQuery: searchQuery });
  const options = useMemo(() => {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map(({ lat_lon, display_name }) => ({
      value: lat_lon,
      label: display_name,
    }));
  }, [data]);

  useEffect(() => {
    const timeout = setTimeout(() => setSearchQuery(query), 1000);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <>
      <section className="mt-8 border border-gray-100 shadow-sm mx-auto max-w-2xl rounded-md  p-8 bg-white">
        <h1 className="">Haxx Water Report</h1>
        <p className="text-gray-500">
          Calculate when your house will be underwater due to sea level rise.
        </p>
        <Select
          options={options}
          onSelect={({ lat, lon }) => {
            navigate(`/results?lat=${lat}&lon=${lon}`);
          }}
          inputValue={query}
          onInputChange={setQuery}
        />
        <Link to="/results">
          <Button variant="default" className="block w-full mt-4">
            Get Results
          </Button>
        </Link>
      </section>
    </>
  );
}

export default App;
