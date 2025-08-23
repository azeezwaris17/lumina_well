// src/layouts/AuthLayout.js
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Container,
  Box,
  Grid,
  GridItem,
  Flex,
  Heading,
  Text,
  Button,
  Stack,
  Center,
  useToast,
} from "@chakra-ui/react";
import { TbHealthRecognition } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { fetchQuotes, selectAllQuotes } from "../store/slices/quoteSlice";
import theme from "@/themes/theme";

const AuthLayout = ({ heading = "", form, role }) => {
  const toast = useToast();
  const dispatch = useDispatch();
  const quotes = useSelector(selectAllQuotes);
  const loading = useSelector((state) => state.quotes?.loading);
  const error = useSelector((state) => state.quotes?.error);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // Memoized quote fetching to prevent unnecessary re-renders
  const fetchQuotesData = useCallback(async () => {
    try {
      const resultAction = await dispatch(fetchQuotes());
      if (fetchQuotes.fulfilled.match(resultAction)) {
        return resultAction.payload;
      } else {
        throw new Error(resultAction.error?.message || "Failed to fetch quotes");
      }
    } catch (err) {
      console.error("Error fetching quotes:", err);
      toast({
        title: "Failed to load quotes",
        description: "Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return [];
    }
  }, [dispatch, toast]);

  // Fetch quotes only once on component mount
  useEffect(() => {
    if (quotes.length === 0) {
      fetchQuotesData();
    }
  }, [fetchQuotesData, quotes.length]);

  // Set up quote rotation interval
  useEffect(() => {
    if (quotes.length > 1) {
      const intervalId = setInterval(() => {
        setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
      }, 5000); // Increased to 5 seconds for better UX

      return () => clearInterval(intervalId);
    }
  }, [quotes.length]); // Only depend on quotes.length

  const currentQuote = quotes.length > 0 ? quotes[currentQuoteIndex] : null;

  return (
    <Grid
      h="100vh"
      w="100vw"
      templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
      gap={4}
      alignItems="center"
    >
      {/* Quote Section */}
      <GridItem w="100%" display={{ base: "none", md: "block" }}>
        <Container centerContent>
          <Box w="full" maxW="md" p={8}>
            {loading && (
              <Text fontSize="lg" textAlign="center">
                Loading inspirational quotes...
              </Text>
            )}
            
            {error && (
              <Text fontSize="lg" textAlign="center" color="red.500">
                Stay positive! {error}
              </Text>
            )}
            
            {!loading && !error && currentQuote && (
              <Center>
                <Flex flexDirection="column">
                  <Text fontSize="lg" fontWeight="bold" textAlign="center">
                    &quot;{currentQuote.text}&quot;
                  </Text>
                  <Text fontSize="sm" mt={2} color="gray.500" alignSelf="end">
                    - {currentQuote.author || "Unknown"}
                  </Text>
                </Flex>
              </Center>
            )}
            
            {!loading && !error && quotes.length === 0 && (
              <Text fontSize="lg" textAlign="center">
                No quotes available
              </Text>
            )}
          </Box>
        </Container>
      </GridItem>

      {/* Form Section */}
      <GridItem w="100%">
        <Container centerContent>
          <Box w="full" maxW="md" bg="white" p={8} rounded="lg" shadow="lg">
            <Flex alignItems="center" justify="center" gap={4} mb={6}>
              <Heading size="lg">{heading}</Heading>
              <TbHealthRecognition
                color={theme.colors?.customBlue[500]}
                size="36px"
              />
            </Flex>

            {/* Form component */}
            {form}
            
            <Stack spacing={4} mt={6}>
              {heading.includes("Login") ? (
                <>
                  <Text fontSize="sm" color="gray.600">
                    Don&apos;t have an account yet?{" "}
                    <Link href={`/auth/register/${role}`} passHref legacyBehavior>
                      <Button as="a" variant="link" colorScheme="customBlue">
                        Register
                      </Button>
                    </Link>
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Forgot password?{" "}
                    <Link href={`/auth/reset-password/${role}`} passHref legacyBehavior>
                      <Button as="a" variant="link" colorScheme="customBlue">
                        Reset
                      </Button>
                    </Link>
                  </Text>
                </>
              ) : (
                <Text fontSize="sm" color="gray.600">
                  Already registered?{" "}
                  <Link href={`/auth/login/${role}`} passHref legacyBehavior>
                    <Button as="a" variant="link" colorScheme="customBlue">
                      Login
                    </Button>
                  </Link>
                </Text>
              )}
            </Stack>
          </Box>
        </Container>
      </GridItem>
    </Grid>
  );
};

export default React.memo(AuthLayout);