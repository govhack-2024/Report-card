import { useMemo } from "react";
import {
  XYPlot,
  XAxis,
  YAxis,
  AreaSeries,
  LineSeries,
  HorizontalGridLines,
  DiscreteColorLegend,
} from "react-vis";

type DataGraphParams = {
  getLevels: (year: number) => {
    lowTide: number;
    highTide: number;
    elevation: number;
  };
};

const HIGH_TIDE_COLOR = "#07c5f9";
const LOW_TIDE_COLOR = "#ed7512";
const HOUSE_COLOR = "#ed7512";

export const DataGraph = ({ getLevels }: DataGraphParams) => {
  const { highTide, lowTide, elevation } = useMemo(() => {
    const highTide = Array(300);
    const lowTide = Array(300);
    const elevation = Array(300);

    for (let year = 2024; year < 2324; year++) {
      const {
        elevation: predElevation,
        lowTide: predLowTide,
        highTide: predHighTide,
      } = getLevels(year);
      lowTide[year - 2024] = { x: year, y: predLowTide };
      highTide[year - 2024] = { x: year, y: predHighTide };
      elevation[year - 2024] = { x: year, y: predElevation };
    }

    return { highTide, lowTide, elevation };
  }, [getLevels]);

  return (
    <div className="">
      <DiscreteColorLegend
        items={[
          { title: "Spring High Tide", color: HIGH_TIDE_COLOR },
          { title: "Spring Low Tide", color: LOW_TIDE_COLOR },
          { title: "Your property", color: HOUSE_COLOR },
        ]}
        width={300}
        orientation="horizontal"
      />
      <XYPlot width={300} height={300}>
        <HorizontalGridLines />
        <XAxis />
        <YAxis />
        <AreaSeries data={highTide} color={HIGH_TIDE_COLOR} />
        <AreaSeries data={lowTide} color={LOW_TIDE_COLOR} />
        <LineSeries data={elevation} color={HOUSE_COLOR} />
      </XYPlot>
    </div>
  );
};
