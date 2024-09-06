import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Select from "react-select";
const options = [
  { value: "chocolate", label: "Chocolate" },
  { value: "strawberry", label: "Strawberry" },
  { value: "vanilla", label: "Vanilla" },
];
function App() {
  return (
    <>
      <section className="mt-8 border border-gray-100 shadow-sm mx-auto max-w-2xl rounded-md  p-8 bg-white">
        <h1 className="">Report Card</h1>
        <p className="text-gray-500">
          This is a report card for the Vite + React setup.
        </p>
        <Select
          options={options}
          className="text-start"
          placeholder="Enter your address to start"
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
