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
  Skeleton,
  Tag,
  Text,
  VStack,
} from "@yamada-ui/react";
import { ModelData } from "./hooks/useDisplayData";
import { StrategyChart } from "./components";
import { useMemo } from "react";

type DisplayTableProps = {
  targetData: ModelData;
  baselineData: ModelData;
  comparisonsData: ModelData[];
  loading?: boolean;
  targetModelName?: string;
};
function DisplayTable({
  targetData,
  baselineData,
  comparisonsData,
  loading,
  targetModelName,
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

  // const [baselineRe, comparisons] = [
  //   comparisonsData[0],
  //   comparisonsData.slice(1),
  // ];
  const comparisons = comparisonsData

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

                {/* prediction */}
                <Box>
                  <Card
                    p="md"
                    boxShadow="none"
                    border="2px solid"
                    borderColor="blackAlpha.300"
                  >
                    <VStack
                      pl="sm"
                      divider={<Divider color="blackAlpha.300" />}
                    >
                      {/* reference */}
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

                      {/* baseline */}
                      <Grid
                        templateColumns="min-content min-content 1fr"
                        alignItems="center"
                      >
                        <GridItem w="8rem">
                          <Text
                            fontSize="lg"
                            fontWeight={
                              targetModelName === baselineData.name
                                ? "bold"
                                : undefined
                            }
                          >
                            {baselineData.name}
                          </Text>
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

                      {/* <Grid
                        templateColumns="min-content min-content 1fr"
                        alignItems="center"
                      >
                        <GridItem w="8rem">
                          <Text
                            fontSize="lg"
                            fontWeight={
                              targetModelName === baselineRe.name
                                ? "bold"
                                : undefined
                            }
                          >
                            {baselineRe.name}
                          </Text>
                        </GridItem>
                        <GridItem w="18rem">
                          <Text fontSize="lg">
                            {baselineRe.data[corpusIdx].hypothesis.strategy}
                          </Text>
                        </GridItem>
                        <GridItem>
                          <Text fontSize="xl" letterSpacing="wider">
                            {baselineRe.data[corpusIdx].hypothesis.response}
                          </Text>
                        </GridItem>
                      </Grid> */}

                      {/* target */}
                      <Grid
                        templateColumns="min-content min-content 1fr"
                        alignItems="center"
                      >
                        <GridItem w="8rem">
                          <Text
                            fontSize="lg"
                            fontWeight={
                              targetModelName === targetData.name
                                ? "bold"
                                : undefined
                            }
                          >
                            {targetData.name}
                          </Text>
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

                      {comparisons.map((model: ModelData, idx) => (
                        <Grid
                          key={model.name + idx}
                          templateColumns="min-content min-content 1fr"
                          alignItems="center"
                        >
                          <GridItem w="8rem">
                            <Text
                              fontSize="lg"
                              fontWeight={
                                targetModelName === model.name
                                  ? "bold"
                                  : undefined
                              }
                            >
                              {model.name}
                            </Text>
                          </GridItem>
                          <GridItem w="18rem">
                            <Text fontSize="lg">
                              {!loading
                                ? model.data[corpusIdx].hypothesis.strategy
                                : "no data"}
                            </Text>
                          </GridItem>
                          <GridItem key={model.name + idx}>
                            <Text fontSize="xl" letterSpacing="wider">
                              {!loading
                                ? model.data[corpusIdx].hypothesis.response
                                : "no data"}
                            </Text>
                          </GridItem>
                        </Grid>
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
                            {!loading ? (
                              <StrategyChart
                                data={dialogue.strategyProb.map((probValue) =>
                                  Number(`${(probValue * 100).toFixed(2)}`),
                                )}
                                baselineData={baselineData.data[
                                  corpusIdx
                                ].strategyProb.map((probValue) =>
                                  Number(`${(probValue * 100).toFixed(2)}`),
                                )}
                                probComparisons={comparisonsData.map(
                                  (model) => ({
                                    name: model.name,
                                    data: !loading
                                      ? model.data[corpusIdx].strategyProb.map(
                                          (probValue) =>
                                            Number(
                                              `${(probValue * 100).toFixed(2)}`,
                                            ),
                                        )
                                      : Array.from(new Array(8).fill(0.0)),
                                  }),
                                )}
                                referenceStrategyIdx={labels.indexOf(
                                  dialogue.reference.strategy,
                                )}
                              />
                            ) : null}
                          </Box>
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
