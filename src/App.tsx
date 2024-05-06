import { Box, Container, Pagination, VStack } from "@yamada-ui/react";
import { DisplayTable } from "./features/display-table";
import { useDisplayData } from "./features/display-table/hooks/useDisplayData";

function App() {
  const targetFileName = "20240425_02_ours1_noELoss";

  const { data, loading, pagination } = useDisplayData(
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
        >
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
