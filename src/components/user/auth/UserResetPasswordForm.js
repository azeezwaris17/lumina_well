// src/components/auth/UserResetPasswordForm.js
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { Input, Button, InputGroup, InputRightElement } from "@chakra-ui/react";
import { BiLoaderCircle } from "react-icons/bi";
import { resetUserPassword } from "../../../store/slices/user/auth/userAuthSlice";
import theme from "@/themes/theme";

const UserResetPasswordForm = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error } = useSelector((state) => state.userAuth);
  const [show, setShow] = useState(false);
  const [role, setRole] = useState("");

  const handleClick = () => setShow(!show);

  useEffect(() => {
    const { role: roleFromQuery } = router.query;
    if (roleFromQuery) {
      setRole(roleFromQuery);
    }
  }, [router.query]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
      role: role,
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Required"),
      password: Yup.string().required("Required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const resultAction = await dispatch(resetUserPassword(values)).unwrap();
        toast.success(
          resultAction.payload.message || "Password reset successfully"
        );
        resetForm();
        router.push(`/auth/login/${role}`);
      } catch (error) {
        toast.error(
          error.message || "An error occurred while resetting password"
        );
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="max-w-md mx-auto mt-8">
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Email</label>
        <Input
          type="email"
          name="email"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.email}
        />
        {formik.touched.email && formik.errors.email ? (
          <div className="text-red-700">{formik.errors.email}</div>
        ) : null}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Password</label>
        <InputGroup size="md">
          <Input
            type={show ? "text" : "password"}
            name="password"
            placeholder="Enter new password"
            pr="4.5rem"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>

        {formik.touched.password && formik.errors.password ? (
          <div className="text-red-700">{formik.errors.password}</div>
        ) : null}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          Confirm Password
        </label>
        <Input
          type={show ? "text" : "password"}
          name="confirmPassword"
          placeholder="Confirm new password"
          pr="4.5rem"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.confirmPassword}
        />
        {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
          <div className="text-red-700">{formik.errors.confirmPassword}</div>
        ) : null}
      </div>
      <Button
        type="submit"
        isLoading={loading}
        loadingText="Processing..."
        colorScheme="customBlue"
        width="full"
        className="relative"
      >
        {loading && <BiLoaderCircle className="animate-spin absolute left-4" />}
        {!loading && "Reset"}
      </Button>
    </form>
  );
};

export default UserResetPasswordForm;
