import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../../store/slices/user/auth/userAuthSlice";
import {
  Stack,
  Box,
  Flex,
  Heading,
  Spinner,
  FormControl,
  FormLabel,
  InputGroup,
  Input,
  InputRightElement,
  Button,
  IconButton,
  Textarea,
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
  fetchExistingDietaryData,
  addNewDietaryData,
  updateExistingDietaryData,
  deleteExistingDietaryData,
  selectDietaryDataLoading,
  selectDietaryDataError,
} from "../../../store/slices/metrics/dietaryIntakeSlice";

import { DateTime } from "luxon";

const DietaryTracker = () => {
  const user = useSelector(selectUser);
  const token = user?.token;
  const dispatch = useDispatch();
  const loading = useSelector(selectDietaryDataLoading);
  const error = useSelector(selectDietaryDataError);
  const [dietaryData, setDietaryData] = useState([]);
  const [newDietaryData, setNewDietaryData] = useState(null);

  // Dietary data entries
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );

  const [mealType, setMealType] = useState("Breakfast");
  const [foodItem, setFoodItem] = useState("");
  const [foodClass, setFoodClass] = useState("Carbohydrate");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");
  const [note, setNote] = useState("");

  // Modal disclosure for form inputs
  const {
    isOpen: isFormModalOpen,
    onOpen: onFormModalOpen,
    onClose: onFormModalClose,
  } = useDisclosure();

  // Dietary recommendations
  const [recommendations, setRecommendations] = useState([]);
  const {
    isOpen: isViewRecommendationsModalOpen,
    onOpen: onViewRecommendationsModalOpen,
    onClose: onViewRecommendationsModalClose,
  } = useDisclosure();

  // Selected dietary data
  const [selectedDietary, setSelectedDietary] = useState(null);
  const {
    isOpen: isViewMoreModalOpen,
    onOpen: onViewMoreModalOpen,
    onClose: onViewMoreModalClose,
  } = useDisclosure();

  const handleViewMore = (dietary) => {
    setSelectedDietary(dietary);
    onViewMoreModalOpen();
  };

  // Use effect to fetch dietary data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (token) {
          const API_response = await dispatch(
            fetchExistingDietaryData(token)
          ).unwrap();
          console.log("Fetch Dietary Data Response:", API_response);

          const dietaryDataArray = API_response.existingDietaryData || [];
          console.log("This is the dietary data array:", dietaryDataArray);

          setDietaryData(dietaryDataArray);
        }
      } catch (error) {
        console.error("Error fetching dietary data:", error);
      }
    };

    fetchData();
  }, [dispatch, token]);

  // Function to handle fetching existing dietary data
  const handleFetchExistingDietaryData = async () => {
    const token = user?.token;

    try {
      // Dispatch the fetch action
      const API_response = await dispatch(
        fetchExistingDietaryData(token)
      ).unwrap();

      const dietaryDataArray = API_response.existingDietaryData || [];

      setDietaryData(DietaryDataArray);
    } catch (error) {
      console.error("Error fetching dietary data:", error);
    }
  };

  // Function to get recommendations
  const getRecommendations = (newDietaryDataEntries) => {
    const recommendations = [];

    // Check for high calorie intake
    if (parseInt(newDietaryDataEntries?.calories, 10) > 2000) {
      recommendations.push(
        "Consider reducing your daily calorie intake to maintain a balanced diet."
      );
    }

    // Check for low protein intake
    if (parseInt(newDietaryDataEntries?.protein, 10) < 50) {
      recommendations.push(
        "Increase your protein intake to support muscle health."
      );
    }

    // Check for high carb intake
    if (parseInt(newDietaryDataEntries?.carbs, 10) > 250) {
      recommendations.push(
        "Try to reduce your carbohydrate intake, focusing on complex carbs."
      );
    }

    // Check for high fat intake
    if (parseInt(newDietaryDataEntries?.fats, 10) > 70) {
      recommendations.push(
        "Limit your intake of saturated fats and focus on healthy fats."
      );
    }

    // General recommendations
    recommendations.push(
      "Maintain a balanced diet with a variety of nutrients."
    );
    recommendations.push(
      "Stay hydrated and incorporate regular physical activity into your routine."
    );

    return recommendations;
  };

  // Function to add new dietary data
  const handleAddNewDietaryData = async () => {
    const token = user?.token;

    // Prepare the dietary data entries
    const newDietaryDataEntries = {
      date,
      mealType,
      foodType,
      calories,
      protein,
      carbs,
      fats,
      note,
    };

    // Generate recommendations
    const newRecommendations = getRecommendations(newDietaryDataEntries);
    setRecommendations(newRecommendations);

    // Set new dietary data
    setNewDietaryData(newDietaryDataEntries);

    try {
      // Add new dietary data and fetch updated data
      await dispatch(
        addNewDietaryData({
          newDietaryData: newDietaryDataEntries,
          recommendations: newRecommendations,
          token,
        })
      ).unwrap();

      // Fetch and update existing dietary data
      const { existingDietaryData = [] } = await dispatch(
        fetchExistingDietaryData(token)
      ).unwrap();
      setDietaryData(existingDietaryData);

      // Close form and show recommendations
      onFormModalClose();
      onViewRecommendationsModalOpen();
    } catch (error) {
      console.error("Error in addNewDietaryData:", error);
    }

    // Reset form fields
    resetFormFields();
  };

  // Helper function to reset form fields
  const resetFormFields = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setMealType("Breakfast");
    setFoodItem("");
    setFoodClass("Carbohydrate");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFats("");
    setNote("");
  };

  // State to track whether the form is in edit mode
  const [isEditMode, setIsEditMode] = useState({
    date: false,
    mealType: false,
    foodItem: false,
    foodClass: false,
    calories: false,
    protein: false,
    carbs: false,
    fats: false,
    note: false,
  });

  // Form data state
  const [formData, setFormData] = useState({
    date: "",
    mealType: "",
    foodItem: "",
    foodClass: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    note: "",
  });

  // useEffect to update formData when selectedDietary changes
  useEffect(() => {
    if (selectedDietary) {
      const dietaryData = selectedDietary.dietary || {};
      setFormData({
        date: dietaryData.date || "",
        mealType: dietaryData.mealType || "",
        foodItem: dietaryData.foodItem || "",
        foodClass: dietaryData.foodClass || "",
        calories: dietaryData.calories || "",
        protein: dietaryData.protein || "",
        carbs: dietaryData.carbs || "",
        fats: dietaryData.fats || "",
        note: dietaryData.note || "",
      });
    }
  }, [selectedDietary]);

  // Function to handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
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
      {/* <FormLabel>{label}</FormLabel> */}
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

  // Function to handle updating existing dietary data
  const handleSubmitUpdate = async () => {
    const token = user?.token;
    try {
      const updatedData = await dispatch(
        updateExistingDietaryData({
          id: selectedDietary._id,
          dietaryDataUpdateEntries: formData,
          token,
        })
      ).unwrap();

      setDietaryData((prevData) =>
        prevData.map((dietary) =>
          dietary._id === updatedData._id ? updatedData : dietary
        )
      );
      onViewMoreModalClose();
    } catch (error) {
      console.error("Error updating dietary data:", error);
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

  // Function to handle deleting existing dietary data
  const handleDelete = async () => {
    try {
      await dispatch(
        deleteExistingDietaryData({ id: selectedDietary._id, token })
      ).unwrap();
      setDietaryData((prevData) =>
        prevData.filter((dietary) => dietary._id !== selectedDietary._id)
      );

      // Fetch updated dietary data
      const { updatedDietaryData = [] } = await dispatch(
        fetchExistingDietaryData(token)
      ).unwrap();

      setDietaryData(updatedDietaryData);

      onViewMoreModalClose();
    } catch (error) {
      console.error("Error deleting dietary data:", error);
    }
  };

  // Chart data
  const chartData = {
    labels: dietaryData.map((data) =>
      DateTime.fromISO(data.date).toLocaleString(DateTime.DATE_MED)
    ),
    datasets: [
      {
        label: "Calories",
        data: dietaryData.map((data) => parseFloat(data.calories) || 0),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Protein",
        data: dietaryData.map((data) => parseFloat(data.protein) || 0),
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
      {
        label: "Carbs",
        data: dietaryData.map((data) => parseFloat(data.carbs) || 0),
        backgroundColor: "rgba(255, 159, 64, 0.2)",
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 1,
      },
      {
        label: "Fats",
        data: dietaryData.map((data) => parseFloat(data.fats) || 0),
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

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
            onClick={handleFetchExistingDietarData}
            isLoading={loading}
          >
            Try Again
          </Button>
        </Box>
      ) : dietaryIntakeData.length === 0 ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          textAlign="center"
          minHeight="500px"
        >
          <Text>No dietary intake data available.</Text>
          <Button colorScheme="blue" mt={4} onClick={onFormModalOpen}>
            Start Tracking Dietary
          </Button>
        </Box>
      ) : (
        <Stack spacing={8}>
          <Flex justify="flex-end">
            <Button onClick={onFormModalOpen} colorScheme="blue">
              Add Dietary Data
            </Button>
          </Flex>

          {/*dietary chart and table  */}
          <Box h={{ base: "800px", md: "600px" }} overflow="scroll">
            {/* dietary chart */}
            <Box h={{ base: "250px", md: "400px" }} w="100%" p={4} bg="white">
              <Bar
                data={chartData}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                }}
                width={"100%"}
                height={null}
              />
            </Box>

            {/* dietary data table */}
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
                    <Th>Meal Type</Th>
                    <Th>Food Item</Th>
                    <Th>Food Class</Th>
                    <Th>Calories</Th>
                    <Th>Protein</Th>
                    <Th>Carbs</Th>
                    <Th>Fats</Th>
                    <Th>Note</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {Array.isArray(dietaryData) && dietaryData.length > 0 ? (
                    dietaryData.map((data, index) => (
                      <Tr key={data.dietary._id}>
                        <Td>{index + 1}</Td>
                        <Td>
                          {DateTime.fromISO(data.dietary.date).toLocaleString(
                            DateTime.DATE_MED
                          )}
                        </Td>
                        <Td>{data.dietary.mealType}</Td>
                        <Td>{data.dietary.foodItem}</Td>
                        <Td>{data.dietary.foodClass}</Td>
                        <Td>{data.dietary.calories}</Td>

                        <Td>
                          <Button
                            size="sm"
                            onClick={() => handleViewMore(dietary)}
                            colorScheme="blue"
                          >
                            View More
                          </Button>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={6} textAlign="center">
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

      {/* Form Modal */}
      <Modal isOpen={isFormModalOpen} onClose={onFormModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Dietary Data</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* date */}
            <FormControl mb={4}>
              <FormLabel>Date</FormLabel>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </FormControl>

            {/* meal type */}
            <FormControl mb={4}>
              <FormLabel>Meal Type</FormLabel>
              <Select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
              >
                <option>Breakfast</option>
                <option>Lunch</option>
                <option>Dinner</option>
                <option>Snack</option>
              </Select>
            </FormControl>

            {/* food item */}
            <FormControl mb={4}>
              <FormLabel>Food Item</FormLabel>
              <Input
                type="text"
                value={foodItem}
                onChange={(e) => setFoodItem(e.target.value)}
              />
            </FormControl>

            {/* food class */}
            <FormControl mb={4}>
              <FormLabel>Food Class</FormLabel>
              <Select
                value={foodClass}
                onChange={(e) => setFoodClass(e.target.value)}
              >
                <option>Carbohydrate</option>
                <option>Protein</option>
                <option>Carbs and Protein</option>
                <option>Fats</option>
              </Select>
            </FormControl>

            {/* calories */}
            <FormControl mb={4}>
              <FormLabel>Calories</FormLabel>
              <Input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />
            </FormControl>

            {/* carbs */}
            <FormControl mb={4}>
              <FormLabel>Protein</FormLabel>
              <Input
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
              />
            </FormControl>

            {/* protein */}
            <FormControl mb={4}>
              <FormLabel>Carbs</FormLabel>
              <Input
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
              />
            </FormControl>

            {/* fats */}
            <FormControl mb={4}>
              <FormLabel>Fats</FormLabel>
              <Input
                type="number"
                value={fats}
                onChange={(e) => setFats(e.target.value)}
              />
            </FormControl>

            {/* note */}
            <FormControl mb={4}>
              <FormLabel>Note</FormLabel>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={handleAddNewDietaryData}>
              Save
            </Button>
            <Button ml={3} onClick={onFormModalClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Recommendations Modal */}
      <Modal
        isOpen={isViewRecommendationsModalOpen}
        onClose={onViewRecommendationsModalClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Dietary Recommendations</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontWeight="bold">Recommendations:</Text>
            {recommendations.map((rec, index) => (
              <Text key={index} mb={2}>
                {rec}
              </Text>
            ))}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="teal"
              onClick={onViewRecommendationsModalClose}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View More Modal */}
      <Modal isOpen={isViewMoreModalOpen} onClose={onViewMoreModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Dietary Data Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedDietary && (
              <>
                {renderEditableField("Date", "date", formData.date)}
                {renderEditableField(
                  "Meal Type",
                  "mealType",
                  formData.mealType
                )}
                {renderEditableField(
                  "Food Item",
                  "foodItem",
                  formData.foodItem
                )}
                {renderEditableField(
                  "Food Class",
                  "foodClass",
                  formData.foodClass
                )}
                {renderEditableField("Calories", "calories", formData.calories)}
                {renderEditableField("Protein", "protein", formData.protein)}
                {renderEditableField("Carbs", "carbs", formData.carbs)}
                {renderEditableField("Fats", "fats", formData.fats)}
                {renderEditableField("Note", "note", formData.note)}
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={handleSubmitUpdate}>
              Update
            </Button>
            <Button
              colorScheme="red"
              onClick={() => openConfirmDeleteModal(selectedDietary._id)}
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
            Are you sure you want to delete this dietary intake entry?
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              onClick={() => {
                handleDelete(idToDelete);
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

export default DietaryTracker;
