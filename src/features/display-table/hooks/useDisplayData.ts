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

  const dataMap: DisplayDataMap = useMemo(() => ({}), []);
  models.forEach((model, idx) => {
    dataMap[model] = {
      name: model,
      data: jsonData ? jsonData[idx] : ([] as Dialogue[])
      // data: jsonData ? jsonData[idx].slice(0, 21) : ([] as Dialogue[]),
    };
  });

  const [displayData, setDisplayData] = useState<DisplayDataMap>(dataMap);

  useEffect(() => {
    if (!isLoading) {
      const newDataMap: DisplayDataMap = {};
      models.forEach((model, idx) => {
        newDataMap[model] = {
          name: model,
          data: jsonData ? jsonData[idx] : ([] as Dialogue[]),
          // data: jsonData ? jsonData[idx].slice(0, 21) : ([] as Dialogue[]),
        };
      });

      setDisplayData(newDataMap);
      console.log("load: ", displayData);
      console.log("\n\n");
    }
  }, [isLoading, jsonData, models]);

  return { data: displayData, error, isLoading };
};

/* 表示用データを提供する */
function useDisplayData(models: string[]) {
  const { data: displayData, isLoading, error } = useResultData(models);

  /* filtering */
  const [filterdDisplayData, setFilteredDisplayData] = useState<DisplayDataMap>(
    { ...displayData },
  );
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
      "[Reflection of Feelings]",
      "[Self-disclosure]",
      "[Affirmation and Reassurance]",
      "[Providing Suggestions]",
      "[Information]",
      "[Others]",
    ],
    [],
  );

  // const handleChangeModelName = useCallback(() => {
  //   handleFilteringData();
  //   // handleChangePage();
  //   return setTargetModelName;
  // }, [handleFilteringData]);

  // const handleChangeLabel = useCallback(() => {
  //   handleFilteringData();
  //   handleChangePage();
  //   return setTargetLabel;
  // }, [handleFilteringData]);

  /* update filteredData when dependencies changed */
  useEffect(() => {
    console.log("filtering start");

    if (!isLoading) {
      /* filtering by target label */
      const tmpTargetDialogueIds: Array<Dialogue["id"]> = [];

      // console.log("display data: ", displayData);

      // search target dialogue ids (hyp.label === targetLabel) in target model
      displayData[targetModelName].data.forEach((dialogue: Dialogue) => {
        const isTargetLabel =
          targetLabel === "any" || targetLabel === dialogue.hypothesis.strategy;
        const isCorrect = isCorrectedLabel
          ? dialogue.hypothesis.strategy === dialogue.reference.strategy
          : true;

        // push intended label id
        isTargetLabel && isCorrect
          ? tmpTargetDialogueIds.push(dialogue.id)
          : null;

        // console.log("isCorrect: ", isCorrect);
        // console.log("isTargetLabel: ", isTargetLabel);
      });
      // console.log("tmp target dialogues: ", tmpTargetDialogueIds);
      // setTargetDialogueIds(tmpTargetDialogueIds);

      // filter data in order to match tmpTargetDialogueIds
      //   and store new display data have target dialogue
      // console.log("display data: ", displayData);
      // const newDataMap: DisplayDataMap = { ...displayData };
      // Object.keys(displayData).forEach((modelName: string) => {
      //   newDataMap[modelName].data = displayData[modelName].data.filter(
      //     (dialogue: Dialogue) => tmpTargetDialogueIds.includes(dialogue.id),
      //   );
      // });
      const newDataMap: DisplayDataMap = Object.keys(displayData).reduce(
        (acc, modelName) => {
          acc[modelName] = {
            ...displayData[modelName],
            data: displayData[modelName].data.filter((dialogue: Dialogue) =>
              tmpTargetDialogueIds.includes(dialogue.id),
            ),
          };
          return acc;
        },
        {} as DisplayDataMap,
      );
      setFilteredDisplayData(() => ({ ...newDataMap }));
      // console.log("display data: ", displayData);
      // console.log("newDatamap", newDataMap);
      // console.log(targetModelName, targetLabel);

      console.log("filtering end");
      console.log("\n\n");
    }
  }, [displayData, isCorrectedLabel, isLoading, targetLabel, targetModelName]);

  /* handle changing page */
  useEffect(() => {
    console.log("pagination start");
    // console.log("bef data: ", displayData);

    if (!isLoading) {
      // console.log("bef data: ", displayData);

      // pagination max length
      setMaxPage(() =>
        Math.ceil(displayData[targetModelName].data.length / displayAmount),
      );

      // console.log(Object.keys(filterdDisplayData));
      // console.log(
      //   "max page: ",
      //   Math.ceil(displayData[targetModelName].data.length / displayAmount),
      // );
      // console.log("page: ", page);
      // console.log(
      //   `in filtering, ${displayAmount * (page - 1)} ~ ${displayAmount * page}`,
      // );
      // console.log("bef data: ", displayData);

      // data slice for one page amount
      const newDataMap = Object.keys(displayData).reduce((acc, modelName) => {
        acc[modelName] = {
          ...displayData[modelName],
          data: displayData[modelName].data.slice(
            displayAmount * (page - 1),
            displayAmount * page,
          ),
        };
        return acc;
      }, {} as DisplayDataMap);
      setFilteredDisplayData({ ...newDataMap });

      // console.log("new data: ", newDataMap);

      console.log("pagination end");
      console.log("\n\n");
    }
  }, [displayAmount, displayData, isLoading, page, targetModelName]);

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
