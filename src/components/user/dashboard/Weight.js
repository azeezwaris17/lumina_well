import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../../store/slices/user/auth/userAuthSlice";
import {
  Box,
  Flex,
  Heading,
  Button,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  InputGroup,
  Input,
  InputRightElement,
  Text,
  Textarea,
  useBreakpointValue,
  Spinner,
  Center,
  Stack,
  HStack,
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";

import {
  fetchExistingWeightData,
  addNewWeightData,
  updateExistingWeightData,
  deleteExistingWeightData,
  selectAllWeightData,
  selectWeightDataLoading,
  selectWeightDataError,
} from "../../../store/slices/metrics/weightSlice";

import { DateTime } from "luxon";

import { Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register necessary components
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

const WeightTracker = () => {
  const user = useSelector(selectUser);
  const token = user?.token;
  const dispatch = useDispatch();
  const loading = useSelector(selectWeightDataLoading);
  const error = useSelector(selectWeightDataError);

  const [weightData, setWeightData] = useState([]);
  const [selectedWeight, setSelectedWeight] = useState(null);

  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");


  const modalSize = useBreakpointValue({ base: "full", md: "lg" });

  

  // Use effect to fetch weight data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (token) {
          const API_response = await dispatch(
            fetchExistingWeightData(token)
          ).unwrap();
          // console.log("Fetch Weight Data Response:", API_response);
          const weightDataArray = API_response.existingWeightData || [];

          setWeightData(weightDataArray);
        }
      } catch (error) {
        console.error("Error fetching weight data:", error);
      }
    };
    fetchData();
  }, [dispatch, token]);

  // Function to handle fetching existing hydration data
  const handleFetchExistingWeightData = async () => {
    const token = user?.token;

    try {
      // Dispatch the fetch action
      const API_response = await dispatch(
        fetchExistingWeightData(token)
      ).unwrap();

      const weightDataArray = API_response.existingWeightData || [];

      setWeightData(weightDataArray);
    } catch (error) {
      console.error("Error fetching weight data:", error);
    }
  };


    // form modal disclosure
  const {
    isOpen: isFormModalOpen,
    onOpen: onFormModalOpen,
    onClose: onFormModalClose,
  } = useDisclosure();

  // function to handle adding new weight data
  const handleAddNewWeightData = async () => {
    const parsedWeight = parseFloat(weight);
    if (isNaN(parsedWeight)) {
      console.error("Invalid value for weight:", weight);
      return;
    }

    const newWeightDataEntries = { date, weight: parsedWeight, note };

    try {
      await dispatch(
        addNewWeightData({ newWeightData: newWeightDataEntries, token })
      ).unwrap();

      // Fetch and update existing hydration data
      const { existingWeightData = [] } = await dispatch(
        fetchExistingWeightData(token)
      ).unwrap();
      setWeightData(existingWeightData);

      onFormModalClose();
      resetFormFields();
    } catch (error) {
      console.error("Error in addNewWeightData:", error);
    }
  };

  // function to reset form fields
  const resetFormFields = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setWeight("");
    setNote("");
  };

  // view more modal disclosure
  const {
    isOpen: isViewMoreModalOpen,
    onOpen: onViewMoreModalOpen,
    onClose: onViewMoreModalClose,
  } = useDisclosure();

  // function to handle view more details of a selected weight data
  const handleViewMore = (weight) => {
    setSelectedWeight(weight);
    setFormData({ ...weight });
    onViewMoreModalOpen();
  };

  // State to track whether the form is in edit mode
  const [isEditMode, setIsEditMode] = useState({
    date: false,
    weight: false,
    note: false,
  });

  // edit Form data state
  const [formData, setFormData] = useState({
    date: "",
    dailyWaterIntake: "0",
    note: "",
  });

  // Use effect to update formData when selectedWeight changes
  useEffect(() => {
    if (selectedWeight) {
      const weightData = selectedWeight.weight || {};
      setFormData({
        date: weightData.date || "",
        weight: weightData.weight || "",
        note: weightData.note || "",
      });
    }
  }, [selectedWeight]);

  // Log formData outside the useEffect
  useEffect(() => {
    console.log("Form data initialized:", formData);
  }, [formData]);

  // Function to handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    console.log("Updated form data:", { ...formData, [name]: value });
  };

  // Function to toggle edit mode for individual fields
  const toggleEditField = (fieldName) => {
    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: prevData[fieldName], // Keep the current value
    }));
    setIsEditMode((prevModes) => ({
      ...prevModes,
      [fieldName]: !prevModes[fieldName], // Toggle the edit mode for the field
    }));
  };

  // Function to render an editable input field
  const renderEditableField = (label, name, value) => (
    <FormControl mb={4} key={name}>
      <InputGroup>
        <Input
          name={name}
          value={value}
          onChange={handleInputChange}
          isReadOnly={!isEditMode[name]} // Editable only when isEditMode[name] is true
        />
        <InputRightElement width="4.5rem">
          <Button h="1.75rem" size="sm" onClick={() => toggleEditField(name)}>
            <EditIcon />
          </Button>
        </InputRightElement>
      </InputGroup>
    </FormControl>
  );

  // Function to handle updating existing weight data
  const handleSubmitUpdate = async () => {
    const parsedWeight = parseFloat(formData.weight);
    if (isNaN(parsedWeight)) {
      console.error("Invalid value for weight:", formData.weight);
      return;
    }

    const weightDataUpdateEntries = { ...formData, weight: parsedWeight };

    try {
      await dispatch(
        updateExistingWeightData({
          id: selectedWeight._id,
          weightDataUpdateEntries,
          token,
        })
      ).unwrap();

      // Fetch updated weight data
      const { existingWeightData = [] } = await dispatch(
        fetchExistingWeightData(token)
      ).unwrap();
      setWeightData(existingWeightData);

      onViewMoreModalClose();
    } catch (error) {
      console.error("Error in updateExistingWeightData:", error);
    }
  };

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  const openConfirmDeleteModal = (id) => {
    setIdToDelete(id);
    setIsConfirmDeleteOpen(true);
  };

  const closeConfirmDeleteModal = () => {
    setIdToDelete(null);
    setIsConfirmDeleteOpen(false);
  };

  // function to delete existing weight data
  const handleDeleteExistingWeightData = async (id) => {
    try {
      await dispatch(deleteExistingWeightData({ id, token })).unwrap();
      onViewMoreModalClose();
    } catch (error) {
      console.error("Error in deleteExistingWeightData:", error);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString();

  const getMonthAndDay = (date) => DateTime.fromISO(date).toFormat("MMM d");

  return (
    <Box
      p={5}
      maxW={{ base: "90%", md: "100%" }}
      overflowX={"scroll"}
      sx={{
        "&::-webkit-scrollbar": {
          display: "none", // Hide scrollbar for WebKit browsers
        },
        "-ms-overflow-style": "none", // Hide scrollbar for IE and Edge
        "scrollbar-width": "none", // Hide scrollbar for Firefox
      }}
      mx="auto"
    >
      <Heading as="h2" mb={4} textAlign="center">
        Weight Tracker
      </Heading>

      {loading ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="row"
          gap={4}
          textAlign="center"
          minHeight="500px"
        >
          <Heading color="gray.500">Loading Data</Heading>
          <Spinner size="xl" />
        </Box>
      ) : error ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          textAlign="center"
          minHeight="500px"
        >
          <Heading color="red.500">{error.message}</Heading>
          <Button
            colorScheme="blue"
            mt={4}
            onClick={handleFetchExistingWeightData}
            isLoading={loading}
          >
            Try Again
          </Button>
        </Box>
      ) : weightData.length === 0 ? (
        <Flex
          direction="column"
          alignItems="center"
          justifyContent="center"
          minHeight="500px"
        >
          <Text>No weight data available.</Text>
          <Button colorScheme="blue" mt={4} onClick={onFormModalOpen}>
            Start Tracking Weight
          </Button>
        </Flex>
      ) : (
        <Stack spacing={8}>
          <Flex justify="flex-end">
            <Button onClick={onFormModalOpen} colorScheme="blue">
              Add Weight Data
            </Button>
          </Flex>

          <Box
            h={{ base: "400px", md: "600px" }}
            overflowY={"scroll"}
            w={{ base: "350px", md: "100%" }}
            overflowX={"scroll"}
            sx={{
              "&::-webkit-scrollbar": {
                display: "none", // Hide scrollbar for WebKit browsers
              },
              "-ms-overflow-style": "none", // Hide scrollbar for IE and Edge
              "scrollbar-width": "none", // Hide scrollbar for Firefox
            }}
          >
            <Box
              h={{ base: "300px", md: "400px" }}
              w={{ base: "400px", md: "100%" }}
              p={4}
              bg="white"
            >
              <Line
                data={{
                  labels: Array.isArray(weightData)
                    ? weightData.map((data) => getMonthAndDay(data.weight.date))
                    : [],
                  datasets: [
                    {
                      label: "Weight (kg)",
                      data: Array.isArray(weightData)
                        ? weightData.map((data) => data.weight.weight)
                        : [],
                      backgroundColor: "rgba(75, 192, 192, 0.2)",
                      borderColor: "rgba(75, 192, 192, 1)",
                      borderWidth: 1,
                      fill: false,
                      tension: 0.1,
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    x: { beginAtZero: true },
                    y: {
                      beginAtZero: true,
                      title: { display: true, text: "Weight (kg)" },
                    },
                  },
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                  },
                }}
                width={"100%"}
                height={null}
              />
            </Box>

            <TableContainer
              borderWidth="1px"
              borderRadius="lg"
              p={4}
              mt={4}
              bg="white"
            >
              <Table variant="striped" size="sm">
                <Thead>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Weight (kg)</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {Array.isArray(weightData) &&
                    weightData.map((entry) => (
                      <Tr key={entry._id}>
                        <Td>{formatDate(entry.weight.date)}</Td>
                        <Td>{entry.weight.weight}</Td>
                        <Td>
                          <Button
                            size="sm"
                            onClick={() => handleViewMore(entry)}
                          >
                            View More
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </Stack>
      )}

      {/* Add New Weight Data Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={onFormModalClose}
        size={modalSize}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Weight Data</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Date</FormLabel>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Weight (kg)</FormLabel>
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Note</FormLabel>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleAddNewWeightData}>
              Save
            </Button>
            <Button variant="ghost" onClick={onFormModalClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View/Edit Weight Data Modal */}
      {selectedWeight && (
        <Modal
          isOpen={isViewMoreModalOpen}
          onClose={onViewMoreModalClose}
          size={modalSize}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Weight Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl mb={4}>
                <FormLabel>Date</FormLabel>
                {renderEditableField("Date", "date", formatDate(formData.date))}
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Weight(kg)</FormLabel>
                {renderEditableField("Weight", "weight", formData.weight)}
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Note</FormLabel>
                {renderEditableField("Note", "note", formData.note)}
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleSubmitUpdate}>
                Save
              </Button>

              <Button
                colorScheme="red"
                mr={3}
                onClick={() => openConfirmDeleteModal(selectedWeight._id)}
              >
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Confirm Delete Modal */}
      <Modal isOpen={isConfirmDeleteOpen} onClose={closeConfirmDeleteModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete this weight entry?
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              onClick={() => {
                handleDeleteExistingWeightData(idToDelete);
                closeConfirmDeleteModal();
              }}
            >
              Delete
            </Button>
            <Button onClick={closeConfirmDeleteModal}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default WeightTracker;
