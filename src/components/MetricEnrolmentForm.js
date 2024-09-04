// src/components/MetricEnrollmentForm.js
import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box,
  Button,
  Field,
  FormControl,
  FormLabel,
  Input,
  Select,
} from "@chakra-ui/react";

const MetricEnrollmentForm = ({ metricType, initialValues, onSubmit }) => {
  const getInitialValues = () => {
    switch (metricType) {
      case "steps":
        return { steps: "", interval: "" };
      case "mood":
        return { mood: "", interval: "" };
      case "dietary":
        return { food: "", calories: "", nutrients: "" };
      case "hydration":
        return { amount: "", interval: "" };
      case "sleep":
        return { hours: "", interval: "" };
      case "weight":
        return { weight: "", interval: "" };
      default:
        return initialValues || {};
    }
  };

  const validationSchema = Yup.object({
    ...(metricType === "steps" && {
      steps: Yup.number().required("Number of steps is required"),
      interval: Yup.string().required("Interval is required"),
    }),
    ...(metricType === "mood" && {
      mood: Yup.string().required("Mood is required"),
      interval: Yup.string().required("Interval is required"),
    }),
    ...(metricType === "dietary" && {
      food: Yup.string().required("Food is required"),
      calories: Yup.number().required("Calories are required"),
      nutrients: Yup.string().required("Nutrients are required"),
    }),
    ...(metricType === "hydration" && {
      amount: Yup.number().required("Amount of water is required"),
      interval: Yup.string().required("Interval is required"),
    }),
    ...(metricType === "sleep" && {
      hours: Yup.number().required("Hours of sleep is required"),
      interval: Yup.string().required("Interval is required"),
    }),
    ...(metricType === "weight" && {
      weight: Yup.number().required("Weight is required"),
      interval: Yup.string().required("Interval is required"),
    }),
  });

  const formik = useFormik({
    initialValues: getInitialValues(),

    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <Box as="form" onSubmit={formik.handleSubmit}>
      {metricType === "steps" && (
        <>
          <FormControl>
            <FormLabel>Number of Steps</FormLabel>
            <Input
              id="steps"
              name="steps"
              type="number"
              onChange={formik.handleChange}
              value={formik.values.steps}
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Tracking Interval</FormLabel>
            <Select
              id="interval"
              name="interval"
              onChange={formik.handleChange}
              value={formik.values.interval}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="continuous">Continuous</option>
            </Select>
          </FormControl>
        </>
      )}
      {/* Similar blocks for other metric types */}
      {metricType === "mood" && (
        <>
          <FormControl>
            <FormLabel>Mood</FormLabel>
            <Input
              id="mood"
              name="mood"
              type="text"
              onChange={formik.handleChange}
              value={formik.values.mood}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Tracking Interval</FormLabel>
            <Select
              id="interval"
              name="interval"
              onChange={formik.handleChange}
              value={formik.values.interval}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="continuous">Continuous</option>
            </Select>
          </FormControl>
        </>
      )}
      {/* Add similar blocks for other metric types: dietary, hydration, sleep, weight */}
      {metricType === "dietary" && (
        <FormControl mt={4}>
          <FormLabel>Calories</FormLabel>
          <Field as={Input} type="number" name="calories" required />
        </FormControl>
      )}

      {metricType === "hydration" && (
        <FormControl mt={4}>
          <FormLabel>Water Intake (liters)</FormLabel>
          <Field
            as={Input}
            type="number"
            step="0.1"
            name="waterIntake"
            required
          />
        </FormControl>
      )}

      {metricType === "sleep" && (
        <FormControl mt={4}>
          <FormLabel>Sleep Hours</FormLabel>
          <Field
            as={Input}
            type="number"
            step="0.1"
            name="sleepHours"
            required
          />
        </FormControl>
      )}

      {metricType === "weight" && (
        <FormControl mt={4}>
          <FormLabel>Weight (kg)</FormLabel>
          <Field as={Input} type="number" step="0.1" name="weight" required />
        </FormControl>
      )}

      <Button mt={4} colorScheme="blue" type="submit">
        Submit
      </Button>
    </Box>
  );
};

export default MetricEnrollmentForm;
