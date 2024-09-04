import { useRouter } from "next/router";
import UserRegistrationForm from "../../../components/user/auth/UserRegistrationForm";
import AdminRegistrationForm from "../../../components/admin/auth/AdminRegistrationForm";
import AuthLayout from "../../../layouts/AuthLayout";

import { Box, Center, AbsoluteCenter } from "@chakra-ui/react";

const RegisterPage = () => {
  const router = useRouter();
  const { role } = router.query;

  const form =
    role === "admin" ? <AdminRegistrationForm /> : <UserRegistrationForm />;

  const heading = role === "admin" ? "Admin Registration" : "User Registration";

  return (
    <Center m="auto" p="4">
      <AuthLayout form={form} heading={heading} role={role} />
    </Center>
  );
};

export default RegisterPage;
