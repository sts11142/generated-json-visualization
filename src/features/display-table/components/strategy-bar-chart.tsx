/* eslint-disable @typescript-eslint/naming-convention */
import { BarChart, BarProps } from "@yamada-ui/charts";
import { useMemo } from "react";

type StrategyBarChartProps = {
  name: string;
  data: number[]; // expected strategy_prob data
};
function StrategyBarChart({ name, data }: StrategyBarChartProps) {
  const labels = useMemo(
    () => [
      /* 不明なラベル： "[Reflection of Feelings]", "[Self-disclosure]", "[Information]" */
      "[Question]",
      "1",
      "2",
      "[Restatement or Paraphrasing]",
      "[Others]",
      "5",
      "[Affirmation and Reassurance]",
      "[Providing Suggestions]",
    ],
    [],
  );

  const series: BarProps[] = useMemo(
    () => [
      { dataKey: labels[0], color: "green.500" },
      { dataKey: labels[1], color: "red.500" },
      { dataKey: labels[2], color: "blue.500" },
      { dataKey: labels[3], color: "purple.500" },
      { dataKey: labels[4], color: "orange.500" },
      { dataKey: labels[5], color: "cyan.500" },
      { dataKey: labels[6], color: "yellow.500" },
      { dataKey: labels[7], color: "indigo.500" },
    ],
    [labels],
  );
  const processedData: object[] = useMemo(
    () => [
      {
        name: name,
        "[Question]": data[0],
        1: data[1],
        2: data[2],
        "[Restatement or Paraphrasing]": data[3],
        "[Others]": data[4],
        5: data[5],
        "[Affirmation and Reassurance]": data[6],
        "[Providing Suggestions]": data[7],
      },
    ],
    [name, data],
  );

  return (
    <>
      <BarChart
        data={processedData}
        series={series}
        dataKey="name"
        size="full"
        valueFormatter={(value) => `${(value * 100).toFixed(2)}`}
        unit="%"
        withLegend
        legendProps={{ verticalAlign: "bottom", justifyContent: "center" }}
        tooltipAnimationDuration={300}
        tooltipProps={{ position: { x: 900, y: 0 } }}
      />
    </>
  );
}

export { StrategyBarChart };
