// src/components/Header.js
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { logout } from "@/store/slices/user/auth/userAuthSlice";
import {
  Box,
  Button,
  Flex,
  Heading,
  Spacer,
  IconButton,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
} from "@chakra-ui/react";
import { FaBars, FaSignOutAlt, FaUser , FaCar,} from "react-icons/fa";
import theme from "@/themes/theme";

const Header = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  return (
    <Box bg={theme.colors.customRed[500]} p={4} color="white">
      <Flex align="center">
        <Flex alignItems="center" justify="center" gap={2} color="white">
          <Icon as={FaCar} boxSize={8} color="white" />
          <Heading size="lg">RentARide</Heading>
        </Flex>

        <Spacer />

        {/* Hamburger menu for small screens */}
        <IconButton
          aria-label="Open menu"
          icon={<FaBars />}
          display={{ base: "flex", md: "none" }}
          onClick={isOpen ? onClose : onOpen}
          variant="outline"
          colorScheme="white"
        />

        {/* Menu items for medium screens and above */}
        <Flex display={{ base: "none", md: "flex" }} gap={4}>
          <Button
            onClick={() => router.push("/dashboard/user")}
            colorScheme="black"
            variant="outline"
          >
            Visit Dashboard
          </Button>
          <Button
            onClick={handleLogout}
            colorScheme="black"
            variant="link"
            leftIcon={<FaSignOutAlt />}
          >
            Logout
          </Button>
        </Flex>

        {/* Dropdown menu for small screens */}
        <Menu isOpen={isOpen} onClose={onClose}>
          <MenuButton
            as={Box}
            display={{ base: "flex", md: "none" }}
          >
            
          </MenuButton>
          <MenuList bg={theme.colors.customRed[500]} color="black">
            <MenuItem
              onClick={() => {
                router.push("/dashboard/user");
                onClose();
              }}
              icon={<FaUser />}
            >
              Visit Dashboard
            </MenuItem>
            <MenuItem onClick={handleLogout} icon={<FaSignOutAlt />}>
              Logout
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Box>
  );
};

export default Header;
