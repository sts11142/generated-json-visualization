import { useEffect, useMemo, useState } from "react";
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

function useDisplayData(url: string) {
  const fetcher: Fetcher<DisplayData> = async (url: string) =>
    fetch(url).then((res) => res.json());

  const { data, error, isLoading } = useSWR(url, fetcher);

  const [page, onChange] = useState<number>(1);

  const displayAmount = 10;
  const maxPage = useMemo(
    () => (data ? Math.ceil(data?.length / displayAmount) : 1),
    [data],
  );
  const [displayData, setDisplayData] = useState<DisplayData | undefined>(
    undefined,
  );

  useEffect(() => {
    setDisplayData(() =>
      data?.slice(displayAmount * (page - 1), displayAmount * page),
    );
  }, [data, page]);

  return {
    data: displayData,
    error,
    loading: isLoading,
    pagination: {
      page,
      maxPage,
      onChange
    }
  };
}

export { useDisplayData, type DisplayData };
