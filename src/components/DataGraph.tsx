import { useMemo } from "react";


import { Area, CartesianGrid, ComposedChart, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { LocationRiseResponse } from "@/lib/elevation-api";
import { predictForwardYears } from "@/lib/climate_model";

const chartConfig = {
  elevation: {
    label: "House Height",
  },
  sea_level_change: {
    label: "The Approaching Sea",
  }
} satisfies ChartConfig

type DataGraphParams = {
  getLevels: () => LocationRiseResponse | null;
  years_to_predict: number;
};

const HIGH_TIDE_COLOR = "#07c5f9";
const LOW_TIDE_COLOR = "#0d47c4";
const HOUSE_COLOR = "#ed7512";

const current_year = new Date().getFullYear();


export const DataGraph = ({ getLevels, years_to_predict }: DataGraphParams) => {
  const { elevation } = useMemo(() => {
    const elevation = Array(years_to_predict);

    const data = getLevels();
    if (!data) {
      return { elevation };
    }

    for (let year = 0; year < years_to_predict; year++) {
      const predictions = predictForwardYears(data, year);
      const tidal_rand = data.tide_estimation.surge_tide_max * 0.2 * Math.sin(year / 16);
      elevation[year] = {
        full_year: year + current_year,
        elevation: data.current_elevation + predictions.vlm_change,
        sea_level_change: predictions.sea_level_change + tidal_rand,
      };
    }

    return { elevation };
  }, [getLevels]);

  return (
    <div className="">
      <Card>
        <CardHeader>
          <CardTitle>Elevation Chart</CardTitle>
          <CardDescription>
            {current_year} - {current_year + 300}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ComposedChart
              accessibilityLayer
              data={elevation}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="full_year"
                tickLine={false}
                interval={"preserveStartEnd"}

                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                dataKey="elevation"
                
                type="natural"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={false}
              />
              <Area
                dataKey="sea_level_change"
                type="natural"
                fill="hsl(var(--chart-2))"
                fillOpacity={0.4}
                stroke="hsl(var(--chart-2))"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 leading-none text-muted-foreground">
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
