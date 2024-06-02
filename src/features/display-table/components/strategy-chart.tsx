/* eslint-disable @typescript-eslint/naming-convention */
import { AreaChart, AreaProps } from "@yamada-ui/charts";
import { useMemo } from "react";

type StrategyBarChartProps = {
  data: number[]; // expected strategy_prob data  [0.2347840815782547, 0.14163683354854584, 0.010241687297821045, 0.1956576108932495, ...]
  baselineData: number[];
  probComparisons?: Array<{ name: string; data: number[] | undefined }>;
  referenceStrategyIdx: number;
};
function StrategyChart({
  data,
  baselineData,
  probComparisons,
  referenceStrategyIdx,
}: StrategyBarChartProps) {
  const labels = useMemo(
    () => [
      // MISCの実装に基づく並び順
      "[Question]",
      "[Reflection of feelings]",
      "[Information]",
      "[Restatement or Paraphrasing]",
      "[Others]",
      "[Self-disclosure]",
      "[Affirmation and Reassurance]",
      "[Providing Suggestions]",
    ],
    [],
  );

  const series: AreaProps[] = useMemo(
    () =>
      probComparisons
        ? [
            { dataKey: "reference", color: "gray.500" },
            { dataKey: "baseline", color: "red.500" },
            { dataKey: "ours1-series", color: "blue.500" },
            { dataKey: probComparisons[0].name, color: "green.400" },
            { dataKey: probComparisons[1].name, color: "violet.300" },
            { dataKey: probComparisons[2].name, color: "cyan.100" },
          ]
        : [],
    [probComparisons],
  );

  const processedData: object[] = useMemo(() => {
    const result: object[] = [];
    const ESCStrategyOrder = [0, 3, 1, 5, 6, 7, 2, 4]; // ESConv の論文に基づく並び順。ESC Framework の 3states。

    ESCStrategyOrder.map((order) => {
      probComparisons
        ? result.push({
            name: labels[order],
            "ours1-series": data[order],
            baseline: baselineData[order],
            [probComparisons[0].name]:
              probComparisons && probComparisons[0].data
                ? probComparisons[0].data[order]
                : 0.0,
            [probComparisons[1].name]:
              probComparisons && probComparisons[1].data
                ? probComparisons[1].data[order]
                : 0.0,
            [probComparisons[2].name]:
              probComparisons && probComparisons[2].data
                ? probComparisons[2].data[order]
                : 0.0,
            reference: referenceStrategyIdx === order ? 100.0 : 0.0,
          })
        : null;
    });

    return result;
  }, [baselineData, probComparisons, data, labels, referenceStrategyIdx]);

  return (
    <>
      {/* <BarChart
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
      /> */}

      <AreaChart
        data={processedData}
        series={series}
        dataKey="name"
        curveType="linear"
        // curveType="step"
        unit="%"
      />
    </>
  );
}

export { StrategyChart };
