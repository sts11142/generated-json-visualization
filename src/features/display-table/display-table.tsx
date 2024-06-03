/* eslint-disable @typescript-eslint/naming-convention */
import {
  Accordion,
  AccordionItem,
  AccordionLabel,
  AccordionPanel,
  Box,
  Card,
  Container,
  Divider,
  Grid,
  GridItem,
  // NativeTable,
  Skeleton,
  // TableContainer,
  Tag,
  // Tbody,
  // Td,
  Text,
  // Th,
  // Thead,
  // Tr,
  VStack,
} from "@yamada-ui/react";
import { ModelData } from "./hooks/useDisplayData";
import { StrategyChart } from "./components";
import { useMemo } from "react";

type DisplayTableProps = {
  targetData: ModelData;
  baselineData: ModelData;
  comparisonDatas: ModelData[];
  loading?: boolean;
};
function DisplayTable({
  targetData,
  baselineData,
  comparisonDatas,
  loading,
}: DisplayTableProps) {
  const labels = useMemo(
    () => [
      "[Question]",
      "[Reflection of feelings]",
      "[Information]",
      "[Restatement or Paraphrasing]",
      "[Others]",
      "[Self-disclosure]",
      "[Affirmation and Reassurance]",
      "[Providing Suggestions]",
    ],
    [],
  );

  return (
    <>
      {loading && <Skeleton h="xl" />}
      <VStack gap="3xl">
        {!loading &&
          targetData.data.map((dialogue, corpusIdx) => (
            <Container
              key={dialogue.id}
              border="1px solid"
              borderColor="blackAlpha.400"
              borderRadius="xl"
            >
              <VStack gap="lg">
                {/* situation */}
                <Box>
                  <Text as="h2" fontSize="xl" letterSpacing="wider">
                    <Text as="span" mr="md">
                      <Tag variant="outline" size="lg" colorScheme="neutral">
                        {dialogue.id}
                      </Tag>
                    </Text>
                    {dialogue.situation}
                  </Text>
                </Box>

                {/* conversation */}
                <Box>
                  <Accordion
                    variant="card"
                    isToggle={true}
                    // defaultIndex={0}
                  >
                    <AccordionItem>
                      <AccordionLabel fontSize="xl">
                        Conversations
                      </AccordionLabel>
                      <AccordionPanel>
                        <VStack
                          w="94%"
                          gap="lg"
                          paddingBlock="xl"
                          marginInline="auto"
                          divider={<Divider color="blackAlpha.300" />}
                        >
                          {dialogue.conversations.map((conv, idx) => (
                            <Grid
                              key={conv.utterances + idx}
                              templateColumns="min-content min-content 1fr"
                              gap="md"
                              alignItems="center"
                            >
                              <GridItem w="min-content" h="max-content">
                                <Text paddingInline="md">{conv.turns}</Text>
                              </GridItem>
                              <GridItem w="7rem" position="relative">
                                <Tag
                                  variant="outline"
                                  colorScheme={
                                    conv.speaker === "seeker" ? "sky" : "rose"
                                  }
                                  size="lg"
                                >
                                  {conv.speaker}
                                </Tag>
                                {conv.speaker === "supporter" ? (
                                  <Text w="10rem" color="neutral.400">
                                    {conv.strategy}
                                  </Text>
                                ) : null}
                              </GridItem>
                              <GridItem>
                                <Text fontSize="xl" letterSpacing="wider">
                                  {conv.utterances}
                                </Text>
                              </GridItem>
                            </Grid>
                          ))}
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                </Box>

                {/* strategy */}
                <Box>
                  <Card
                    p="md"
                    boxShadow="none"
                    border="2px solid"
                    borderColor="blackAlpha.300"
                  >
                    <VStack pl="sm">
                      <Grid
                        templateColumns="min-content min-content 1fr"
                        alignItems="center"
                      >
                        <GridItem w="8rem">
                          <Text fontSize="lg">reference</Text>
                        </GridItem>
                        <GridItem w="18rem">
                          <Text fontSize="lg">
                            {dialogue.reference.strategy}
                          </Text>
                        </GridItem>
                        <GridItem>
                          <Text fontSize="xl" letterSpacing="wider">
                            {dialogue.reference.response}
                          </Text>
                        </GridItem>
                      </Grid>

                      <Divider color="blackAlpha.300" />

                      <Grid
                        templateColumns="min-content min-content 1fr"
                        alignItems="center"
                      >
                        <GridItem w="8rem">
                          <Text fontSize="lg">baseline</Text>
                        </GridItem>
                        <GridItem w="18rem">
                          <Text fontSize="lg">
                            {baselineData.data[corpusIdx].hypothesis.strategy}
                          </Text>
                        </GridItem>
                        <GridItem>
                          <Text fontSize="xl" letterSpacing="wider">
                            {baselineData.data[corpusIdx].hypothesis.response}
                          </Text>
                        </GridItem>
                      </Grid>

                      <Divider />

                      <Grid
                        templateColumns="min-content min-content 1fr"
                        alignItems="center"
                      >
                        <GridItem w="8rem">
                          <Text fontSize="lg">ours1-series</Text>
                        </GridItem>
                        <GridItem w="18rem">
                          <Text fontSize="lg">
                            {dialogue.hypothesis.strategy}
                          </Text>
                        </GridItem>
                        <GridItem>
                          <Text fontSize="xl" letterSpacing="wider">
                            {dialogue.hypothesis.response}
                          </Text>
                        </GridItem>
                      </Grid>

                      {comparisonDatas.map((model) => (
                        <>
                          <Divider key={model.name} />

                          <Grid
                            key={model.name}
                            templateColumns="min-content min-content 1fr"
                            alignItems="center"
                          >
                            <GridItem w="8rem">
                              <Text fontSize="lg">{model.name}</Text>
                            </GridItem>
                            <GridItem w="18rem">
                              <Text fontSize="lg">
                                {loading
                                  ? model.data[corpusIdx].hypothesis.strategy
                                  : "no data"}
                              </Text>
                            </GridItem>
                            <GridItem>
                              <Text fontSize="xl" letterSpacing="wider">
                                {loading
                                  ? model.data[corpusIdx].hypothesis.response
                                  : "no data"}
                              </Text>
                            </GridItem>
                          </Grid>
                        </>
                      ))}
                    </VStack>
                  </Card>
                </Box>

                {/* strategy_prob */}
                <Box>
                  <Accordion variant="card" isToggle={true} defaultIndex={0}>
                    <AccordionItem>
                      <AccordionLabel fontSize="xl">
                        Strategy Probability (Fact)
                      </AccordionLabel>
                      <AccordionPanel>
                        <VStack pt="md">
                          <Box>
                            <StrategyChart
                              data={dialogue.strategyProb.map((probValue) =>
                                Number(`${(probValue * 100).toFixed(2)}`),
                              )}
                              baselineData={baselineData.data[
                                corpusIdx
                              ].strategyProb.map((probValue) =>
                                Number(`${(probValue * 100).toFixed(2)}`),
                              )}
                              probComparisons={comparisonDatas.map((model) => ({
                                name: model.name,
                                data: loading
                                  ? model.data[corpusIdx].strategyProb.map(
                                      (probValue) =>
                                        Number(
                                          `${(probValue * 100).toFixed(2)}`,
                                        ),
                                    )
                                  : Array.from(new Array(8).fill(0.0)),
                              }))}
                              referenceStrategyIdx={labels.indexOf(
                                dialogue.reference.strategy,
                              )}
                            />
                          </Box>

                          {/* <TableContainer>
                            <NativeTable withBorder>
                              <Thead>
                                <Tr>
                                  {labels.map((label, idx) => (
                                    <Th key={idx} textAlign="center">
                                      {label}
                                    </Th>
                                  ))}
                                </Tr>
                              </Thead>

                              <Tbody>
                                <Tr>
                                  {data.strategyProb.map((float, idx) => (
                                    <Td key={idx} textAlign="center">
                                      {(float * 100).toFixed(2)}%
                                    </Td>
                                  ))}
                                </Tr>
                              </Tbody>
                            </NativeTable>
                          </TableContainer> */}
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                </Box>
              </VStack>
            </Container>
          ))}
      </VStack>
    </>
  );
}

export { DisplayTable };
