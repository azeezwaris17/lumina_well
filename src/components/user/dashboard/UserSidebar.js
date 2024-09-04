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

import { Box, Flex, Spacer, Text, Icon } from "@chakra-ui/react";

import theme from "@/themes/theme";

const UserSidebar = ({ setComponent }) => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  const menuItems = [
    // { icon: FiHome, label: "Dashboard", component: "UserDashboard" },
    // { icon: FiTrendingUp, label: "Steps", component: "Steps" },
    { icon: FiMoon, label: "Sleep", component: "Sleep" },
    { icon: FiDroplet, label: "Hydration", component: "Hydration" },
    { icon: FiSmile, label: "Mood", component: "Mood" },
    { icon: FaWeight, label: "Weight", component: "Weight" },
    // { icon: FiSun, label: "Dietary", component: "DietaryIntake" },
  ];

  return (
    <Box
      as="aside"
      w="64"
      display={{ base: "none", md: "flex" }}
      flexShrink={0}
      p={4}
      flexDirection="column"
      bg="customWhite.400"
    >
      {menuItems.map((item) => (
        <Flex
          key={item.label}
          align="center"
          p={3}
          cursor="pointer"
          _hover={{
            bg: "customBlue.500",
            color: "white",
          }}
          onClick={() => setComponent(item.component)}
        >
          <Icon as={item.icon} boxSize={5} mr={3} />
          <Text>{item.label}</Text>
        </Flex>
      ))}

      <Spacer />

      <Flex
        align="center"
        p={3}
        cursor="pointer"
        _hover={{
          bg: "customBlue.500",
          color: "white",
        }}
        onClick={handleLogout}
        display="none"
      >
        <Icon as={FiLogOut} boxSize={5} mr={3} />
        <Text>Logout</Text>
      </Flex>
    </Box>
  );
};

export default UserSidebar;
