import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_ELEVATION_URL;

export type ElevationApiError = { message: string };
export type CompletionRequest = { query: string };
export type LatLon = { lat: number; lon: number };

export type CompletionResponse = {
  osm_id: number;
  category: string;
  display_name: string;
  lat_lon: LatLon;
  place_rank: number;
}[];

export type LocationRiseResponse = {
  lat_lon: LatLon;
  vlm_estimation: {
    closest_site: {
      site_id: number;
      lat_lon: LatLon;
      vertical_rate_bop_corrected: number;
      sigma_uncertainty: number;
      quality_factor: number;
    };
    rate_mm_per_year: number;
  };
  current_elevation: number;
  tide_estimation: {
    site_id: number;
    location: string;
    lat_lon: LatLon;
    spring_tide_max: number;
    spring_tide_min: number;
    neap_tide_max: number;
    neap_tide_min: number;
    surge_tide_max: number;
    surge_tide_min: number;
  };
};

type UseCompletionOptions = {
  currentQuery: string;
};

export const useCompletion = ({ currentQuery }: UseCompletionOptions) => {
  return useQuery({
    queryKey: ["address-completion", currentQuery],
    queryFn: async () => {
      if (currentQuery.trim() == "") {
        return [];
      }
      let query = currentQuery;
      if (query) {
        query += " new zealand";
      }

      const request = await fetch(
        `${API_URL}/api/completion?query=${encodeURIComponent(query)}`,
      );

      const json = await request.json();

      if (request.status == 200) {
        return json as CompletionResponse;
      } else {
        return json as ElevationApiError;
      }
    },
  });
};

type UseLocationRiseOptions = LatLon;
export const useLocationRise = ({ lat, lon }: UseLocationRiseOptions) =>
  useQuery({
    queryKey: ["elevation", lat, lon],
    queryFn: async () => {
      const request = await fetch(
        `${API_URL}/api/rise_model?lat=${lat}&lon=${lon}`,
      );

      const json = await request.json();

      if (request.status == 200) {
        return json as LocationRiseResponse;
      } else {
        return json as ElevationApiError;
      }
    },
  });
