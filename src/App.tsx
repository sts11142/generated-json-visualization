import { Box, Container } from "@yamada-ui/react";
import { DisplayTable } from "./features/display-table";

function App() {
  const targetFileName = "20240425_02_ours1_noELoss"

  return (
    <>
      <Box w="full" h="full" bgColor="white">
        <Container
          w="80%"
          minH="2xl"
          marginInline="auto"
          marginBlock="xl"
          border="1px solid"
          borderColor="blackAlpha.400"
          borderRadius="xl"
        >
          <DisplayTable targetFileName={targetFileName}/>
        </Container>
      </Box>
    </>
  );
}

export default App;
