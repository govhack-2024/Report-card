import { LocationRiseResponse } from "./elevation-api";

export interface SeaLevelPoints {
    surge_flood: SeaLevelPoint | null;
    high_tide_flood: SeaLevelPoint | null;
    average_tide_flood: SeaLevelPoint | null;
    low_tide_flood: SeaLevelPoint | null;
    always_flooded: SeaLevelPoint | null;
}


export interface SeaLevelPoint {
    year: number;
    relative_sea_level: number;
    vlm_change: number;
    temperature_increase: number;
}

// https://www.desmos.com/calculator/h5f8sykmft

const math_gmslr_c = 0.00270714;
const math_gmslr_n = 1.3437;

const math_gmt_c = 0.611105;
const math_gmt_n = 0.509114;


export function predictForwardYears(data: LocationRiseResponse, years: number): SeaLevelPoint {
    let vml_change = data.vlm_estimation.rate_mm_per_year * years;
    let sea_level_change = math_gmslr_c * Math.pow(years, math_gmslr_n);
    let temperature_increase = math_gmt_c * Math.pow(years, math_gmt_n);

    return {
        year: years,
        relative_sea_level: sea_level_change - vml_change / 100,
        vlm_change: vml_change,
        temperature_increase
    };
    
}

const search_max = 2000;

// This is what happens when you code while sleep deprived. This is awful.
export function predictFindIntercept(data: LocationRiseResponse): SeaLevelPoints {
    let target_elv = data.current_elevation;
    let current_sea_level = 0;

    let found_points: SeaLevelPoints = {
        surge_flood: null,
        high_tide_flood: null,
        average_tide_flood: null,
        low_tide_flood: null,
        always_flooded: null
    }

    let vlm_change = 0;
    
    // Search through arithmetically increasing years until we find the year where the sea level is at the target elevation
    
    for (let year = 0; year < search_max; year++) {
        current_sea_level = math_gmslr_c * Math.pow(year, math_gmslr_n);
        vlm_change += (data.vlm_estimation.rate_mm_per_year / 1000);
        let temperature_increase = math_gmt_c * Math.pow(year, math_gmt_n);

        let relative_sea_level = current_sea_level - vlm_change;

        if (relative_sea_level + data.tide_estimation.surge_tide_min > target_elv ) {
            if (found_points.always_flooded == null) {
                found_points.always_flooded = {
                    year,
                    relative_sea_level,
                    vlm_change,
                    temperature_increase
                }
            }
            // return found_points;
        }
        if (relative_sea_level + data.tide_estimation.spring_tide_min > target_elv) {
            if (found_points.low_tide_flood == null) {
                found_points.low_tide_flood = {
                    year,
                    relative_sea_level,
                    vlm_change,
                    temperature_increase
                }
    
            }
        }
        if (relative_sea_level > target_elv) {
            if (found_points.average_tide_flood == null) {
                found_points.average_tide_flood = {
                    year,
                    relative_sea_level,
                    vlm_change,
                    temperature_increase
                }
    
            }
        }
        if (relative_sea_level + data.tide_estimation.spring_tide_min > target_elv) {
            if (found_points.high_tide_flood == null) {
                found_points.high_tide_flood = {
                    year,
                    relative_sea_level,
                    vlm_change,
                    temperature_increase
                }
    
            }
        } else if (relative_sea_level + data.tide_estimation.surge_tide_max > target_elv) {
            if (found_points.surge_flood == null) {
                found_points.surge_flood = {
                    year,
                    relative_sea_level,
                    vlm_change,
                    temperature_increase
                }
    
            }
        }

    }

    return found_points;
}