import { useRouter } from "next/router";
import AdminResetPasswordForm from "../../../components/admin/auth/AdminResetPasswordForm";
import UserResetPasswordForm from "../../../components/user/auth/UserResetPasswordForm";
import AuthLayout from "../../../layouts/AuthLayout";

import { Box, Center, AbsoluteCenter } from "@chakra-ui/react";

const ResetPasswordPage = () => {
  const router = useRouter();
  const { role } = router.query;

  const form =
    role === "admin" ? <AdminResetPasswordForm /> : <UserResetPasswordForm />;
  const heading =
    role === "admin" ? "Reset Admin Password" : "Reset User Password";

  return (
    <Center m="auto" p="4">
      <AuthLayout form={form} heading={heading} role={role} />
    </Center>
  );
};

export default ResetPasswordPage;
