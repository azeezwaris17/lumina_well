import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { registerAdmin } from "../../../store/slices/admin/auth/adminAuthSlice";
import { toast } from "react-toastify";

import { Input, InputGroup, InputRightElement, Button } from "@chakra-ui/react";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { BiLoaderCircle } from "react-icons/bi";
import theme from "@/themes/theme";

const UserRegistrationForm = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [role, setRole] = useState("");
  const { loading, error, user } = useSelector((state) => state.userAuth);

  const handleClick = () => setShow(!show);

  useEffect(() => {
    const { role: roleFromQuery } = router.query;
    if (roleFromQuery) {
      setRole(roleFromQuery);
    }
  }, [router.query]);

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: role,
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required("Required"),
      email: Yup.string().email("Invalid email address").required("Required"),
      password: Yup.string().required("Required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const APIResponse = await dispatch(registerAdmin({ ...values, role }));
        if (registerUser.fulfilled.match(APIResponse)) {
          toast.success(
            APIResponse.payload.message || "Registration successful"
          );
          router.push(`/auth/login/${role}`);

          resetForm();
        } else {
          const errorStatus =
            APIResponse.payload?.status || APIResponse.error?.status;
          handleErrorStatus(errorStatus);
        }
      } catch (error) {
        const errorStatus = error.response?.status || error.status;
        handleErrorStatus(errorStatus, error.message);
      }
    },
  });

  const handleErrorStatus = (status, defaultErrorMessage) => {
    switch (status) {
      case 400:
        toast.error("Bad Request. Please check your input and try again.");
        break;
      case 401:
        toast.error("Unauthorized. Please check your credentials.");
        break;
      case 403:
        toast.error(
          "Forbidden. You do not have permission to perform this action."
        );
        break;
      case 404:
        toast.error(
          "Not Found. The resource you are trying to access does not exist."
        );
        break;
      case 500:
        toast.error("Internal Server Error. Please try again later.");
        break;
      case 503:
        toast.error("Service Unavailable. Please try again later.");
        break;
      default:
        toast.error(
          defaultErrorMessage || "An error occurred. Please try again."
        );
    }
  };

  return (
    <form onSubmit={formik.handleSubmit} className="max-w-md mx-auto mt-8">
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Full Name</label>
        <Input
          type="text"
          name="fullName"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.fullName}
        />
        {formik.touched.fullName && formik.errors.fullName ? (
          <div className="text-red-700">{formik.errors.fullName}</div>
        ) : null}
      </div>
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
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? <IoEyeOffOutline /> : <IoEyeOutline />}
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
        <InputGroup size="md">
          <Input
            type={show ? "text" : "password"}
            name="confirmPassword"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.confirmPassword}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? <IoEyeOffOutline /> : <IoEyeOutline />}
            </Button>
          </InputRightElement>
        </InputGroup>
        {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
          <div className="text-red-700">{formik.errors.confirmPassword}</div>
        ) : null}
      </div>
      <div className="hidden mb-4">
        <label className="block text-gray-700 font-bold mb-2">Role</label>
        <Input
          type="text"
          name="role"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={role || formik.values.role}
        />
        {formik.touched.role && formik.errors.role ? (
          <div className="text-red-700">{formik.errors.role}</div>
        ) : null}
      </div>

      <Button
        type="submit"
        colorScheme="customRed"
        isLoading={loading}
        loadingText="Processing..."
        spinner={<BiLoaderCircle className="animate-spin" />}
        width="full"
      >
        Register
      </Button>
    </form>
  );
};

export default UserRegistrationForm;
