import * as React from "react";
import * as ReactDOM from "react-dom/client";
import App from "./App.tsx";
import About from "./About.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Results from "./Results.tsx";
import "./lib/elevation-api.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/results",
    element: <Results />,
  },
  {
    path: "/about",
    element: <About />,
  }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  </QueryClientProvider>,
);
