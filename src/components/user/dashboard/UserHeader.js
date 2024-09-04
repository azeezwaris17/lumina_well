import { useDispatch } from "react-redux";
import { logout } from "../../../store/slices/user/auth/userAuthSlice";
import {
  FiHome,
  FiUser,
  FiDroplet,
  FiSmile,
  FiSun,
  FiMoon,
  FiTrendingUp,
  FiLogOut,
} from "react-icons/fi";
import { FaWeight } from "react-icons/fa";
import { TbHealthRecognition } from "react-icons/tb";

import {
  Box,
  Flex,
  Heading,
  Button,
  IconButton,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";

import theme from "@/themes/theme";

const UserHeader = ({ setComponent }) => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Box
      as="header"
      bg="customWhite.50"
      boxShadow="xl"
      borderBottom="2px solid"
      borderColor="customGray.500"
      color="customGray.500"
      p={4}
    >
      <Flex justify="space-between" align="center">
        <Flex alignItems="center">
          <TbHealthRecognition
            color={theme.colors.customBlue[500]}
            size="36px"
          />
          <Heading color="customBlue.500" ml={3} fontSize="2xl">
            LuminaWell
          </Heading>
        </Flex>

        {/* mobile menu items */}
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<HamburgerIcon />}
            aria-label="Open Navigation"
            color={theme.colors.customBlue[500]}
            display={{ base: "block", md: "none" }}
            variant="outline"
          />
          <MenuList bg={useColorModeValue("blue.600", "blue.800")}>
            {/* <MenuItem
              icon={<FiHome />}
              onClick={() => setComponent("Dashboard")}
              _hover={{
                bg: "customBlue.500",
                color: "white",
              }}
            >
              Dashboard
            </MenuItem> */}

            <MenuItem
              icon={<FiMoon />}
              onClick={() => setComponent("Sleep")}
              _hover={{
                bg: "customBlue.500",
                color: "white",
              }}
            >
              Sleep
            </MenuItem>
            <MenuItem
              icon={<FiDroplet />}
              onClick={() => setComponent("Hydration")}
              _hover={{
                bg: "customBlue.500",
                color: "white",
              }}
            >
              Hydration
            </MenuItem>
            <MenuItem
              icon={<FiSmile />}
              onClick={() => setComponent("Mood")}
              _hover={{
                bg: "customBlue.500",
                color: "white",
              }}
            >
              Mood
            </MenuItem>

            <MenuItem
              icon={<FaWeight />}
              onClick={() => setComponent("Weight")}
              _hover={{
                bg: "customBlue.500",
                color: "white",
              }}
            >
              Weight
            </MenuItem>

            {/* <MenuItem
              icon={<FiTrendingUp />}
              onClick={() => setComponent("Steps")}
              _hover={{
                bg: "customBlue.500",
                color: "white",
              }}
            >
              Steps
            </MenuItem> */}

            {/* <MenuItem
              icon={<FiSun />}
              onClick={() => setComponent("Dietary")}
              _hover={{
                bg: "customBlue.500",
                color: "white",
              }}
            >
              Dietary
            </MenuItem> */}

            <MenuItem
              icon={<FiLogOut />}
              onClick={handleLogout}
              _hover={{
                bg: "red.500",
                color: "white",
              }}
              borderTop="2px solid"
              borderColor="customGray.500"
            >
              Logout
            </MenuItem>
          </MenuList>
        </Menu>

        <Button
          _hover={{
            bg: "customBlue.500",
            color: "white",
          }}
          colorScheme="customBlue"
          variant="outline"
          rightIcon={<FiLogOut />}
          display={{
            base: "none",
            md: "flex",
          }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Flex>
    </Box>
  );
};

export default UserHeader;
