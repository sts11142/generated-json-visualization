import { useBoolean } from "@yamada-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  | "[Reflection of Feelings]"
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
  data: DisplayDataMap;
  error: Error | undefined;
  isLoading: boolean;
};
const useResultData = (models: string[]): UseResultDataProps => {
  const files = models.map((model) => `/sample-data/${model}.json`);
  const { data: jsonData, error, isLoading } = useSWR(files, fetcher);

  const dataMap: DisplayDataMap = {};
  models.forEach((model, idx) => {
    dataMap[model].name = model;
    dataMap[model].data = jsonData ? jsonData[idx] : ([] as Dialogue[]);
  });

  return { data: dataMap, error, isLoading };
};

/* 表示用データを提供する */
function useDisplayData(models: string[]) {
  const { data: displayData, isLoading, error } = useResultData(models);

  /* filtering */
  const [filterdDisplayData, setFilteredDisplayData] =
    useState<DisplayDataMap>(displayData);
  const [targetModelName, setTargetModelName] = useState<ModelData["name"]>(
    displayData[models[0]].name,
  );
  const [targetLabel, setTargetLabel] = useState<Selection>("any") as [
    Selection,
    (value: string) => void,
  ];
  const [isCorrectedLabel, { toggle }] = useBoolean(false); // filter correct strategy
  const [targetDialogueIds, setTmpTargetDialogueIds] = useState<
    Array<Dialogue["id"]>
  >([]);

  /* pagination */
  const displayAmount = 10;
  const [page, onChange] = useState<number>(1);
  const [maxPage, setMaxPage] = useState<number>(
    filterdDisplayData && filterdDisplayData[targetModelName]
      ? Math.ceil(
          filterdDisplayData[targetModelName].data.length / displayAmount,
        )
      : 1,
  );

  const selectableModelNames: string[] = models;
  const selectableLabels: string[] = useMemo(
    () => [
      "any",
      "[Question]",
      "[Restatement or Paraphrasing]",
      "[Reflection of Feelings]",
      "[Self-disclosure]",
      "[Affirmation and Reassurance]",
      "[Providing Suggestions]",
      "[Information]",
      "[Others]",
    ],
    [],
  );

  /* filtering handler */
  const hadleChangeTargetModel = useCallback(
    (modelName: ModelData["name"]) => {
      if (!filterdDisplayData) {
        return;
      }
      setTargetModelName(() => filterdDisplayData[modelName].name);
    },
    [filterdDisplayData],
  );

  const handleChangeTargetLabel = useCallback((label: Selection) => {
    setTargetLabel(label);
  }, []);

  const handleToggleIsCorrected = useCallback(() => toggle(), [toggle]);

  /* update filteredData when dependencies changed */
  useEffect(() => {
    // filtering by target label
    if (targetLabel === "any") {
      setFilteredDisplayData(displayData);
    } else {
      const tmpTargetDialogueIds: Array<Dialogue["id"]> = [];
      // search target dialogue ids (hyp.label === targetLabel) in target model
      displayData[targetModelName].data.forEach((dialogue: Dialogue) => {
        if (isCorrectedLabel) {
          dialogue.hypothesis.strategy === targetLabel &&
          dialogue.hypothesis.strategy === dialogue.reference.strategy
            ? tmpTargetDialogueIds.push(dialogue.id)
            : null;
        } else {
          dialogue.hypothesis.strategy === targetLabel
            ? tmpTargetDialogueIds.push(dialogue.id)
            : null;
        }
      });
      setTmpTargetDialogueIds(() => tmpTargetDialogueIds);

      // filter data in order to match tmpTargetDialogueIds
      //   and store new display data have target dialogue
      const newDataMap: DisplayDataMap = { ...displayData };
      Object.keys(displayData).forEach((modelName: string) => {
        newDataMap[modelName].data = displayData[modelName].data.filter(
          (dialogue: Dialogue) => tmpTargetDialogueIds.includes(dialogue.id),
        );
      });
      setFilteredDisplayData(() => ({ ...newDataMap }));
    }
  }, [displayData, isCorrectedLabel, targetLabel, targetModelName]);

  // data filtering後にペジネーション状態を更新する
  useEffect(() => {
    // pagination proccess
    setMaxPage(() => Math.ceil(targetDialogueIds.length / displayAmount));
    // data proccess
    setFilteredDisplayData((prev) => {
      // filtered?.slice(displayAmount * (page - 1), displayAmount * page),
      const newDataMap = { ...prev };
      Object.keys(prev).forEach((modelName) => {
        newDataMap[modelName].data = prev[modelName].data.slice(
          displayAmount * (page - 1),
          displayAmount * page,
        );
      });
      return newDataMap;
    });
  }, [page, targetDialogueIds.length]);

  return {
    data: filterdDisplayData,
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
      hadleChangeTargetModel,
      selectableLabels,
      targetLabel,
      handleChangeTargetLabel,
    },
    correct: {
      isCorrectedLabel,
      handleToggleIsCorrected,
    },
  };
}

export { useDisplayData, type Dialogue };
