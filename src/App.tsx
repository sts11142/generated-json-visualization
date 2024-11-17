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
  const modelNames = useMemo(
    () => [
      "baseline-origin",
      // "ours1-series", // target
      // "baseline", // baseline
      // "re-ours1-series",
      // "re-baseline",
      // "re-ours1-series-hardfixed-2",
      // "re-ours1-series-hardfixed-3",
      // "ours1-series-cog",
      // "ours1-parallel-res",
      // "ours1-parallel-mlp",
      // "ours3",
      // "ours4-stage-simple-series",
      // "ours1-series-focal-loss-g2",
      // "cfm-misc",
      "cfm-ours1",
      // "cfm-ours1-wo-knwlg",
    ],
    [],
  );
  const [baseline, target, ...comparisons] = modelNames;

  const { displayData, loading, pagination, filter, correct } =
    useDisplayData(modelNames);

  return (
    <>
      <Box w="full" h="full" bgColor="white">
        {/* header content */}
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
                <Select
                  value={filter.targetModelName}
                  onChange={filter.onChangeTargetModelName}
                  placeholderInOptions={false}
                  defaultValue={filter.selectableModelNames[0]}
                  w="sm"
                >
                  {filter.selectableModelNames.map((name) => (
                    <Option key={name} value={name}>
                      {name}
                    </Option>
                  ))}
                </Select>
                <Text>-</Text>
                <Select
                  value={filter.targetLabel}
                  onChange={filter.onChangeTargetLabel}
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
                  onChange={correct.onChangeIsCorrectedLabel}
                >
                  correct prediction
                </Checkbox>
              </Box>
            </HStack>
          </Box>
        </VStack>

        {/* main content */}
        <Container
          w="80%"
          minH="2xl"
          marginInline="auto"
          marginBlock="xl"
          border="1px solid"
          borderColor="blackAlpha.400"
          borderRadius="xl"
        >
          {displayData ? (
            <DisplayTable
              targetData={displayData[target]}
              baselineData={displayData[baseline]}
              comparisonsData={comparisons.map((model) => displayData[model])}
              loading={loading}
              targetModelName={filter.targetModelName}
            />
          ) : null}
        </Container>
      </Box>
    </>
  );
}

export default App;
