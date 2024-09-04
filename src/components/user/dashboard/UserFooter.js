// src/components/user/dashboard/user/UserFooter.js
import {
  Container,
  Box,
  Text,
  Flex,

} from "@chakra-ui/react";
const UserFooter = () => {
  return (
    <Box
      as="footer"
      bg="customWhite.50"
      color="customGray.500"
      p={4}
    >
       <Flex justify="center" align="center">
        <Text className="">
          © {new Date().getFullYear()} RentARide. All rights reserved.
        </Text>
      </Flex>
    </Box>
  );
};

export default UserFooter;
