import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../../store/slices/user/auth/userAuthSlice";
import {
  Box,
  Flex,
  Stack,
  Heading,
  FormControl,
  FormLabel,
  InputGroup,
  Input,
  InputRightElement,
  Checkbox,
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
  Spinner,
} from "@chakra-ui/react";

import { EditIcon } from "@chakra-ui/icons";


import {
  fetchExistingSleepData,
  addNewSleepData,
  updateExistingSleepData,
  deleteExistingSleepData,
 selectAllSleepData,
  selectSleepDataLoading,
  selectSleepDataError,
} from "../../../store/slices/metrics/sleepSlice";

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

const SleepTracker = () => {
  const user = useSelector(selectUser);
  const token = user?.token;
  const dispatch = useDispatch();
  const loading = useSelector(selectSleepDataLoading);
  const error = useSelector(selectSleepDataError);
  // const sleepData = useSelector(selectAllSleepData);

  const [sleepData, setSleepData] = useState([]);
  const [newSleepData, setnewSleepData] = useState(null);

  //   sleep data entries
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [time, setTime] = useState(DateTime.now().toFormat("HH:mm"));
  const [hoursSlept, setHoursSlept] = useState("4");
  const [sleepQuality, setSleepQuality] = useState("Poor");
  const [bedtime, setBedtime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [timeToFallAsleep, setTimeToFallAsleep] = useState("");
  const [awakenings, setAwakenings] = useState("");
  const [tookNap, setTookNap] = useState(false);
  const [sleepInterruptions, setSleepInterruptions] = useState("");
  const [sleepConsistency, setSleepConsistency] = useState("consistent");
  const [preSleepActivities, setPreSleepActivities] = useState("");
  const [stressLevels, setStressLevels] = useState("low");
  const [dietaryIntake, setDietaryIntake] = useState("");
  const [physicalActivity, setPhysicalActivity] = useState("none");
  const [note, setNote] = useState("");

  // modal disclosure for form inputs
  const {
    isOpen: isFormModalOpen,
    onOpen: onFormModalOpen,
    onClose: onFormModalClose,
  } = useDisclosure();

  //   sleep recommendations
  const [recommendations, setRecommendations] = useState([]);
  const {
    isOpen: isViewRecommendationsModalOpen,
    onOpen: onViewRecommendationsModalOpen,
    onClose: onViewRecommendationsModalClose,
  } = useDisclosure();

  //   selected sleep data
  const [selectedSleep, setSelectedSleep] = useState(null);
  const {
    isOpen: isViewMoreModalOpen,
    onOpen: onViewMoreModalOpen,
    onClose: onViewMoreModalClose,
  } = useDisclosure();

  const handleViewMore = (sleep) => {
    setSelectedSleep(sleep);
    onViewMoreModalOpen();
  };

  // use effect to fetch sleep data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (token) {
          const API_response = await dispatch(
            fetchExistingSleepData(token)
          ).unwrap();
          console.log("Fetch Sleep Data Response:", API_response);

          const sleepDataArray = API_response.existingSleepData || [];
          console.log("This is the sleep data array:", sleepDataArray);

          setSleepData(sleepDataArray);
        }
      } catch (error) {
        console.error("Error fetching sleep data:", error);
      }
    };

    fetchData();
  }, [dispatch, token]);

  // Function to handle fetching existing hydration data
  const handleFetchExistingSleepData = async () => {
    const token = user?.token;

    try {
      // Dispatch the delete action
      const API_response = await dispatch(
        fetchExistingSleepData(token)
      ).unwrap();

      const sleepDataArray = API_response.existingSleepData || [];

      setSleepData(sleepDataArray);
    } catch (error) {
      console.error("Error fetching sleep data:", error);
    }
  };

  // use effect to calculate sleep quality
  useEffect(() => {
    const calculateSleepQuality = (hours) => {
      if (hours >= 8) {
        return "Excellent";
      } else if (hours >= 6) {
        return "Good";
      } else {
        return "Poor";
      }
    };

    setSleepQuality(calculateSleepQuality(hoursSlept));
  }, [hoursSlept]);

  // function to get recommendation
  const getRecommendations = (newSleepDataEntries) => {
    const recommendations = [];

    // Check for insufficient sleep duration
    if (parseInt(newSleepDataEntries?.hoursSlept, 10) < 7) {
      recommendations.push("Aim for at least 7-8 hours of sleep per night.");
      recommendations.push("Avoid caffeine and heavy meals close to bedtime.");
      recommendations.push(
        "Stick to a consistent sleep schedule, even on weekends."
      );
      recommendations.push(
        "Consider taking short naps if necessary, but keep them under 30 minutes."
      );
    }

    // Check for poor sleep quality
    if (newSleepDataEntries?.sleepQuality === "poor") {
      recommendations.push(
        "Improve your sleep environment with a comfortable mattress and pillows."
      );
      recommendations.push("Limit screen time at least an hour before bed.");
      recommendations.push("Ensure your bedroom is cool, dark, and quiet.");
      recommendations.push(
        "Try relaxation techniques such as deep breathing or meditation."
      );
    }

    // Check for long time to fall asleep
    if (parseInt(newSleepDataEntries?.timeToFallAsleep, 10) > 30) {
      recommendations.push(
        "Establish a calming pre-sleep routine, such as reading or listening to soft music."
      );
      recommendations.push(
        "Avoid stimulating activities and bright lights before bed."
      );
      recommendations.push(
        "Consider taking a warm bath or practicing relaxation exercises before going to sleep."
      );
    }

    // Check for frequent awakenings
    if (parseInt(newSleepDataEntries?.awakenings, 10) > 2) {
      recommendations.push(
        "Try to identify and address the causes of awakenings, such as noise or light."
      );
      recommendations.push(
        "Maintain a consistent sleep environment free from disruptions."
      );
      recommendations.push(
        "Avoid drinking large amounts of fluids before bed to minimize the need to wake up."
      );
    }

    // Check if took nap
    if (newSleepDataEntries?.tookNap) {
      recommendations.push(
        "If you nap during the day, keep it brief and avoid napping too late."
      );
      recommendations.push(
        "Ensure naps are under 30 minutes to avoid interfering with nighttime sleep."
      );
    }

    // Check for sleep interruptions
    if (newSleepDataEntries?.sleepInterruptions) {
      recommendations.push(
        "Minimize disruptions by optimizing your sleep environment (e.g., blackout curtains, white noise)."
      );
      recommendations.push(
        "Consider managing pre-sleep activities to reduce the chance of interruptions."
      );
    }

    // Check for inconsistent sleep patterns
    if (newSleepDataEntries?.sleepConsistency === "inconsistent") {
      recommendations.push(
        "Try to maintain a consistent bedtime and wake time, even on weekends."
      );
      recommendations.push(
        "Avoid irregular sleep patterns by establishing a regular sleep schedule."
      );
    }

    // Check for high stress levels
    if (
      newSleepDataEntries?.stressLevels &&
      newSleepDataEntries?.stressLevels > 5
    ) {
      // Assuming stressLevels is rated 1-10
      recommendations.push(
        "Incorporate stress management techniques, such as meditation or deep breathing, into your daily routine."
      );
      recommendations.push(
        "Consider taking time to unwind before bed to reduce stress levels."
      );
    }

    // Check for dietary intake issues
    if (
      newSleepDataEntries?.dietaryIntake &&
      newSleepDataEntries?.dietaryIntake.includes("Heavy meal")
    ) {
      recommendations.push(
        "Avoid heavy meals close to bedtime to improve sleep quality."
      );
      recommendations.push(
        "Consider a light snack if you're hungry before bed, like a banana or yogurt."
      );
    }

    // Check for lack of physical activity
    if (newSleepDataEntries?.physicalActivity === "low") {
      recommendations.push(
        "Engage in regular physical activity during the day to improve sleep quality."
      );
      recommendations.push(
        "Even light exercise, such as walking, can help you sleep better at night."
      );
    }

    // General recommendations
    recommendations.push(
      "Maintain a balanced diet and stay hydrated throughout the day."
    );
    recommendations.push(
      "Manage stress through mindfulness or other stress-reducing activities."
    );
    recommendations.push("Ensure your sleep environment is conducive to rest.");

    return recommendations;
  };

  // Function to add new sleep data
  const handleAddNewSleepData = async () => {
    const token = user?.token;

    // Validate and parse hoursSlept
    const parsedHoursSlept = parseInt(hoursSlept, 10);
    if (isNaN(parsedHoursSlept)) {
      console.error("Invalid value for hoursSlept:", hoursSlept);
      return;
    }

    // Prepare the sleep data entries
    const newSleepDataEntries = {
      date,
      time,
      hoursSlept: parsedHoursSlept,
      sleepQuality,
      bedtime,
      wakeTime,
      timeToFallAsleep,
      awakenings,
      tookNap,
      sleepInterruptions,
      sleepConsistency,
      preSleepActivities,
      stressLevels,
      dietaryIntake,
      physicalActivity,
      note,
    };

    // Generate recommendations
    const newRecommendations = getRecommendations(newSleepDataEntries);
    setRecommendations(newRecommendations);

    // Set new sleep data
    setnewSleepData(newSleepDataEntries);

    try {
      // Add new sleep data and fetch updated data
      await dispatch(
        addNewSleepData({
          newSleepData: newSleepDataEntries,
          recommendations: newRecommendations,
          token,
        })
      ).unwrap();

      // Fetch and update existing sleep data
      const { existingSleepData = [] } = await dispatch(
        fetchExistingSleepData(token)
      ).unwrap();

      setSleepData(existingSleepData);

      // Close form and show recommendations
      onFormModalClose();
      onViewRecommendationsModalOpen();
    } catch (error) {
      console.error("Error in addNewSleepData:", error);
    }

    // Reset form fields
    resetFormFields();
  };

  // Helper function to reset form fields
  const resetFormFields = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setTime(DateTime.now().toFormat("HH:mm"));
    setHoursSlept("4");
    setSleepQuality("Poor");
    setBedtime("");
    setWakeTime("");
    setTimeToFallAsleep("");
    setAwakenings("");
    setTookNap(false);
    setSleepInterruptions("");
    setSleepConsistency("consistent");
    setPreSleepActivities("");
    setStressLevels("low");
    setDietaryIntake("");
    setPhysicalActivity("none");
    setNote("");
  };

  // State to track whether the form is in edit mode
  const [isEditMode, setIsEditMode] = useState({
    date: false,
    time: false,
    hoursSlept: false,
    sleepQuality: false,
    bedtime: false,
    wakeTime: false,
    timeToFallAsleep: false,
    awakenings: false,
    tookNap: false,
    sleepInterruptions: false,
    sleepConsistency: false,
    preSleepActivities: false,
    stressLevels: false,
    dietaryIntake: false,
    physicalActivity: false,
    note: false,
  });

  // Form data state
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    hoursSlept: "",
    sleepQuality: "",
    bedtime: "",
    wakeTime: "",
    timeToFallAsleep: "",
    awakenings: "",
    tookNap: false,
    sleepInterruptions: "",
    sleepConsistency: "",
    preSleepActivities: "",
    stressLevels: "",
    dietaryIntake: "",
    physicalActivity: "",
    note: "",
  });

  // useEffect to update formData when selectedSleep changes
  useEffect(() => {
    if (selectedSleep) {
      // Ensure you're accessing the correct nested data
      const sleepData = selectedSleep.sleep || {};

      setFormData({
        date: sleepData.date || "",
        time: sleepData.time || "",
        hoursSlept: sleepData.hoursSlept || "",
        sleepQuality: sleepData.sleepQuality || "",
        bedtime: sleepData.bedtime || "",
        wakeTime: sleepData.wakeTime || "",
        timeToFallAsleep: sleepData.timeToFallAsleep || "",
        awakenings: sleepData.awakenings || "",
        tookNap: sleepData.tookNap || false,
        sleepInterruptions: sleepData.sleepInterruptions || "",
        sleepConsistency: sleepData.sleepConsistency || "",
        preSleepActivities: sleepData.preSleepActivities || "",
        stressLevels: sleepData.stressLevels || "",
        dietaryIntake: sleepData.dietaryIntake || "",
        physicalActivity: sleepData.physicalActivity || "",
        note: sleepData.note || "",
      });
    }
  }, [selectedSleep]);

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
          isReadOnly={!isEditMode[name]}
        />
        <InputRightElement width="4.5rem">
          <Button h="1.75rem" size="sm" onClick={() => toggleEditField(name)}>
            <EditIcon />
          </Button>
        </InputRightElement>
      </InputGroup>
    </FormControl>
  );

  // Function to handle updating existing sleep data
  const handleSubmitUpdate = async () => {
    const token = user?.token;

    // Parse hoursSlept to ensure it's a valid number
    const parsedHoursSlept = parseInt(formData.hoursSlept, 10);

    if (isNaN(parsedHoursSlept)) {
      console.error("Invalid value for hoursSlept:", formData.hoursSlept);
      return;
    }

    // Prepare the sleep data update entries
    const sleepDataUpdateEntries = {
      ...formData,
      hoursSlept: parsedHoursSlept,
    };

    console.log("Submitting updated sleep data:", sleepDataUpdateEntries);

    try {
      // Dispatch the update action and wait for the result
      const updatedData = await dispatch(
        updateExistingSleepData({
          id: selectedSleep._id,
          sleepDataUpdateEntries,
          token,
        })
      ).unwrap();

      console.log("Updated data received from API:", updatedData);

      // Update the local state with the new data
      setSleepData((prevData) =>
        prevData.map((sleep) =>
          sleep._id === selectedSleep._id ? { ...sleep, ...updatedData } : sleep
        )
      );
      onViewMoreModalClose();
    } catch (error) {
      console.error("Error in updateExistingSleepData:", error);
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

  // function to delete an existing sleep data
  const handleDeleteExistingSleepData = async (id) => {
    const token = user?.token;

    try {
      // Dispatch the delete action
      await dispatch(deleteExistingSleepData({ id, token })).unwrap();

      // Update the local state by removing the deleted entry
      setSleepData((prevData) => prevData.filter((sleep) => sleep._id !== id));

      // Close the View More Modal after successful deletion
      onViewMoreModalClose();
    } catch (error) {
      console.error("Error in deleteExistingSleepData:", error);
    }
  };

  // function to get monnth and day from the date
  function getMonthAndDay(date) {
    // Parse the input date with Luxon
    const dateTime = DateTime.fromISO(date);

    // Get the month and day
    const month = dateTime.toFormat("MMM"); // 'MMM' gives you the abbreviated month name
    const day = dateTime.day; // day of the month

    // Return the formatted month and day
    return `${month} ${day}`;
  }

  //  function to get hour and minute from the time
  function getHourAndMinute(time) {
    // Parse the input time with Luxon
    const dateTime = DateTime.fromISO(`1970-01-01T${time}`);

    // Extract hour and minute
    const hours24 = dateTime.hour; // 24-hour format
    const minutes = dateTime.minute;

    // Determine AM/PM
    const ampm = dateTime.hour >= 12 ? "PM" : "AM";

    // Convert hours from 24-hour to 12-hour format
    const hours12 = dateTime.toFormat("h"); // 'h' gives you the hour in 12-hour format

    // Format minutes
    const formattedMinutes = minutes.toString().padStart(2, "0");

    // Return formatted hour, minute, and AM/PM
    return `${hours12}:${formattedMinutes} ${ampm}`;
  }

  // Ensure sleepData is an array, even if it's empty.
  const validSleepData = Array.isArray(sleepData) ? sleepData : [];

  const chartData = {
    labels: validSleepData.map((entry) => {
      const { date, time } = entry.sleep || {};
      if (date && time) {
        return `${getMonthAndDay(date)}`;
      }
      return "Unknown";
    }),
    datasets: [
      {
        label: "Hours Slept",
        data: validSleepData.map((entry) => entry.sleep?.hoursSlept || 0),
        fill: false,
        backgroundColor: "rgba(75,192,192,1)",
        borderColor: "rgba(75,192,192,1)",
      },
    ],
  };

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
      <Heading as="h3" size="lg" mb={4}>
        Sleep Tracker
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
            onClick={handleFetchExistingSleepData}
            isLoading={loading}
          >
            Try Again
          </Button>
        </Box>
      ) : sleepData.length === 0 ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          minHeight="500px"
          textAlign="center"
        >
          <Text>No sleep data available.</Text>
          <Button colorScheme="blue" mt={4} onClick={onFormModalOpen}>
            Start Tracking Sleep
          </Button>
        </Box>
      ) : (
        <Stack spacing={8}>
          <Flex justifyContent="flex-end">
            <Button colorScheme="blue" onClick={onFormModalOpen}>
              Log new sleep data
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
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: "Date",
                      },
                    },
                    y: {
                      title: {
                        display: true,
                        text: "Hours Slept",
                      },
                      beginAtZero: true,
                    },
                  },
                }}
                width={"100%"} // Set the chart width to 100%
                height={null}
              />
            </Box>

            {/* Sleep Data Table */}
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
                    <Th>Time</Th>
                    <Th>Hours Slept</Th>
                    <Th>Sleep Quality</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {Array.isArray(sleepData) && sleepData.length > 0 ? (
                    sleepData.map((entry, index) => (
                      <Tr key={entry._id}>
                        <Td>{index + 1}</Td>
                        <Td>
                          {entry.sleep?.date
                            ? `${getMonthAndDay(entry.sleep?.date)}`
                            : "Unknown"}
                        </Td>
                        <Td>
                          {entry.sleep?.time
                            ? ` ${getHourAndMinute(entry.sleep?.time)}`
                            : "Unknown"}
                        </Td>
                        <Td>{entry.sleep?.hoursSlept || "N/A"}</Td>
                        <Td>{entry.sleep?.sleepQuality || "N/A"}</Td>
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
                      <Td colSpan={6} textAlign="center">
                        No sleep data available
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </Stack>
      )}

      {/* sleep data entry modal */}
      <Modal isOpen={isFormModalOpen} onClose={onFormModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Track Your Sleep</ModalHeader>
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
              <FormLabel>Time</FormLabel>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Hours Slept</FormLabel>
              <Select
                value={hoursSlept}
                onChange={(e) => setHoursSlept(e.target.value)}
              >
                <option value="4">4 hours</option>
                <option value="5">5 hours</option>
                <option value="6">6 hours</option>
                <option value="7">7 hours</option>
                <option value="8">8 hours</option>
                <option value="9">9 hours</option>
                <option value="10">10 hours</option>
              </Select>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Sleep Quality</FormLabel>
              <Input value={sleepQuality} isReadOnly />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Bedtime</FormLabel>
              <Input
                type="time"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Wake Time</FormLabel>
              <Input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Time Taken to Fall Asleep (in minutes)</FormLabel>
              <Input
                type="number"
                value={timeToFallAsleep}
                onChange={(e) => setTimeToFallAsleep(e.target.value)}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Number of Awakenings</FormLabel>
              <Input
                type="number"
                value={awakenings}
                onChange={(e) => setAwakenings(e.target.value)}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Took a Nap?</FormLabel>
              <Checkbox
                isChecked={tookNap}
                onChange={(e) => setTookNap(e.target.checked)}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Sleep Interruptions</FormLabel>
              <Input
                type="text"
                value={sleepInterruptions}
                onChange={(e) => setSleepInterruptions(e.target.value)}
                placeholder="e.g., Noise, Light"
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Sleep Consistency</FormLabel>
              <Select
                value={sleepConsistency}
                onChange={(e) => setSleepConsistency(e.target.value)}
              >
                <option value="consistent">Consistent</option>
                <option value="inconsistent">Inconsistent</option>
              </Select>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Pre-Sleep Activities</FormLabel>
              <Input
                type="text"
                value={preSleepActivities}
                onChange={(e) => setPreSleepActivities(e.target.value)}
                placeholder="e.g., Reading, Watching TV"
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Stress Levels</FormLabel>
              <Select
                value={stressLevels}
                onChange={(e) => setStressLevels(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </Select>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Dietary Intake</FormLabel>
              <Input
                type="text"
                value={dietaryIntake}
                onChange={(e) => setDietaryIntake(e.target.value)}
                placeholder="e.g., Heavy Meal, Light Snack"
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Physical Activity</FormLabel>
              <Select
                value={physicalActivity}
                onChange={(e) => setPhysicalActivity(e.target.value)}
              >
                <option value="none">None</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="intense">Intense</option>
              </Select>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Note</FormLabel>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Any additional notes about your sleep?"
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleAddNewSleepData}>
              Add Sleep
            </Button>
            <Button onClick={onFormModalClose}>Cancel</Button>
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
          <ModalHeader>Personalized Recommendations</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box>
              <Heading as="h4" size="md" mb={4}>
                Based on your sleep data, we recommend the following:
              </Heading>
              {recommendations.length > 0 ? (
                <Box>
                  {recommendations.map((rec, index) => (
                    <Text key={index} mb={2}>
                      - {rec}
                    </Text>
                  ))}
                </Box>
              ) : (
                <Text>No recommendations available.</Text>
              )}
            </Box>
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

      {/* selected existing sleep data metric modal */}
      <Modal isOpen={isViewMoreModalOpen} onClose={onViewMoreModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sleep Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedSleep && (
              <>
                {renderEditableField("Date", "date", formData.date)}
                {renderEditableField("Time", "time", formData.time)}
                {renderEditableField(
                  "Hours Slept",
                  "hoursSlept",
                  formData.hoursSlept
                )}
                {renderEditableField(
                  "Sleep Quality",
                  "sleepQuality",
                  formData.sleepQuality
                )}
                {renderEditableField("Bedtime", "bedtime", formData.bedtime)}
                {renderEditableField(
                  "Wake Time",
                  "wakeTime",
                  formData.wakeTime
                )}
                {renderEditableField(
                  "Time to Fall Asleep",
                  "timeToFallAsleep",
                  formData.timeToFallAsleep
                )}
                {renderEditableField(
                  "Awakenings",
                  "awakenings",
                  formData.awakenings
                )}
                {renderEditableField(
                  "Took Nap",
                  "tookNap",
                  formData.tookNap ? "Yes" : "No"
                )}
                {renderEditableField(
                  "Sleep Interruptions",
                  "sleepInterruptions",
                  formData.sleepInterruptions
                )}
                {renderEditableField(
                  "Sleep Consistency",
                  "sleepConsistency",
                  formData.sleepConsistency
                )}
                {renderEditableField(
                  "Pre-Sleep Activities",
                  "preSleepActivities",
                  formData.preSleepActivities
                )}
                {renderEditableField(
                  "Stress Levels",
                  "stressLevels",
                  formData.stressLevels
                )}
                {renderEditableField(
                  "Dietary Intake",
                  "dietaryIntake",
                  formData.dietaryIntake
                )}
                {renderEditableField(
                  "Physical Activity",
                  "physicalActivity",
                  formData.physicalActivity
                )}
                <FormControl mb={4}>
                  <FormLabel>Note</FormLabel>
                  <InputGroup>
                    <Textarea
                      name="note"
                      value={formData.note || ""}
                      onChange={handleInputChange}
                      isReadOnly={!isEditMode.note}
                    />
                    <InputRightElement width="4.5rem">
                      <Button
                        h="1.75rem"
                        size="sm"
                        onClick={() => toggleEditField("note")}
                      >
                        <EditIcon />
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={handleSubmitUpdate}>
              Update Data
            </Button>

            <Button
              colorScheme="red"
              mr={3}
              onClick={() => openConfirmDeleteModal(selectedSleep._id)}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* delete confirmation modal */}
      <Modal isOpen={isConfirmDeleteOpen} onClose={closeConfirmDeleteModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete this sleep data? This action cannot
            be undone.
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              onClick={() => {
                handleDeleteExistingSleepData(idToDelete);
                closeConfirmDeleteModal();
              }}
            >
              Yes, Delete
            </Button>
            <Button onClick={closeConfirmDeleteModal} ml={3}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SleepTracker;
