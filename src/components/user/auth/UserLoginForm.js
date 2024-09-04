// src/components/user/auth/LoginForm.js
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { loginUser } from "../../../store/slices/user/auth/userAuthSlice";
import { useRouter } from "next/router";
import { Input, InputGroup, InputRightElement, Button } from "@chakra-ui/react";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { BiLoaderCircle } from "react-icons/bi";
import theme from "@/themes/theme";

const UserLoginForm = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { redirect } = router.query;
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
      role: role,
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Required"),
      password: Yup.string().required("Required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const resultAction = await dispatch(loginUser(values));
        if (loginUser.fulfilled.match(resultAction)) {
          toast.success(resultAction.payload.message || "Login successful");
          resetForm();
          router.push(redirect || `/dashboard/${role}`);
        } else {
          const errorStatus =
            resultAction.payload?.status || resultAction.error?.status;
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
            placeholder="Enter password"
            pr="4.5rem"
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

      <Button
        type="submit"
        isLoading={loading}
        loadingText="Processing..."
        colorScheme="customBlue"
        width="full"
        className="relative"
      >
        {loading && <BiLoaderCircle className="animate-spin absolute left-4" />}
        {!loading && "Login"}
      </Button>
    </form>
  );
};

export default UserLoginForm;
