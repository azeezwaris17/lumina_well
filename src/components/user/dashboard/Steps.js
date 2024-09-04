import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../../store/slices/user/auth/userAuthSlice";
import {
  Box,
  Flex,
  Heading,
  FormControl,
  FormLabel,
  InputGroup,
  Input,
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
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import { Bar } from "react-chartjs-2";
import {
  fetchExistingStepsData,
  addNewStepsData,
  updateExistingStepsData,
  deleteExistingStepsData,
  selectAllStepsData,
  selectStepsDataLoading,
  selectStepsDataError,
} from "../../../store/slices/metrics/stepsSlice";
import { DateTime } from "luxon";

const StepsTracker = () => {
  const user = useSelector(selectUser);
  const token = user?.token;
  const dispatch = useDispatch();
  const loading = useSelector(selectStepsDataLoading);
  const error = useSelector(selectStepsDataError);
  const [stepsData, setStepsData] = useState([]);
  const [newStepsData, setNewStepsData] = useState(null);

  // Steps data entries
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [stepsCount, setStepsCount] = useState("0");
  const [distance, setDistance] = useState("");
  const [caloriesBurned, setCaloriesBurned] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [notes, setNotes] = useState("");

  // Modal disclosure for form inputs
  const {
    isOpen: isFormModalOpen,
    onOpen: onFormModalOpen,
    onClose: onFormModalClose,
  } = useDisclosure();

  // Selected steps data
  const [selectedSteps, setSelectedSteps] = useState(null);
  const {
    isOpen: isViewMoreModalOpen,
    onOpen: onViewMoreModalOpen,
    onClose: onViewMoreModalClose,
  } = useDisclosure();

  const handleViewMore = (steps) => {
    setSelectedSteps(steps);
    onViewMoreModalOpen();
  };

  // Use effect to fetch steps data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (token) {
          const API_response = await dispatch(
            fetchExistingStepsData(token)
          ).unwrap();
          console.log("Fetch Steps Data Response:", API_response);

          const stepsDataArray = API_response.existingStepsData || [];
          console.log("This is the steps data array:", stepsDataArray);

          setStepsData(stepsDataArray);
        }
      } catch (error) {
        console.error("Error fetching steps data:", error);
      }
    };

    fetchData();
  }, [dispatch, token]);

  // Function to handle adding new steps data
  const handleAddNewStepsData = async () => {
    const token = user?.token;

    // Validate and parse numeric fields
    const parsedStepsCount = parseInt(stepsCount, 10);
    const parsedDistance = parseFloat(distance);
    const parsedCaloriesBurned = parseFloat(caloriesBurned);

    if (isNaN(parsedStepsCount)) {
      console.error("Invalid value for steps count:", stepsCount);
      return;
    }

    // Prepare the steps data entries
    const newStepsDataEntries = {
      date,
      stepsCount: parsedStepsCount,
      distance: isNaN(parsedDistance) ? undefined : parsedDistance,
      caloriesBurned: isNaN(parsedCaloriesBurned)
        ? undefined
        : parsedCaloriesBurned,
      timeOfDay,
      notes,
    };

    // Set new steps data
    setNewStepsData(newStepsDataEntries);

    try {
      // Add new steps data and fetch updated data
      await dispatch(
        addNewStepsData({ newStepsData: newStepsDataEntries, token })
      ).unwrap();

      // Fetch and update existing steps data
      const { existingStepsData = [] } = await dispatch(
        fetchExistingStepsData(token)
      ).unwrap();

      setStepsData(existingStepsData);

      // Close form
      onFormModalClose();
    } catch (error) {
      console.error("Error in addNewStepsData:", error);
    }

    // Reset form fields
    resetFormFields();
  };

  // Helper function to reset form fields
  const resetFormFields = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setStepsCount("0");
    setDistance("");
    setCaloriesBurned("");
    setTimeOfDay("");
    setNotes("");
  };

  // State to track whether the form is in edit mode
  const [isEditMode, setIsEditMode] = useState({
    date: false,
    stepsCount: false,
    distance: false,
    caloriesBurned: false,
    timeOfDay: false,
    notes: false,
  });

  // Form data state
  const [formData, setFormData] = useState({
    date: "",
    stepsCount: "",
    distance: "",
    caloriesBurned: "",
    timeOfDay: "",
    notes: "",
  });

  // useEffect to update formData when selectedSteps changes
  useEffect(() => {
    if (selectedSteps) {
      setFormData({
        date: selectedSteps.date || "",
        stepsCount: selectedSteps.stepsCount || "",
        distance: selectedSteps.distance || "",
        caloriesBurned: selectedSteps.caloriesBurned || "",
        timeOfDay: selectedSteps.timeOfDay || "",
        notes: selectedSteps.notes || "",
      });
    }
  }, [selectedSteps]);

  // Function to handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    console.log("Updated form data:", { ...formData, [name]: value });
  };

  // Function to toggle edit mode for individual fields
  const toggleEditField = (fieldName) => {
    setIsEditMode((prevModes) => ({
      ...prevModes,
      [fieldName]: !prevModes[fieldName], // Toggle the edit mode for the field
    }));
  };

  // Function to render an editable input field
  const renderEditableField = (label, name, value) => (
    <FormControl mb={4} key={name}>
      <FormLabel>{label}</FormLabel>
      <InputGroup>
        <Input
          name={name}
          type={name === "date" ? "date" : "text"}
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

  // Function to handle updating existing steps data
  const handleSubmitUpdate = async () => {
    const token = user?.token;

    // Parse numeric fields to ensure valid numbers
    const parsedStepsCount = parseInt(formData.stepsCount, 10);
    const parsedDistance = parseFloat(formData.distance);
    const parsedCaloriesBurned = parseFloat(formData.caloriesBurned);

    if (isNaN(parsedStepsCount)) {
      console.error("Invalid value for steps count:", formData.stepsCount);
      return;
    }

    // Prepare the steps data update entries
    const stepsDataUpdateEntries = {
      ...formData,
      stepsCount: parsedStepsCount,
      distance: isNaN(parsedDistance) ? undefined : parsedDistance,
      caloriesBurned: isNaN(parsedCaloriesBurned)
        ? undefined
        : parsedCaloriesBurned,
    };

    console.log("Submitting updated steps data:", stepsDataUpdateEntries);

    try {
      // Dispatch the update action and wait for the result
      const updatedData = await dispatch(
        updateExistingStepsData({
          id: selectedSteps._id,
          stepsDataUpdateEntries,
          token,
        })
      ).unwrap();

      console.log("Updated data received from API:", updatedData);

      // Update the local state with the new data
      setStepsData((prevData) =>
        prevData.map((steps) =>
          steps._id === selectedSteps._id ? { ...steps, ...updatedData } : steps
        )
      );
      onViewMoreModalClose();
    } catch (error) {
      console.error("Error in updateExistingStepsData:", error);
    }
  };

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  const openConfirmDeleteModal = (id) => {
    setIdToDelete(id);
    setIsConfirmDeleteOpen(true);
  };

  const closeConfirmDeleteModal = () => {
    setIsConfirmDeleteOpen(false);
    setIdToDelete(null);
  };

  const handleDeleteExistingStepsData = async (id) => {
    const token = user?.token;

    try {
      await dispatch(deleteExistingStepsData({ id, token })).unwrap();

      // Remove the deleted item from local state
      setStepsData((prevData) => prevData.filter((steps) => steps._id !== id));

      closeConfirmDeleteModal();
    } catch (error) {
      console.error("Error in deleteExistingStepsData:", error);
    }
  };

  const chartData = {
    labels: stepsData.map((data) =>
      DateTime.fromISO(data.date).toFormat("MMM DD")
    ),
    datasets: [
      {
        label: "Steps",
        data: stepsData.map((data) => data.stepsCount),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box p={4}>
      <Flex mb={4} justify="space-between" align="center">
        <Heading>Steps Tracker</Heading>
        <Button onClick={onFormModalOpen}>Add New Steps Data</Button>
      </Flex>

      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Steps Count</Th>
              <Th>Distance</Th>
              <Th>Calories Burned</Th>
              <Th>Time of Day</Th>
              <Th>Notes</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {stepsData.map((data) => (
              <Tr key={data._id}>
                <Td>{DateTime.fromISO(data.date).toFormat("MMM DD")}</Td>
                <Td>{data.stepsCount}</Td>
                <Td>{data.distance || "N/A"}</Td>
                <Td>{data.caloriesBurned || "N/A"}</Td>
                <Td>{data.timeOfDay || "N/A"}</Td>
                <Td>{data.notes || "N/A"}</Td>
                <Td>
                  <Button onClick={() => handleViewMore(data)}>
                    View More
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <Box mt={4}>
        <Bar data={chartData} />
      </Box>

      <Modal isOpen={isFormModalOpen} onClose={onFormModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Steps Data</ModalHeader>
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
              <FormLabel>Steps Count</FormLabel>
              <Input
                type="number"
                value={stepsCount}
                onChange={(e) => setStepsCount(e.target.value)}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Distance (Optional)</FormLabel>
              <Input
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Calories Burned (Optional)</FormLabel>
              <Input
                type="number"
                value={caloriesBurned}
                onChange={(e) => setCaloriesBurned(e.target.value)}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Time of Day (Optional)</FormLabel>
              <Input
                type="text"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Notes (Optional)</FormLabel>
              <Input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" onClick={handleAddNewStepsData}>
              Add
            </Button>
            <Button ml={3} onClick={onFormModalClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isViewMoreModalOpen} onClose={onViewMoreModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Steps Data</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedSteps && (
              <>
                {renderEditableField("Date", "date", formData.date)}
                {renderEditableField(
                  "Steps Count",
                  "stepsCount",
                  formData.stepsCount
                )}
                {renderEditableField("Distance", "distance", formData.distance)}
                {renderEditableField(
                  "Calories Burned",
                  "caloriesBurned",
                  formData.caloriesBurned
                )}
                {renderEditableField(
                  "Time of Day",
                  "timeOfDay",
                  formData.timeOfDay
                )}
                {renderEditableField("Notes", "notes", formData.notes)}
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleSubmitUpdate}>
              Update
            </Button>
            <Button
              ml={3}
              onClick={() => openConfirmDeleteModal(selectedSteps._id)}
            >
              Delete
            </Button>
            <Button ml={3} onClick={onViewMoreModalClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isConfirmDeleteOpen} onClose={closeConfirmDeleteModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete this entry?</Text>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              onClick={() => handleDeleteExistingStepsData(idToDelete)}
            >
              Delete
            </Button>
            <Button ml={3} onClick={closeConfirmDeleteModal}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default StepsTracker;
