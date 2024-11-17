/* eslint-disable @typescript-eslint/naming-convention */
import { useBoolean } from "@yamada-ui/react";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

type Dialogue = {
  id: number;
  situation: string;
  reference: {
    strategy: string;
    response: string;
  };
  hypothesis: {
    strategy: string;
    response: string;
  };
  conversations: Array<{
    speaker: "seeker" | "supporter";
    emotion: string;
    turns: string;
    strategy: string | undefined;
    utterances: string;
  }>;
  strategyProb: number[];
};

type ModelData = {
  name: string;
  data: Dialogue[];
};

type DisplayDataMap = {
  [key: string]: ModelData;
};

type Strategy =
  | "[Question]"
  | "[Restatement or Paraphrasing]"
  | "[Reflection of feelings]"
  | "[Self-disclosure]"
  | "[Affirmation and Reassurance]"
  | "[Providing Suggestions]"
  | "[Information]"
  | "[Others]";

export type Selection = Strategy | "any";

const fetcher = (urls: string[]) => {
  const f = (url: string) =>
    fetch(url).then((res) => res.json() as unknown as Dialogue[]);
  return Promise.all(urls.map(f));
};

type UseResultDataProps = {
  data: DisplayDataMap | undefined;
  error: Error | undefined;
  isLoading: boolean;
};
const useResultData = (models: string[]): UseResultDataProps => {
  const files = models.map((model) => `/sample-data/${model}.json`);
  const { data: jsonData, error, isLoading } = useSWR(files, fetcher);

  const dataMap: DisplayDataMap = useMemo(() => ({}), []);
  models.forEach((model, idx) => {
    dataMap[model] = {
      name: model,
      data: jsonData ? jsonData[idx] : ([] as Dialogue[]),
      // data: jsonData ? jsonData[idx].slice(0, 21) : ([] as Dialogue[]),
    };
  });

  const [displayData, setDisplayData] = useState<DisplayDataMap | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!isLoading) {
      const newDataMap: DisplayDataMap = {};
      models.forEach((model, idx) => {
        newDataMap[model] = {
          name: model,
          data: jsonData ? jsonData[idx] : ([] as Dialogue[]),
        };
      });
      setDisplayData(newDataMap);
    }
  }, [isLoading, jsonData, models]);

  return { data: displayData, error, isLoading };
};

/* 表示用データを提供する */
function useDisplayData(models: string[]) {
  const { data: displayData, isLoading, error } = useResultData(models);

  /* filtering */
  const [filteredData, setFilteredData] = useState<DisplayDataMap | undefined>(
    displayData,
  ); // データフィルタリングの中間データ
  const [filterdDisplayData, setFilteredDisplayData] = useState<
    DisplayDataMap | undefined
  >(displayData);
  const [targetModelName, setTargetModelName] = useState<ModelData["name"]>(
    models[0],
  );
  const [targetLabel, setTargetLabel] = useState<Selection>("any") as [
    Selection,
    (value: string) => void,
  ];
  const [isCorrectedLabel, { toggle }] = useBoolean(false); // filter correct strategy

  /* pagination */
  const displayAmount = useMemo(() => 10, []);
  const [page, onChange] = useState<number>(1);
  const [maxPage, setMaxPage] = useState<number>(1);

  const selectableModelNames: string[] = useMemo(() => models, [models]);
  const selectableLabels: string[] = useMemo(
    () => [
      "any",
      "[Question]",
      "[Restatement or Paraphrasing]",
      "[Reflection of feelings]",
      "[Self-disclosure]",
      "[Affirmation and Reassurance]",
      "[Providing Suggestions]",
      "[Information]",
      "[Others]",
    ],
    [],
  );

  /* update filteredData when dependencies changed */
  useEffect(() => {
    if (!isLoading) {
      /* filtering by target label */
      const tmpTargetDialogueIds: Array<Dialogue["id"]> = [];
      // search target dialogue ids (hyp.label === targetLabel) in target model
      if (displayData) {
        displayData[targetModelName].data.forEach((dialogue: Dialogue) => {
          const isTargetLabel =
            targetLabel === "any" ||
            targetLabel === dialogue.hypothesis.strategy;
          const isCorrect = isCorrectedLabel
            ? dialogue.hypothesis.strategy === dialogue.reference.strategy
            : true;

          // push intended label id
          isTargetLabel && isCorrect
            ? tmpTargetDialogueIds.push(dialogue.id)
            : null;
        });
      }
      // filter data in order to match tmpTargetDialogueIds
      //   and store new display data have target dialogue
      const newDataMap: DisplayDataMap | undefined = displayData
        ? Object.keys(displayData).reduce((acc, modelName) => {
            acc[modelName] = {
              ...displayData[modelName],
              data: displayData[modelName].data.filter((dialogue: Dialogue) =>
                tmpTargetDialogueIds.includes(dialogue.id),
              ),
            };
            return acc;
          }, {} as DisplayDataMap)
        : undefined;
      // pagination max length
      setMaxPage(() =>
        newDataMap
          ? Math.ceil(newDataMap[targetModelName].data.length / displayAmount)
          : 1,
      );
      setFilteredData(newDataMap);
    }
  }, [
    displayData,
    page,
    isCorrectedLabel,
    isLoading,
    targetLabel,
    targetModelName,
    displayAmount,
  ]);

  /* handle changing page */
  useEffect(() => {
    if (!isLoading) {
      // data slice for one page amount
      const pageNum = page <= maxPage ? page : 1;
      if (page >= maxPage) onChange(pageNum);

      let newDataMap: DisplayDataMap | undefined = undefined;
      if (filteredData) {
        newDataMap = Object.keys(filteredData).reduce((acc, modelName) => {
          acc[modelName] = {
            ...filteredData[modelName],
            data: filteredData[modelName].data.slice(
              displayAmount * (pageNum - 1),
              displayAmount * pageNum,
            ),
          };
          return acc;
        }, {} as DisplayDataMap);
      }
      setFilteredDisplayData(newDataMap);
    }
  }, [displayAmount, filteredData, isLoading, maxPage, page]);

  return {
    displayData: filterdDisplayData,
    error,
    loading: isLoading,
    pagination: {
      page,
      maxPage,
      onChange,
    },
    filter: {
      selectableModelNames,
      targetModelName,
      onChangeTargetModelName: setTargetModelName,
      selectableLabels,
      targetLabel,
      onChangeTargetLabel: setTargetLabel,
    },
    correct: {
      isCorrectedLabel,
      onChangeIsCorrectedLabel: toggle,
    },
  };
}

export { useDisplayData, type Dialogue, type ModelData };
