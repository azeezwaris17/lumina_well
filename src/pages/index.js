import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  IconButton,
  Stack,
} from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import { TbHealthRecognition } from "react-icons/tb";
import theme from "@/themes/theme";

const LandingPage = () => {
  const router = useRouter();
  const [role, setRole] = useState("user" || router.query);

  const handleRoleChange = (event) => {
    setRole(event.target.value);
  };

  const handleRegisterClick = () => {
    router.push(`/auth/register/${role}`);
  };

  const handleLoginClick = () => {
    router.push(`/auth/login/${role}`);
  };

  useEffect(() => {
    const saveQuotes = async () => {
      try {
        const res = await fetch("/api/saveQuotes");
        const data = await res.json();
        console.log(data.message);
      } catch (err) {
        console.error("Failed to save quotes:", err);
      }
    };

    saveQuotes();
  }, []);

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      {/* Header */}
      <Box
        as="header"
        bg="customWhite.50"
        py={4}
        boxShadow="xl"
        borderBottom="customGray"
        color="customBlack"
      >
        <Container maxW="container.xl">
          <Flex justifyContent="space-between" alignItems="center">
            <Flex alignItems="center">
              <TbHealthRecognition
                color={theme.colors.customBlue[500]}
                size="36px"
              />
              <Heading color="customBlue.500" ml={3} fontSize="2xl">
                LuminaWell
              </Heading>
            </Flex>
            <Flex>
              <Button
                colorScheme="customGray.700"
                variant="outline"
                mr={4}
                display="none"
                // display={{ base: "none", md: "block" }}
                onClick={handleRegisterClick}
              >
                Register
              </Button>
              <Button
                variant="ghost"
                colorScheme="customBlue"
                rightIcon={<ArrowForwardIcon />}
                onClick={handleLoginClick}
              >
                Login
              </Button>
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        as="main"
        flex="1"
        bgImage="url('/undraw_workout_gcgu.svg')"
        bgSize="cover"
        bgPosition="center"
        color="white"
        borderBottom="customGray"
      >
        <Container maxW="container.xl" py={20}>
          <Stack
            direction={{ base: "column", md: "row" }}
            align="center"
            spacing={8}
            textAlign={{ base: "center", md: "left" }}
          >
            <VStack spacing={5} maxW="lg" alignItems="flex-start">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
              >
                <Heading fontSize="4xl" color="customGray.900">
                  Your Health, Our Priority at LuminaWell
                </Heading>
              </motion.div>
              <Text fontSize="lg" color="customGray.700">
                Manage your health effortlessly with our state-of-the-art tools
                and resources. Track your progress, access personalized advice,
                and ensure a healthier future for you and your loved ones.
              </Text>
              <Flex
                gap={4}
                justifyContent={{ base: "center", md: "flex-start" }}
                alignItems="center"
              >
                <Button
                  colorScheme="customBlue"
                  size="lg"
                  onClick={handleRegisterClick}
                  display={{ base: "none", md: "block" }}
                >
                  Get Started
                </Button>
                <Button
                  colorScheme="customWhite"
                  size="lg"
                  variant="outline"
                  onClick={handleLoginClick}
                  display={{ base: "none", md: "block" }}
                >
                  Learn More
                </Button>
              </Flex>
            </VStack>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box as="section" py={12}>
        <Container maxW="container.xl">
          <Heading textAlign="center" mb={8} fontSize="3xl">
            Why Choose LuminaWell?
          </Heading>
          <HStack spacing={8} justify="space-between" flexWrap="wrap">
            <VStack
              bg="white"
              p={6}
              borderRadius="lg"
              shadow="lg"
              flexBasis={{ base: "100%", md: "30%" }}
            >
              <Heading fontSize="xl" color="customGray.800">
                Comprehensive Tracking
              </Heading>
              <Text textAlign="center" color="customGray.600">
                Monitor your health metrics in real-time with our easy-to-use
                tools and dashboards.
              </Text>
            </VStack>
            <VStack
              bg="white"
              p={6}
              borderRadius="lg"
              shadow="md"
              flexBasis={{ base: "100%", md: "30%" }}
            >
              <Heading fontSize="xl" color="customGray.800">
                Personalized Insights
              </Heading>
              <Text textAlign="center" color="customGray.600">
                Receive tailored health advice based on your unique data and
                goals.
              </Text>
            </VStack>
            <VStack
              bg="white"
              p={6}
              borderRadius="lg"
              shadow="md"
              flexBasis={{ base: "100%", md: "30%" }}
            >
              <Heading fontSize="xl" color="customGray.800">
                Secure & Private
              </Heading>
              <Text textAlign="center" color="customGray.600">
                Your data is protected with industry-leading security standards.
              </Text>
            </VStack>
          </HStack>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box as="section" borderTop="customGray.700" py={12}>
        <Container maxW="container.xl" textAlign="center">
          <Heading fontSize="3xl" mb={4}>
            Ready to Take Control of Your Health?
          </Heading>
          <Text fontSize="lg" mb={8}>
            Join LuminaWell today and start your journey towards a healthier,
            happier
          </Text>
          <Button
            colorScheme="customBlue"
            size="lg"
            onClick={handleRegisterClick}
          >
            Get Started
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box as="footer" bg="customGray.900" color="white" py={8}>
        <Container maxW="container.xl" centerContent>
          <Flex
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
          >
            <HStack alignItems="flex-start">
              <Heading fontSize="lg">LuminaWell</Heading>
              <Text fontSize="sm" color="customGray.400">
                © {new Date().getFullYear()} LuminaWell. All rights reserved.
              </Text>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
