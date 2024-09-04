// src/pages/auth/login/[role].js
import { useRouter } from "next/router";
import UserLoginForm from "../../../components/user/auth/UserLoginForm";
import AdminLoginForm from "../../../components/admin/auth/AdminLoginForm";
import AuthLayout from "../../../layouts/AuthLayout";

import { Box, Center, AbsoluteCenter } from "@chakra-ui/react";

const LoginPage = () => {
  const router = useRouter();
  const { role } = router.query;

  // Default values while `role` is not available
  const form = role === "admin" ? <AdminLoginForm /> : <UserLoginForm />;
  const heading = role === "admin" ? "Admin Login" : "User Login";

  return (
     <Center h="100vh">
    {/* <Center m="auto" p="4"> */}
      <AuthLayout form={form} heading={heading} role={role} />
    </Center>
  );
};

export default LoginPage;
