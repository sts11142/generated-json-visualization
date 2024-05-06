import { useBoolean } from "@yamada-ui/react";
import { useEffect, useState } from "react";
import useSWR, { Fetcher } from "swr";

type DisplayData = Array<{
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
}>;

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

function useDisplayData(url: string) {
  const fetcher: Fetcher<DisplayData> = async (url: string) =>
    fetch(url).then((res) => res.json());

  const { data, error, isLoading } = useSWR(url, fetcher);

  const [displayData, setDisplayData] = useState<DisplayData | undefined>(data);
  const [filtered, setFiltered] = useState<DisplayData | undefined>(data);

  /* pagination */
  const [page, onChange] = useState<number>(1);
  const displayAmount = 10;
  const [maxPage, setMaxPage] = useState<number>(
    displayData ? Math.ceil(displayData?.length / displayAmount) : 1,
  );

  /* filtering */
  const [selectedLabel, setSelectedLabel] = useState<Selection>("any") as [
    Selection,
    (value: string) => void,
  ];
  const selectableLabels: string[] = [
    "any",
    "[Question]",
    "[Restatement or Paraphrasing]",
    "[Reflection of Feelings]",
    "[Self-disclosure]",
    "[Affirmation and Reassurance]",
    "[Providing Suggestions]",
    "[Information]",
    "[Others]",
  ];

  /* filter correct strategy */
  const [isCorrectedLabel, { toggle }] = useBoolean(false);

  useEffect(() => {
    // filtering proccess
    selectedLabel === "any"
      ? setFiltered(data)
      : setFiltered(
          data?.filter((item) => item.hypothesis.strategy === selectedLabel),
        );
    if (isCorrectedLabel) {
      setFiltered(
        data?.filter(
          (item) => item.hypothesis.strategy === item.reference.strategy,
        ),
      );
      setSelectedLabel("any");
    }
  }, [data, isCorrectedLabel, selectedLabel]);

  useEffect(() => {
    // pagination proccess
    setMaxPage(filtered ? Math.ceil(filtered.length / displayAmount) : 1);
    // data proccess
    setDisplayData(() =>
      filtered?.slice(displayAmount * (page - 1), displayAmount * page),
    );
  }, [filtered, page]);

  return {
    data: displayData,
    error,
    loading: isLoading,
    pagination: {
      page,
      maxPage,
      onChange,
    },
    filter: {
      selectableLabels,
      selectedLabel,
      setSelectedLabel,
    },
    correct: {
      isCorrectedLabel,
      toggle,
    },
  };
}

export { useDisplayData, type DisplayData };
