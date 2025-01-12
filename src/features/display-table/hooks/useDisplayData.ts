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
  );
  const [filterdDisplayData, setFilteredDisplayData] = useState<
    DisplayDataMap | undefined
  >(displayData);

  // モデル名とストラテジーのフィルター
  const [targetModelName, setTargetModelName] = useState<ModelData["name"]>(
    models[0],
  );
  const [targetLabel, setTargetLabel] = useState<Selection>("any") as [
    Selection,
    (value: string) => void,
  ];

  // コレクトラベルかどうか
  const [isCorrectedLabel, { toggle }] = useBoolean(false);

  // ▼ 検索用 ID（テキスト入力を想定）
  //   - 呼び出し元から文字列で渡ってくる想定
  const [searchId, setSearchId] = useState<string>("");

  // ページネーション
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

  /**
   * フィルター条件に応じて `filteredData` を更新
   */
  useEffect(() => {
    if (!isLoading && displayData) {
      const tmpTargetDialogueIds: Array<Dialogue["id"]> = [];

      // 検索用 ID のバリデーション（空白のみなら無視）
      const trimmedSearchId = searchId.trim();
      const searchIdNumber = trimmedSearchId ? Number(trimmedSearchId) : null;

      // 選択中のモデルから、フィルターに合致する dialogue.id を抽出
      displayData[targetModelName].data.forEach((dialogue: Dialogue) => {
        // 1. ラベル (targetLabel) チェック
        const isTargetLabel =
          targetLabel === "any" || targetLabel === dialogue.hypothesis.strategy;

        // 2. コレクトラベル (isCorrectedLabel) チェック
        const isCorrect = isCorrectedLabel
          ? dialogue.hypothesis.strategy === dialogue.reference.strategy
          : true;

        // 3. 検索用 ID (searchIdNumber) がセットされている場合のチェック
        //    - searchIdNumber が null や NaN なら無視する
        const isMatchSearchId =
          searchIdNumber && !Number.isNaN(searchIdNumber)
            ? dialogue.id === searchIdNumber
            : true;

        // すべての条件を通過したら ID を収集する
        if (isTargetLabel && isCorrect && isMatchSearchId) {
          tmpTargetDialogueIds.push(dialogue.id);
        }
      });

      // 対象となる Dialogue ID のみを残す
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

      // ページ最大数を再計算
      setMaxPage(
        Math.ceil(newDataMap[targetModelName].data.length / displayAmount) || 1,
      );
      setFilteredData(newDataMap);
    }
  }, [
    displayData,
    isLoading,
    targetModelName,
    targetLabel,
    isCorrectedLabel,
    searchId, // ★ ここが追加ポイント
    displayAmount,
  ]);

  /**
   * ページネーション用に `filterdDisplayData` を更新
   */
  useEffect(() => {
    if (!isLoading && filteredData) {
      // ページ数が最大を超えていたら 1 ページ目に戻す
      const pageNum = page <= maxPage ? page : 1;
      if (page !== pageNum) onChange(pageNum);

      // 1 ページあたりの表示件数で絞り込む
      const newDataMap: DisplayDataMap = Object.keys(filteredData).reduce(
        (acc, modelName) => {
          acc[modelName] = {
            ...filteredData[modelName],
            data: filteredData[modelName].data.slice(
              displayAmount * (pageNum - 1),
              displayAmount * pageNum,
            ),
          };
          return acc;
        },
        {} as DisplayDataMap,
      );
      setFilteredDisplayData(newDataMap);
    }
  }, [filteredData, isLoading, page, maxPage, displayAmount]);

  /**
   * 呼び出し元で `searchId` を更新したいときに使用する関数
   */
  const onChangeSearchId = (value: string) => {
    setSearchId(value);
    // ページネーションもリセットしておく（好みに応じる）
    onChange(1);
  };

  return {
    displayData: filterdDisplayData,
    error,
    loading: isLoading,
    // ペジネーション関連
    pagination: {
      page,
      maxPage,
      onChange,
    },
    // モデルやラベルのフィルター関連
    filter: {
      selectableModelNames,
      targetModelName,
      onChangeTargetModelName: setTargetModelName,
      selectableLabels,
      targetLabel,
      onChangeTargetLabel: setTargetLabel,
    },
    // ラベルが合っているかどうかの判定
    correct: {
      isCorrectedLabel,
      onChangeIsCorrectedLabel: toggle,
    },
    // ★ 検索 ID 関連
    search: {
      searchId,
      onChangeSearchId, // 呼び出し元で検索文字列を渡す
    },
  };
}

export { useDisplayData, type Dialogue, type ModelData };
