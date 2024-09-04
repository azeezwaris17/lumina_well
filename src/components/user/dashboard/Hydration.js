import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../../store/slices/user/auth/userAuthSlice";
import {
  Box,
  Center,
  Stack,
  Flex,
  Heading,
  FormControl,
  FormLabel,
  InputGroup,
  Input,
  Textarea,
  InputRightElement,
  Button,
  IconButton,
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
  Select,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import { Line } from "react-chartjs-2";
import {
  fetchExistingHydrationData,
  addNewHydrationData,
  updateExistingHydrationData,
  deleteExistingHydrationData,
  selectAllHydrationData,
  selectHydrationDataLoading,
  selectHydrationDataError,
} from "../../../store/slices/metrics/hydrationSlice";
import { DateTime } from "luxon";

const HydrationTracker = () => {
  const user = useSelector(selectUser);
  const token = user?.token;
  const dispatch = useDispatch();
  const loading = useSelector(selectHydrationDataLoading);
  const error = useSelector(selectHydrationDataError);

  const [hydrationData, setHydrationData] = useState([]);
  const [newHydrationData, setNewHydrationData] = useState(null);

  // Hydration data entries
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [dailyWaterIntake, setDailyWaterIntake] = useState("");
  const [note, setNote] = useState("");

  // Modal disclosure for form inputs
  const {
    isOpen: isFormModalOpen,
    onOpen: onFormModalOpen,
    onClose: onFormModalClose,
  } = useDisclosure();

  // Recommendations modal
  const [recommendations, setRecommendations] = useState([]);
  const {
    isOpen: isViewRecommendationsModalOpen,
    onOpen: onViewRecommendationsModalOpen,
    onClose: onViewRecommendationsModalClose,
  } = useDisclosure();

  // Selected hydration data
  const [selectedHydration, setSelectedHydration] = useState(null);
  const {
    isOpen: isViewMoreModalOpen,
    onOpen: onViewMoreModalOpen,
    onClose: onViewMoreModalClose,
  } = useDisclosure();

  const handleViewMore = (hydration) => {
    setSelectedHydration(hydration);
    onViewMoreModalOpen();
  };

  // Use effect to fetch hydration data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (token) {
          const API_response = await dispatch(
            fetchExistingHydrationData(token)
          ).unwrap();
          // console.log("Fetch Hydration Data Response:", API_response);
          const hydrationDataArray = API_response.existingHydrationData || [];

          setHydrationData(hydrationDataArray);
        }
      } catch (error) {
        console.error("Error fetching hydration data:", error);
      }
    };
    fetchData();
  }, [dispatch, token]);

  // Function to handle fetching existing hydration data
  const handleFetchExistingHydrationData = async () => {
    const token = user?.token;

    try {
      // Dispatch the fetch action
      const API_response = await dispatch(
        fetchExistingHydrationData(token)
      ).unwrap();

      const hydrationDataArray = API_response.existingHydrationData || [];

      setHydrationData(hydrationDataArray);
    } catch (error) {
      console.error("Error fetching hydration data:", error);
    }
  };

  // Function to get recommendations
  const getRecommendations = (newHydrationDataEntries) => {
    const recommendations = [];

    // Example recommendations for hydration
    if (parseInt(newHydrationDataEntries?.dailyWaterIntake, 10) < 2000) {
      recommendations.push("Aim to drink at least 2 liters of water per day.");
      recommendations.push(
        "Consider increasing your fluid intake if you are active or in hot climates."
      );
    }

    if (newHydrationDataEntries?.type === "Caffeinated") {
      recommendations.push(
        "Limit caffeinated drinks as they can dehydrate you."
      );
      recommendations.push("Balance your intake with plenty of water.");
    }

    // General recommendations
    recommendations.push(
      "Maintain a balanced diet and stay hydrated throughout the day."
    );
    recommendations.push(
      "Monitor your hydration needs based on your activity levels."
    );

    return recommendations;
  };

  // Function to add new hydration data
  const handleAddNewHydrationData = async () => {
    const token = user?.token;

    // Validate and parse amount
    const parsedDailyWaterIntake = parseInt(dailyWaterIntake, 10);
    if (isNaN(parsedDailyWaterIntake)) {
      console.error("Invalid value for daily water intake:", dailyWaterIntake);
      return;
    }

    // Prepare the hydration data entries
    const newHydrationDataEntries = {
      date,
      dailyWaterIntake: parsedDailyWaterIntake,
      note,
    };

    // Generate recommendations
    const newRecommendations = getRecommendations(newHydrationDataEntries);
    setRecommendations(newRecommendations);

    // Set new hydration data
    setNewHydrationData(newHydrationDataEntries);

    try {
      // Add new hydration data and fetch updated data
      await dispatch(
        addNewHydrationData({
          newHydrationData: newHydrationDataEntries,
          recommendations: newRecommendations,
          token,
        })
      ).unwrap();

      // Fetch and update existing hydration data
      const { existingHydrationData = [] } = await dispatch(
        fetchExistingHydrationData(token)
      ).unwrap();
      setHydrationData(existingHydrationData);

      // Close form and show recommendations
      onFormModalClose();
      onViewRecommendationsModalOpen();
    } catch (error) {
      console.error("Error in addNewHydrationData:", error);
    }

    // Reset form fields
    resetFormFields();
  };

  // Helper function to reset form fields
  const resetFormFields = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setDailyWaterIntake("");
    setNote("");
  };

  // State to track whether the form is in edit mode
  const [isEditMode, setIsEditMode] = useState({
    date: false,
    dailyWaterIntake: false,
    note: false,
  });

  // Form data state
  const [formData, setFormData] = useState({
    date: "",
    dailyWaterIntake: "0",
    note: "",
  });

  // Use effect to update formData when selectedHydration changes
  useEffect(() => {
    if (selectedHydration) {
      const hydrationData = selectedHydration.hydration || {};
      setFormData({
        date: hydrationData.date || "",
        dailyWaterIntake: hydrationData.dailyWaterIntake || "",
        note: hydrationData.note || "",
      });
    }
  }, [selectedHydration]);

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

  // Function to handle updating existing hydration data
  const handleSubmitUpdate = async () => {
    const token = user?.token;

    // Parse amount to ensure it's a valid number
    const parsedDailyWaterIntake = parseInt(formData.dailyWaterIntake, 10);

    if (isNaN(parsedDailyWaterIntake)) {
      console.error(
        "Invalid value for daily water intake:",
        formData.dailyWaterIntake
      );
      return;
    }

    // Prepare the hydration data update entries
    const hydrationDataUpdateEntries = {
      ...formData,
      dailyWaterIntake: parsedDailyWaterIntake,
    };

    console.log(
      "Submitting updated hydration data:",
      hydrationDataUpdateEntries
    );

    try {
      // Dispatch the update action and wait for the result
      const updatedData = await dispatch(
        updateExistingHydrationData({
          id: selectedHydration._id,
          hydrationDataUpdateEntries,
          token,
        })
      ).unwrap();

      // console.log("Updated data received from API:", updatedData);

      // Fetch updated hydration data
      const { existingHydrationData = [] } = await dispatch(
        fetchExistingHydrationData(token)
      ).unwrap();
      setHydrationData(existingHydrationData);

      // Close the update modal
      onViewMoreModalClose();
    } catch (error) {
      console.error("Error in updateExistingHydrationData:", error);
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

  // Function to handle deleting existing hydration data
  const handleDeleteExistingHydrationData = async () => {
    const token = user?.token;

    try {
      // Dispatch the delete action
      await dispatch(
        deleteExistingHydrationData({ id: selectedHydration._id, token })
      ).unwrap();

      // Fetch updated hydration data
      const { existingHydrationData = [] } = await dispatch(
        fetchExistingHydrationData(token)
      ).unwrap();
      setHydrationData(existingHydrationData);

      // Close the view more modal
      onViewMoreModalClose();
    } catch (error) {
      console.error("Error in deleteExistingHydrationData:", error);
    }
  };

  // function to format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  // function to get month and day from month
  const getMonthAndDay = (date) => {
    const dateTime = DateTime.fromISO(date);
    return dateTime.toFormat("MMM d"); // e.g., "Sep 15"
  };

  // Render component
  return (
    <Box p={5} maxW={{ base: "100%", md: "80%", lg: "70%" }} mx="auto">
      <Heading as="h3" size="lg" mb={4}>
        Hydration Tracker
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
            onClick={handleFetchExistingHydrationData}
            isLoading={loading}
          >
            Try Again
          </Button>
        </Box>
      ) : hydrationData.length === 0 ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          textAlign="center"
          minHeight="500px"
        >
          <Text>No hydration data available.</Text>
          <Button colorScheme="blue" mt={4} onClick={onFormModalOpen}>
            Start Tracking hydration
          </Button>
        </Box>
      ) : (
        <Stack spacing={8}>
          <Flex justify="flex-end">
            <Button onClick={onFormModalOpen} colorScheme="blue">
              Add Hydration Data
            </Button>
          </Flex>

          {/*hydration chart and table  */}
          <Box
            h={{ base: "250px", md: "600px" }}
            w={{ base: "600px", md: "764px" }}
            overflow="scroll"
          >
            {/* hydration chart */}
            <Box h={{ base: "250px", md: "400px" }} w="100%" p={4} bg="white">
              <Line
                data={{
                  labels: hydrationData.map((data) =>
                    getMonthAndDay(data.hydration.date)
                  ),
                  datasets: [
                    {
                      label: "Hydration (ml)",
                      data: hydrationData.map(
                        (data) => data.hydration.dailyWaterIntake
                      ),
                      fill: false,
                      borderColor: "#3182ce",
                      tension: 0.1,
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false, // Allows the chart to fill the container
                  responsive: true, // Ensures the chart adjusts with the container size
                }}
                width={"100%"} // Set the chart width to 100%
                height={null} // Let the height be determined by the container
              />
            </Box>

            {/* hydration data table */}
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
                    <Th>#</Th>
                    <Th>Date</Th>
                    <Th>Daily Water Intake</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {Array.isArray(hydrationData) && hydrationData.length > 0 ? (
                    hydrationData.map((data, index) => (
                      <Tr key={data.hydration._id}>
                        <Td>{index + 1}</Td>
                        <Td>{formatDate(data.hydration.date)}</Td>
                        <Td>{data.hydration.dailyWaterIntake} ml</Td>

                        <Td>
                          <Button
                            size="sm"
                            onClick={() => handleViewMore(data)}
                            colorScheme="blue"
                          >
                            View More
                          </Button>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={4} textAlign="center">
                        No hydration data available
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </Stack>
      )}

      {/* Modal to add new hydration data */}
      <Modal isOpen={isFormModalOpen} onClose={onFormModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Hydration Data</ModalHeader>
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
              <FormLabel>Daily Water Intake (ml)</FormLabel>
              <Input
                type="number"
                value={dailyWaterIntake}
                onChange={(e) => setDailyWaterIntake(e.target.value)}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Note</FormLabel>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Any additional notes on your hydration level data?"
                size="sm"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleAddNewHydrationData}
              isLoading={loading}
            >
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal to view recommendations */}
      <Modal
        isOpen={isViewRecommendationsModalOpen}
        onClose={onViewRecommendationsModalClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Recommendations</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="lg" mb={4}>
              Here are some recommendations for your hydration data:
            </Text>
            <ul>
              {recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              onClick={onViewRecommendationsModalClose}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal to view more details */}
      <Modal isOpen={isViewMoreModalOpen} onClose={onViewMoreModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Hydration Data Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Date</FormLabel>
              {renderEditableField("Date", "date", formatDate(formData.date))}
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Daily Water Intake (ml)</FormLabel>
              {renderEditableField(
                "DailyWaterIntake",
                "dailyWaterIntake",
                formData.dailyWaterIntake
              )}
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Note</FormLabel>
              {renderEditableField("Note", "note", formData.note)}
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSubmitUpdate}>
              Save Changes
            </Button>
            <Button
              colorScheme="red"
              mr={3}
              onClick={() => openConfirmDeleteModal(selectedHydration._id)}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal isOpen={isConfirmDeleteOpen} onClose={closeConfirmDeleteModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete this hydration entry?
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              onClick={() => {
                handleDeleteExistingHydrationData(idToDelete);
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

export default HydrationTracker;
