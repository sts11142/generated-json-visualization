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

export function useDisplayData(url: string) {
  const fetcher: Fetcher<DisplayData> = async (url: string) =>
    fetch(url).then((res) => res.json());

  const { data, error, isLoading } = useSWR(url, fetcher);

  return { data, error, loading: isLoading };
}
