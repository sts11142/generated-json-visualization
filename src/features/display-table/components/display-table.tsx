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
  Skeleton,
  Tag,
  Text,
  VStack,
} from "@yamada-ui/react";
import { DisplayData } from "../hooks/useDisplayData";

type DisplayTableProps = {
  data: DisplayData | undefined;
  loading?: boolean;
};
function DisplayTable({ data, loading }: DisplayTableProps) {
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
                                    // position="absolute"
                                    // top="0"
                                    // left="0"
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
              </VStack>
            </Container>
          ))}
      </VStack>
    </>
  );
}

export { DisplayTable };
