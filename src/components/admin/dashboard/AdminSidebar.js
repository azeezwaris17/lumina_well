// src/components/admin/dashboard/AdminSidebar.js
import React from "react";
import { FiHome, FiUser, FiPlus, FiLogOut } from "react-icons/fi";
import { Box, Button, Flex, Icon, VStack } from "@chakra-ui/react";

const AdminSidebar = ({ setComponent, onLogout }) => {
  return (
    <Box
      as="aside"
      display={{ base: "none", md: "flex" }}
      bg="gray.800"
      color="white"
      w="64"
      flexShrink={0}
      p={4}
    >
      <VStack as="ul" spacing={4} align="start" width="full">
        <Flex as="li" align="center" width="full">
          <Icon as={FiHome} mr={2} />
          <Button
            variant="link"
            color="white"
            onClick={() => setComponent("Dashboard")}
            width="full"
            textAlign="left"
          >
            Dashboard
          </Button>
        </Flex>
        <Flex as="li" align="center" width="full">
          <Icon as={FiUser} mr={2} />
          <Button
            variant="link"
            color="white"
            onClick={() => setComponent("Steps")}
            width="full"
            textAlign="left"
          >
            Steps
          </Button>
        </Flex>
        <Flex as="li" align="center" width="full">
          <Icon as={FiPlus} mr={2} />
          <Button
            variant="link"
            color="white"
            onClick={() => setComponent("Hydration")}
            width="full"
            textAlign="left"
          >
            Hydration
          </Button>
        </Flex>
        <Flex as="li" align="center" width="full">
          <Icon as={FiPlus} mr={2} />
          <Button
            variant="link"
            color="white"
            onClick={() => setComponent("Mood")}
            width="full"
            textAlign="left"
          >
            Mood
          </Button>
        </Flex>
        <Flex as="li" align="center" width="full">
          <Icon as={FiPlus} mr={2} />
          <Button
            variant="link"
            color="white"
            onClick={() => setComponent("Dietary")}
            width="full"
            textAlign="left"
          >
            Dietary
          </Button>
        </Flex>
        <Flex as="li" align="center" width="full">
          <Icon as={FiPlus} mr={2} />
          <Button
            variant="link"
            color="white"
            onClick={() => setComponent("Sleep")}
            width="full"
            textAlign="left"
          >
            Sleep
          </Button>
        </Flex>
        <Flex as="li" align="center" width="full">
          <Icon as={FiPlus} mr={2} />
          <Button
            variant="link"
            color="white"
            onClick={() => setComponent("Weight")}
            width="full"
            textAlign="left"
          >
            Weight
          </Button>
        </Flex>
        <Flex as="li" align="center" width="full">
          <Icon as={FiLogOut} mr={2} />
          <Button
            variant="link"
            color="white"
            onClick={onLogout}
            width="full"
            textAlign="left"
          >
            Logout
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
};

export default AdminSidebar;
