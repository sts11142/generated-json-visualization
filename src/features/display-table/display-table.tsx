/* eslint-disable @typescript-eslint/naming-convention */
import {
  Accordion,
  AccordionItem,
  AccordionLabel,
  AccordionPanel,
  Box,
  Container,
  Divider,
  Grid,
  GridItem,
  NativeTable,
  Skeleton,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@yamada-ui/react";
import { DisplayData } from "./hooks/useDisplayData";
import { StrategyChart } from "./components";
import { useMemo } from "react";

type DisplayTableProps = {
  data: DisplayData | undefined;
  loading?: boolean;
};
function DisplayTable({ data, loading }: DisplayTableProps) {
  const labels = useMemo(
    () => [
      /* 不明なラベル： "[Reflection of Feelings]", "[Self-disclosure]", "[Information]" */
      "[Question]",
      "1",
      "2",
      "[Restatement or Paraphrasing]",
      "[Others]",
      "6",
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
          data &&
          data.map((data) => (
            <Container
              key={data.id}
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
                        {data.id}
                      </Tag>
                    </Text>
                    {data.situation}
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
                          {data.conversations.map((conv, idx) => (
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
                                  <Text
                                    w="10rem"
                                    color="neutral.400"
                                  >
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
                  <VStack pl="sm">
                    <Grid templateColumns="min-content 1fr">
                      <GridItem w="18rem">
                        <Text fontSize="lg">{data.reference.strategy}</Text>
                      </GridItem>
                      <GridItem>
                        <Text fontSize="xl" letterSpacing="wider">
                          {data.reference.response}
                        </Text>
                      </GridItem>
                    </Grid>

                    <Divider color="blackAlpha.300" />

                    <Grid templateColumns="min-content 1fr">
                      <GridItem w="18rem">
                        <Text fontSize="lg">{data.hypothesis.strategy}</Text>
                      </GridItem>
                      <GridItem>
                        <Text fontSize="xl" letterSpacing="wider">
                          {data.hypothesis.response}
                        </Text>
                      </GridItem>
                    </Grid>
                  </VStack>
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
                              name={`target: ${data.id}`}
                              data={data.strategyProb.map((item) =>
                                Number(item.toFixed(4)),
                              )}
                            />
                          </Box>

                          <TableContainer>
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
                          </TableContainer>
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
