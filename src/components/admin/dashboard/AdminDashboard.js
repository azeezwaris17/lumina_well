// src/components/admin/dashboard/AdminDashboard.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  useToast,
  Select,
  Card,
  CardHeader,
  CardBody,
  Text,
} from "@chakra-ui/react";

import MetricEnrollmentForm from "../../MetricEnrolmentForm";

import { useSelector, useDispatch } from "react-redux";
import { fetchMetrics, enrolMetric } from "../../../store/slices/metricSlice";

const AdminDashboard = ({ setComponent }) => {
  const [selectedMetric, setSelectedMetric] = useState("");
  const [filteredMetrics, setFilteredMetrics] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const dispatch = useDispatch();

  const metrics = useSelector((state) => state.metrics.enrolledMetrics);

  useEffect(() => {
    dispatch(fetchMetrics());
  }, [dispatch]);

  const handleEnroll = (metricType) => {
    setSelectedMetric(metricType);
    onOpen();
  };

  const handleMetricEnrollment = (values) => {
    dispatch(enrolMetric({ metricType: selectedMetric, ...values }));
    toast({
      title: `${selectedMetric} enrolled successfully!`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    setSelectedMetric("");
    onClose();
  };

  const handleFilter = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = metrics.filter((metric) =>
      metric.type.toLowerCase().includes(searchTerm)
    );
    setFilteredMetrics(filtered);
  };

  const handleViewDetails = (metricType) => {
    setComponent(metricType);
  };

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading as="h1">User Dashboard</Heading>
        <Box>
          <Input
            placeholder="Search metrics..."
            onChange={handleFilter}
            width="200px"
            mr={4}
          />
          <Select
            placeholder="Select metric to enroll"
            onChange={(e) => handleEnroll(e.target.value)}
            mt={4}
          >
            <option value="steps">Steps</option>
            <option value="hydration">Hydration</option>
            <option value="sleep">Sleep</option>
            <option value="weight">Weight</option>
            <option value="mood">Mood</option>
            <option value="dietary">Dietary</option>
          </Select>
        </Box>
      </Flex>

      <VStack spacing={4}>
        {(filteredMetrics.length > 0 ? filteredMetrics : metrics).map(
          (metric) => (
            <Card key={metric.id} width="100%">
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading as="h2" size="md">
                    {metric.type}
                  </Heading>
                  <Button onClick={() => handleViewDetails(metric.type)}>
                    View Details
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                <Text>{metric.details}</Text>
                <Text>Tracking Status: {metric.trackingStatus}</Text>
                <Text>Tracking Progress: {metric.trackingProgress}%</Text>
                <Text>Tip: {metric.tip}</Text>
                {/* Insert chart component here, if applicable */}
              </CardBody>
            </Card>
          )
        )}
      </VStack>

      {/* Modal for Notifications */}
      <Modal isOpen={isOpen && !selectedMetric} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Notifications & Tips</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {metrics.map((metric) => (
                <Box key={metric.id}>
                  <Heading as="h3" size="sm">
                    {metric.type} Tips:
                  </Heading>
                  <Text>{metric.tip}</Text>
                </Box>
              ))}
              <Box>
                <Heading as="h3" size="sm">
                  Motivational Tip:
                </Heading>
                <Text>Stay consistent and keep tracking your progress!</Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal for Metric Enrollment */}
      <Modal isOpen={isOpen && selectedMetric} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Enroll in {selectedMetric}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <MetricEnrollmentForm
              metricType={selectedMetric}
              onSubmit={handleMetricEnrollment}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={() => formik.submitForm()}>
              Enroll
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminDashboard;
