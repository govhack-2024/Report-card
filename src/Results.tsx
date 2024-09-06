import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

function Results() {
  return (
    <>
      <section className="mt-8 border border-gray-100 shadow-sm mx-auto max-w-2xl rounded-md  p-8 bg-white">
        <Link to="/">Back </Link>
        <h1 className="text-lg">Report Card</h1>
        <p className="text-gray-500">
          This is a report card for the Vite + React setup.
        </p>
        <section className="my-4  rounded-lg border border-gray-200">
          <h2 className="p-4 border-b font-semibold">Title</h2>
          <p className="p-4">Stat</p>
        </section>{" "}
        <section className="my-4  rounded-lg border border-gray-200">
          <h2 className="p-4 border-b font-semibold">Title</h2>
          <p className="p-4">Stat</p>
        </section>{" "}
        <section className="my-4  rounded-lg border border-gray-200">
          <h2 className="p-4 border-b font-semibold">Title</h2>
          <p className="p-4">Stat</p>
        </section>{" "}
        <section className="my-4  rounded-lg border border-gray-200">
          <h2 className="p-4 border-b font-semibold">Title</h2>
          <p className="p-4">Stat</p>
        </section>{" "}
        <section className="my-4  rounded-lg border border-gray-200">
          <h2 className="p-4 border-b font-semibold">Title</h2>
          <p className="p-4">Stat</p>
        </section>
      </section>
    </>
  );
}

export default Results;
