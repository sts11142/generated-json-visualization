import { Box, Container } from "@yamada-ui/react";

function App() {
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
          main contents
        </Container>
      </Box>
    </>
  );
}

export default App;
