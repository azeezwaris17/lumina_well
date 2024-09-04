// src/components/admin/dashboard/AdminHeader.js
import { useState } from "react";
import { FiHome, FiUser, FiPlus, FiLogOut } from "react-icons/fi";
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";

const AdminHeader = ({ setComponent, onLogout }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const handleNavigation = (component) => {
    setComponent(component);
    setIsNavOpen(false);
  };

  return (
    <Box
      as="header"
      bg={useColorModeValue("blue.600", "blue.800")}
      p={4}
      position="relative"
    >
      <Flex justify="space-between" align="center">
        <Heading as="h1" color="white" fontSize="2xl">
          User Dashboard
        </Heading>

        <IconButton
          aria-label="Open Navigation"
          icon={<FiHome />}
          color="white"
          display={{ base: "block", md: "none" }}
          onClick={() => setIsNavOpen(!isNavOpen)}
        />
      </Flex>

      <Box
        as="nav"
        display={{ base: isNavOpen ? "block" : "none", md: "block" }}
        position={{ base: "absolute", md: "relative" }}
        top={{ base: 16, md: 0 }}
        left={0}
        width={{ base: "full", md: "auto" }}
        bg={{ base: "blue.600", md: "transparent" }}
      >
        <VStack
          as="ul"
          spacing={4}
          p={4}
          display={{ base: "block", md: "flex" }}
          alignItems="start"
        >
          <Flex as="li" align="center">
            <FiHome className="mr-2" />
            <Button
              variant="link"
              color="white"
              onClick={() => handleNavigation("Dashboard")}
            >
              Dashboard
            </Button>
          </Flex>
          <Flex as="li" align="center">
            <FiUser className="mr-2" />
            <Button
              variant="link"
              color="white"
              onClick={() => handleNavigation("Steps")}
            >
              Steps
            </Button>
          </Flex>
          <Flex as="li" align="center">
            <FiPlus className="mr-2" />
            <Button
              variant="link"
              color="white"
              onClick={() => handleNavigation("Hydration")}
            >
              Hydration
            </Button>
          </Flex>
          <Flex as="li" align="center">
            <FiPlus className="mr-2" />
            <Button
              variant="link"
              color="white"
              onClick={() => handleNavigation("Mood")}
            >
              Mood
            </Button>
          </Flex>
          <Flex as="li" align="center">
            <FiPlus className="mr-2" />
            <Button
              variant="link"
              color="white"
              onClick={() => handleNavigation("Dietary")}
            >
              Dietary
            </Button>
          </Flex>
          <Flex as="li" align="center">
            <FiPlus className="mr-2" />
            <Button
              variant="link"
              color="white"
              onClick={() => handleNavigation("Sleep")}
            >
              Sleep
            </Button>
          </Flex>
          <Flex as="li" align="center">
            <FiPlus className="mr-2" />
            <Button
              variant="link"
              color="white"
              onClick={() => handleNavigation("Weight")}
            >
              Weight
            </Button>
          </Flex>
          <Flex as="li" align="center">
            <FiLogOut className="mr-2" />
            <Button variant="link" color="white" onClick={onLogout}>
              Logout
            </Button>
          </Flex>
        </VStack>
      </Box>
    </Box>
  );
};

export default AdminHeader;
