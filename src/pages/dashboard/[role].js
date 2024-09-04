// src/pages/dashboard/[role].js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import DashboardLayout from "../../layouts/DashboardLayout";
import { selectUser } from "../../store/slices/user/auth/userAuthSlice";
import { Box, Button, Center, Heading, Text } from "@chakra-ui/react";

const DashboardPage = () => {
  const router = useRouter();
  const user = useSelector(selectUser);
  const [selectedComponent, setSelectedComponent] = useState("Dashboard");
  const role = user?.role;

  useEffect(() => {
    if (!role || !user) {
      router.push("/auth/login/user");
    }
  }, [role, user, router]);

  if (!role) {
    return (
      <Center minH="100vh">
        <Box textAlign="center">
          <Heading mt={4} size="md" color="red.500">
            Access Denied
          </Heading>
          <Text mt={2} color="gray.600">
            You are not authenticated, Kindly login to proceed
          </Text>
          <Button
            colorScheme="customBlue"
            mr={4}
            mt={4}
            onClick={() => router.push(`/auth/login/user`)}
          >
            Log in
          </Button>
        </Box>
      </Center>
    );
  }

  return (
    <DashboardLayout
      role={role}
      component={selectedComponent}
      setComponent={setSelectedComponent}
    />
  );
};

export default DashboardPage;
