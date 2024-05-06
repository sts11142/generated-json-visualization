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

function App() {
  const targetFileName = "20240425_02_ours1_noELoss";

  const { data, loading, pagination, filter, correct } = useDisplayData(
    `/sample-data/${targetFileName}.json`,
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
          <DisplayTable data={data} loading={loading} />
        </Container>
      </Box>
    </>
  );
}

export default App;
