import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../../store/slices/user/auth/userAuthSlice";
import {
  Box,
  Flex,
  Stack,
  Text,
  Heading,
  Button,
  Spinner,
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
  Textarea,
  IconButton,
  FormControl,
  FormLabel,
  InputGroup,
  Input,
  InputRightElement
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";

import {
  fetchExistingMoodData,
  addNewMoodData,
  updateExistingMoodData,
  deleteExistingMoodData,
  selectAllMoodData,
  selectMoodDataLoading,
  selectMoodDataError,
} from "../../../store/slices/metrics/moodSlice";

import { DateTime } from "luxon";

import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const MoodTracker = () => {
  const user = useSelector(selectUser);
  const token = user?.token;
  const dispatch = useDispatch();
  const loading = useSelector(selectMoodDataLoading);
  const error = useSelector(selectMoodDataError);
  const [moodData, setMoodData] = useState([]);
  const [newMoodData, setNewMoodData] = useState(null);

  // Form states
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [moodStatus, setMoodStatus] = useState("Happy");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");

  // Modal disclosures
  const {
    isOpen: isFormModalOpen,
    onOpen: onFormModalOpen,
    onClose: onFormModalClose,
  } = useDisclosure();

  const {
    isOpen: isViewRecommendationsModalOpen,
    onOpen: onViewRecommendationsModalOpen,
    onClose: onViewRecommendationsModalClose,
  } = useDisclosure();

  const [selectedMood, setSelectedMood] = useState(null);
  const {
    isOpen: isViewMoreModalOpen,
    onOpen: onViewMoreModalOpen,
    onClose: onViewMoreModalClose,
  } = useDisclosure();

  const handleViewMore = (mood) => {
    setSelectedMood(mood);
    onViewMoreModalOpen();
  };

  // use effect to fecth existing mood data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (token) {
          const API_response = await dispatch(
            fetchExistingMoodData(token)
          ).unwrap();
          console.log("Fetch Mood Data Response:", API_response);
          const moodDataArray = API_response.existingMoodData || [];
          console.log("Mood Data Array:", moodDataArray);
          setMoodData(moodDataArray);
        }
      } catch (error) {
        console.error("Error fetching mood data:", error);
      }
    };

    fetchData();
  }, [dispatch, token]);

  // Function to handle fetching existing hydration data
  const handleFetchExistingMoodData = async () => {
    const token = user?.token;

    try {
      // Dispatch the delete action
      const API_response = await dispatch(
        fetchExistingMoodData(token)
      ).unwrap();

      const moodDataArray = API_response.existingMoodData || [];

      setMoodData(moodDataArray);
    } catch (error) {
      console.error("Error in fecthing mood data:", error);
    }
  };


  // function to get recommendations
  const getRecommendations = (newMoodDataEntries) => {
    const recommendations = [];

    switch (newMoodDataEntries.moodStatus) {
      case "Sad":
        recommendations.push(
          "Consider speaking with a mental health professional."
        );
        recommendations.push("Engage in activities that you enjoy.");
        recommendations.push("Connect with friends or family for support.");
        break;

      case "Anxious":
        recommendations.push(
          "Practice relaxation techniques such as deep breathing."
        );
        recommendations.push("Engage in regular physical activity.");
        recommendations.push("Consider mindfulness or meditation practices.");
        break;

      case "Happy":
        recommendations.push(
          "Maintain a gratitude journal to reflect on positive experiences."
        );
        recommendations.push(
          "Share your happiness with others through acts of kindness."
        );
        recommendations.push(
          "Engage in activities that continue to bring you joy."
        );
        break;

      case "Angry":
        recommendations.push(
          "Take deep breaths and try to calm down before reacting."
        );
        recommendations.push(
          "Engage in physical activities like exercise to release tension."
        );
        recommendations.push(
          "Consider talking to someone about what's bothering you."
        );
        break;

      case "Neutral":
        recommendations.push(
          "Take time to reflect on your day and identify any triggers."
        );
        recommendations.push(
          "Engage in activities that you enjoy to boost your mood."
        );
        recommendations.push(
          "Stay connected with loved ones to maintain a balanced emotional state."
        );
        break;

      default:
        recommendations.push(
          "Continue monitoring your mood and take care of your well-being."
        );
    }

    return recommendations;
  };


  // function to add new mood data
  const handleAddNewMoodData = async () => {
    const newMoodDataEntries = {
      date,
      moodStatus,
      description,
      notes,
    };

    const newRecommendations = getRecommendations(newMoodDataEntries);
    setNewMoodData(newMoodDataEntries);

    try {
      await dispatch(
        addNewMoodData({
          newMoodData: newMoodDataEntries,
          recommendations: newRecommendations,
          token,
        })
      ).unwrap();
      const { existingMoodData = [] } = await dispatch(
        fetchExistingMoodData(token)
      ).unwrap();
      setMoodData(existingMoodData);
      onFormModalClose();
      onViewRecommendationsModalOpen();
    } catch (error) {
      console.error("Error adding new mood data:", error);
    }

    resetFormFields();
  };


  // function to reset form fields
  const resetFormFields = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setMoodStatus("Happy");
    setDescription("");
    setNotes("");
  };

  // State to track whether the form is in edit mode
  const [isEditMode, setIsEditMode] = useState({
    date: false,
    moodStatus: false,
    description: false,
    note: false,
  });

  // Form data state
  const [formData, setFormData] = useState({
    date: "",
    moodStatus: "",
    description: "",
    note: "",
  });

  // Use effect to update formData when selectedMood changes
  useEffect(() => {
    if (selectedMood) {
      const moodData = selectedMood.mood || {};
      console.log(moodData);
      setFormData({
        date: moodData.date || "",
        moodStatus: moodData.moodStatus || "",
        description: moodData.description || "",
        note: moodData.note || "",
      });
    }
  }, [selectedMood]);

  // Log formData outside the useEffect
  useEffect(() => {
    console.log("Form data initialized:", formData);
  }, [formData]);

  // Function to edit mode handle input changes
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

  // Function to handle updating existing mood data
  const handleSubmitUpdate = async () => {
    const token = user?.token;

    // Prepare the mood data update entries
    const moodDataUpdateEntries = {
      ...formData,
    };

    console.log("Submitting updated hydration data:", moodDataUpdateEntries);

    try {
      // Dispatch the update action and wait for the result
      const updatedData = await dispatch(
        updateExistingMoodData({
          id: selectedMood._id,
          moodDataUpdateEntries,
          token,
        })
      ).unwrap();

      console.log("Updated data received from API:", updatedData);

      // Fetch updated mood data
      const { existingMoodData = [] } = await dispatch(
        fetchExistingMoodData(token)
      ).unwrap();
      setHydrationData(existingMoodData);

      // Close the update modal
      onViewMoreModalClose();
    } catch (error) {
      console.error("Error in updateExistingMoodData:", error);
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

  // function to delete an existing mood data
  const handleDeleteExistingMoodData = async (id) => {
    try {
      await dispatch(deleteExistingMoodData({ id, token })).unwrap();
      setMoodData((prevData) => prevData.filter((mood) => mood._id !== id));
      onViewMoreModalClose();
    } catch (error) {
      console.error("Error deleting mood data:", error);
    }
  };


  // function to format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };


  // function to get month and day from date
  const getMonthAndDay = (date) => {
    const dateTime = DateTime.fromISO(date);
    return dateTime.toFormat("MMM d");
  };


  // mapping numerical value to mood status
  const moodStatusMapping = {
    Happy: 1,
    Sad: 2,
    Anxious: 3,
    Angry: 4,
    Neutral: 5,
  };

  console.log("Mood Data for Chart:", moodData);

  // mood chart data
  const moodChartData = {
    labels: moodData.map((entry) => getMonthAndDay(entry.mood.date)),
    datasets: [
      {
        label: "Mood",
        data: moodData.map(
          (entry) => moodStatusMapping[entry.mood.moodStatus] || 0
        ),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // mood chart options
  const moodChartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      y: {
        min: 0,
        max: 4,
        ticks: {
          stepSize: 1, // Ensure the scale increments by 1
          callback: function (value) {
            return value; // Display the value as the label
          },
        },
      },
    },
  };

  return (
    <Box p={5} maxW={{ base: "100%", md: "80%", lg: "70%" }} mx="auto">
      <Heading mb={4}>Mood Tracker</Heading>

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
            onClick={handleFetchExistingMoodData}
            isLoading={loading}
          >
            Try Again
          </Button>
        </Box>
      ) : moodData.length === 0 ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          textAlign="center"
          minHeight="500px"
        >
          <Text>No Mood data available.</Text>
          <Button colorScheme="blue" mt={4} onClick={onFormModalOpen}>
            Start Tracking Mood
          </Button>
        </Box>
      ) : (
        <Stack spacing={8}>
          <Flex justifyContent="flex-end">
            <Button colorScheme="blue" onClick={onFormModalOpen}>
              Add New Mood Entry
            </Button>
          </Flex>

          <Box h={{ base: "800px", md: "600px" }} overflow="scroll">
            <Box h={{ base: "250px", md: "400px" }} w="100%" p={4} bg="white">
              <Bar
                data={moodChartData}
                options={moodChartOptions}
                width={"100%"} // Set the chart width to 100%
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
                    <Th>#</Th>
                    <Th>Date</Th>
                    <Th>Mood Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {Array.isArray(moodData) && moodData.length > 0 ? (
                    moodData.map((entry, index) => (
                      <Tr key={entry.mood._id}>
                        <Td>{index + 1}</Td>
                        <Td>{formatDate(entry.mood.date)}</Td>

                        <Td>
                          {typeof entry.mood.moodStatus === "string"
                            ? entry.mood.moodStatus
                            : "Unknown"}
                        </Td>

                        <Td>
                          <Button
                            colorScheme="blue"
                            onClick={() => handleViewMore(entry)}
                          >
                            View More
                          </Button>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={4} textAlign="center">
                        No weight data available
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </Stack>
      )}

      {/* Add New Mood Data Modal */}
      <Modal isOpen={isFormModalOpen} onClose={onFormModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Mood Data</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Date</FormLabel>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Mood Status</FormLabel>
              <Select
                value={moodStatus}
                onChange={(e) => setMoodStatus(e.target.value)}
              >
                <option value="Happy">Happy</option>
                <option value="Sad">Sad</option>
                <option value="Anxious">Anxious</option>
                <option value="Angry">Angry</option>
                <option value="Neutral">Neutral</option>
              </Select>
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe how you feel in this mood level"
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Notes</FormLabel>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes about your mood?"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleAddNewMoodData}>
              Add
            </Button>
            <Button onClick={onFormModalClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Recommendations Modal */}
      <Modal
        isOpen={isViewRecommendationsModalOpen}
        onClose={onViewRecommendationsModalClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Recommendations</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ul>
              {newMoodData &&
                getRecommendations(newMoodData).map((rec, index) => (
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
          <ModalHeader>Mood Data Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Date</FormLabel>
              {renderEditableField("Date", "date", formatDate(formData.date))}
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Mood Status</FormLabel>
              {renderEditableField(
                "MoodStatus",
                "MoodStatus",
                formData.moodStatus
              )}
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Description</FormLabel>
              {renderEditableField(
                "Description",
                "description",
                formData.description
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
              onClick={() => openConfirmDeleteModal(selectedMood._id)}
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
            Are you sure you want to delete this mood entry?
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              onClick={() => {
                handleDeleteExistingMoodData(idToDelete);
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

export default MoodTracker;
