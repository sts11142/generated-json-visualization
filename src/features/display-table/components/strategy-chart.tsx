/* eslint-disable @typescript-eslint/naming-convention */
import { AreaChart, AreaProps } from "@yamada-ui/charts";
import { useMemo } from "react";

type ProbComparison = { name: string; data: number[] | undefined };

type ChartData = {
  [key: string]: number;
};

type StrategyBarChartProps = {
  data: number[]; // expected strategy_prob data  [0.2347840815782547, 0.14163683354854584, 0.010241687297821045, 0.1956576108932495, ...]
  baselineData: number[];
  probComparisons?: ProbComparison[];
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

  const series: AreaProps[] = useMemo(() => {
    const dataColors = [
      "sky.200", // ours1-series-cog
      "green.500", // ours1-parallel-res
      "cyan.100", // ours1-parallel-mlp
      "pink.300", // baseline-re
    ];

    const comparisonsSeries: AreaProps[] = probComparisons
      ? probComparisons.map((model, idx) => ({
          dataKey: model.name,
          color: dataColors[idx],
        }))
      : [];

    return probComparisons
      ? [
          { dataKey: "reference", color: "gray.500" },
          { dataKey: "baseline", color: "red.500" },
          { dataKey: "ours1-series", color: "blue.500" }, // target
          ...comparisonsSeries,
        ]
      : [];
  }, [probComparisons]);

  const processedData: object[] = useMemo(() => {
    const result: object[] = [];
    const ESCStrategyOrder = [0, 3, 1, 5, 6, 7, 2, 4]; // 格納されているデータのラベルの順序を、ESConvの論文に基づく並び順に変更する。ESC Framework の 3statesに対応している。

    // 意図した並び順で、チャートに渡すデータを準備する
    ESCStrategyOrder.map((order) => {
      const comparisons = probComparisons
        ? probComparisons.reduce((acc: ChartData, probData: ProbComparison) => {
            acc[probData.name] = probData.data ? probData.data[order] : 0.0;
            return acc;
          }, {} as ChartData)
        : {};

      probComparisons
        ? result.push({
            name: labels[order],
            "ours1-series": data[order],
            baseline: baselineData[order],
            reference: referenceStrategyIdx === order ? 100.0 : 0.0,
            ...comparisons,
          })
        : null;
    });

    return result;
  }, [baselineData, probComparisons, data, labels, referenceStrategyIdx]);

  return (
    <>
      <AreaChart data={processedData} series={series} dataKey="name" unit="%" />
    </>
  );
}

export { StrategyChart };
