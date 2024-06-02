import {
  Box,
  Checkbox,
  Container,
  Flex,
  HStack,
  Option,
  Pagination,
  Select,
  Text,
  VStack,
} from "@yamada-ui/react";
import { DisplayTable } from "./features/display-table";
import { useDisplayData } from "./features/display-table/hooks/useDisplayData";
import { useMemo } from "react";

function App() {
  const targetNames = [
    "baseline",
    "ours1-series",
    "ours1-series-cog",
    "ours1-parallel-mlp",
    "ours1-parallel-res",
  ];
  const targetFiles = targetNames.map((name) => `/sample-data/${name}.json`);

  const {
    data: ours1seriesData,
    loading,
    pagination,
    filter,
    correct,
  } = useDisplayData(targetFiles[1]);

  const { data: baselineData } = useDisplayData(targetFiles[0]);
  const { data: ours1serieslight } = useDisplayData(targetFiles[2]);
  const { data: ours1parallelmlp } = useDisplayData(targetFiles[3]);
  const { data: ours1parallelres } = useDisplayData(targetFiles[4]);

  const comparableDatas = useMemo(
    () => [
      {
        name: "ours1-series-cog",
        data: ours1serieslight,
      },
      {
        name: "ours1-paralell-res",
        data: ours1parallelres,
      },
      {
        name: "ours1-parallel-mlp",
        data: ours1parallelmlp,
      },
    ],
    [ours1parallelmlp, ours1parallelres, ours1serieslight],
  );

  return (
    <>
      <Box w="full" h="full" bgColor="white">
        <VStack
          w="full"
          paddingBlock="md"
          position="sticky"
          top="0"
          bgColor="white"
          border="1px solid"
          borderColor="blackAlpha.400"
          boxShadow="base"
          zIndex="freeza"
        >
          {/* pagination */}
          <Pagination
            page={pagination.page}
            onChange={pagination.onChange}
            total={pagination.maxPage}
            siblings={2}
            withEdges
            size="lg"
            w="min-content"
            marginInline="auto"
          />

          {/* filtering for strategy */}
          <Box marginInline="auto">
            <HStack gap="xl">
              <Flex gap="md" w="max-content" align="center">
                <Text>hypothesis strategy is: </Text>
                <Select
                  value={filter.selectedLabel}
                  onChange={filter.setSelectedLabel}
                  placeholderInOptions={false}
                  placeholder="filter Strategy"
                  defaultValue={filter.selectableLabels[0]}
                  w="sm"
                >
                  {filter.selectableLabels.map((item) => (
                    <Option key={item} value={item}>
                      {item}
                    </Option>
                  ))}
                </Select>
              </Flex>
              <Box>
                <Checkbox
                  size="lg"
                  isChecked={correct.isCorrectedLabel}
                  onChange={correct.toggle}
                >
                  correct strategy
                </Checkbox>
              </Box>
            </HStack>
          </Box>
        </VStack>
        <Container
          w="80%"
          minH="2xl"
          marginInline="auto"
          marginBlock="xl"
          border="1px solid"
          borderColor="blackAlpha.400"
          borderRadius="xl"
        >
          <DisplayTable
            targetData={ours1seriesData}
            baselineData={baselineData}
            comparisonDatas={comparableDatas}
            loading={loading}
          />
        </Container>
      </Box>
    </>
  );
}

export default App;
