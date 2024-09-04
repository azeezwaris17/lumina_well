import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../../store/slices/user/auth/userAuthSlice";
import {
  Box,
  Flex,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Button,
  Textarea,
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
import { Line } from "react-chartjs-2";
import {
  addSleepEntry,
  updateSleepEntry,
  deleteSleepEntry,
  fetchSleepData,
  selectAllSleeps,
  selectSleepLoading,
  selectSleepError,
} from "../../../store/slices/metrics/sleepSlice";

import { format, addDays } from "date-fns";

const SleepTracker = () => {
  const user = useSelector(selectUser);
  const token = user?.token;
  const dispatch = useDispatch();
  const loading = useSelector(selectSleepLoading);
  const error = useSelector(selectSleepError);
  const sleeps = useSelector(selectAllSleeps);

  // Log the sleeps data to the console
  useEffect(() => {
    console.log("Sleeps data from useSelector:", sleeps);
  }, [sleeps]);

  const [sleepData, setSleepData] = useState(null);

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

  const [hoursSlept, setHoursSlept] = useState("4");
  const [sleepQuality, setSleepQuality] = useState("Poor");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [note, setNote] = useState("");
  const [trackingInterval, setTrackingInterval] = useState({
    value: 1,
    unit: "days",
  });
  const [totalHoursInInterval, setTotalHoursInInterval] = useState(0);
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

  // form modal disclosure for form inputs
  const {
    isOpen: isFormModalOpen,
    onOpen: onFormModalOpen,
    onClose: onFormModalClose,
  } = useDisclosure();

  const [recommendations, setRecommendations] = useState([]);
  const {
    isOpen: isViewRecommendationsModalOpen,
    onOpen: onViewRecommendationsModalOpen,
    onClose: onViewRecommendationsModalClose,
  } = useDisclosure();


  const getRecommendations = (sleepData) => {
    const recommendations = [];

    // Check for poor sleep quality
    if (sleepData.sleepQuality === "Poor") {
      recommendations.push("Consider improving your sleep environment.");
      recommendations.push("Try establishing a regular sleep schedule.");
      recommendations.push("Limit screen time before bed.");
      recommendations.push("Ensure your bedroom is cool, dark, and quiet.");
      recommendations.push(
        "Consider using a white noise machine or blackout curtains."
      );
    }

    // Check if hours slept are less than 7
    if (parseInt(sleepData.hoursSlept, 10) < 7) {
      recommendations.push("Aim for at least 7-8 hours of sleep per night.");
      recommendations.push("Avoid caffeine and heavy meals close to bedtime.");
      recommendations.push(
        "Try going to bed and waking up at the same time every day."
      );
      recommendations.push(
        "Consider taking short naps if needed, but keep them under 30 minutes."
      );
    }

    // Check for inconsistent sleep patterns
    if (sleepData.sleepSchedule === "Irregular") {
      recommendations.push(
        "Try to go to bed and wake up at the same time every day."
      );
      recommendations.push(
        "Avoid irregular sleep patterns by sticking to a consistent schedule."
      );
    }

    // Check for difficulty falling asleep
    if (sleepData.difficultyFallingAsleep) {
      recommendations.push(
        "Try relaxation techniques before bed, such as reading or meditating."
      );
      recommendations.push("Avoid stimulating activities close to bedtime.");
      recommendations.push(
        "Consider a light stretching routine or warm bath before sleep."
      );
    }

    // Check for frequent waking during the night
    if (sleepData.frequentlyWakesUp) {
      recommendations.push(
        "Ensure your bedroom is conducive to uninterrupted sleep."
      );
      recommendations.push(
        "Avoid large meals, alcohol, and caffeine before bedtime."
      );
      recommendations.push(
        "Consider tracking your sleep patterns and consult a healthcare professional if the problem persists."
      );
    }

    // Check for excessive daytime sleepiness
    if (sleepData.daytimeSleepiness) {
      recommendations.push(
        "Ensure you are getting enough total sleep each night."
      );
      recommendations.push(
        "Consider evaluating your sleep quality and consult a healthcare provider if necessary."
      );
      recommendations.push(
        "Try taking short naps during the day if needed, but avoid napping too long."
      );
    }

    // General recommendations
    recommendations.push(
      "Maintain a balanced diet and regular exercise routine."
    );
    recommendations.push("Stay hydrated throughout the day.");
    recommendations.push(
      "Manage stress through mindfulness or other stress-reducing activities."
    );

    return recommendations;
  };



  // use effect to fetch sleep data
  useEffect(() => {
    if (token) {
      dispatch(fetchSleepData(token)).then((result) => {
        console.log("Fetch Sleep Data Response:", result);
        // Update sleepData state with fetched data
        if (result.meta.requestStatus === "fulfilled") {
          setSleepData(result.payload); // Add this line
        }
      });
    }
  }, [dispatch, token]);

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

  // use effect to calculate date range
  useEffect(() => {
    const calculateDateRange = () => {
      const today = new Date();
      const startDate = today;
      const endDate = addDays(today, trackingInterval.value - 1);

      setDateRange({
        start: format(startDate, "yyyy-MM-dd"),
        end: format(endDate, "yyyy-MM-dd"),
      });
    };

    calculateDateRange();
  }, [trackingInterval]);

  // use effect to calculate total hours in interval
  useEffect(() => {
    const calculateTotalHoursInInterval = () => {
      const hoursInDay = 24;
      const intervalValue = trackingInterval.value;
      const intervalUnit = trackingInterval.unit;

      let totalHours = 0;
      if (intervalUnit === "days") {
        totalHours = hoursInDay * intervalValue;
      } else if (intervalUnit === "weeks") {
        totalHours = hoursInDay * intervalValue * 7;
      }
      setTotalHoursInInterval(totalHours);
    };
    calculateTotalHoursInInterval();
  }, [trackingInterval]);

  const handleAddSleep = () => {
    const parsedHoursSlept = parseInt(hoursSlept, 10);

    if (isNaN(parsedHoursSlept)) {
      console.error("Invalid value for hoursSlept:", hoursSlept);
      return;
    }

    const sleepData = {
      dateRange: {
        start: new Date(dateRange.start),
        end: new Date(dateRange.end),
      },
      trackingInterval,
      totalHoursInInterval,
      hoursSlept: parsedHoursSlept,
      sleepQuality,
      note,
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
    };

    setSleepData(sleepData);

    const newRecommendations = getRecommendations(sleepData);
    setRecommendations(newRecommendations);

    console.log("Sending sleep data to the server:", sleepData);

    dispatch(addSleepEntry({ sleepData, recommendations, token })).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        // Open the recommendations modal
        onViewRecommendationsModalOpen();
        onFormModalClose();
      } else {
        console.error("Error in addSleepEntry:", result.error);
      }
    });

    setHoursSlept("4");
    setSleepQuality("Poor");
    setDateRange({ start: "", end: "" });
    setNote("");
    setTrackingInterval({
      value: 1,
      unit: "days",
    });
    setTotalHoursInInterval(0);

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
  };

  const handleUpdateSleep = (id) => {
    const sleepData = { hoursSlept, sleepQuality, dateRange, note };
    dispatch(updateSleepEntry({ id, sleepData, token }));
  };

  const handleDeleteSleep = (id) => {
    dispatch(deleteSleepEntry({ id, token }));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatShortDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
    }).format(new Date(date));
  };

  const renderSleepChart = () => {
    const data = {
      labels: sleeps.map((entry) => {
        const { start, end } = entry.sleep?.dateRange || {};
        if (start && end) {
          return `${formatShortDate(start)} - ${formatShortDate(end)}`;
        }
        return "Unknown";
      }),
      datasets: [
        {
          label: "Hours Slept",
          data: sleeps.map((entry) => entry.sleep?.hoursSlept || 0),
          fill: false,
          backgroundColor: "rgba(75,192,192,1)",
          borderColor: "rgba(75,192,192,1)",
        },
      ],
    };

    return (
      <Box
        maxHeight="400px"
        w={{
          base: "95vw",
          sm: "90vw",
          md: "85vw",
          lg: "80vw",
          xl: "75vw",
        }}
        h={{
          base: "300px",
          sm: "350px",
          md: "400px",
          lg: "450px",
          xl: "500px",
        }}
      >
        <Line
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          }}
          style={{ width: "100%", height: "100%" }}
        />
      </Box>
    );
  };

  return (
    <Box p={4}>
      <Heading as="h3" size="lg" mb={4}>
        Sleep Tracker
      </Heading>

      {loading ? (
        <Box display="none">Loading data...</Box>
      ) : error ? (
        <Box display="none">{error.message}</Box>
      ) : sleeps.length === 0 ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          minHeight="500px"
          textAlign="center" // Optional: Centers text within the Box
        >
          <Text>No sleep data available.</Text>
          <Button colorScheme="blue" mt={4} onClick={onFormModalOpen}>
            Start Tracking Sleep
          </Button>
        </Box>
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          height="500px"
          overflowY="auto"
          gap={12}
        >
          <Flex justifyContent="flex-end" mb={4}>
            <Button colorScheme="blue" onClick={onFormModalOpen}>
              Log new sleep data
            </Button>
          </Flex>

          {/* Sleep chart */}
          {renderSleepChart()}

          {/* sleep data table*/}
          <Box>
            <Heading as="h4" size="md" mb={2}>
              Existing Sleep Data
            </Heading>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Hours Slept</Th>
                  <Th>Sleep Quality</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {sleeps.map((entry) => (
                  <Tr key={entry._id}>
                    <Td>
                      {entry.sleep?.dateRange.start &&
                      entry.sleep?.dateRange.end
                        ? `${formatShortDate(
                            entry.sleep?.dateRange.start
                          )} - ${formatShortDate(entry.sleep?.dateRange.end)}`
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
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}

      {/* sleep data entry modal */}
      <Modal isOpen={isFormModalOpen} onClose={onFormModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Track Your Sleep</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Tracking Interval</FormLabel>
              <Box display="flex" alignItems="center">
                <Input
                  type="number"
                  value={trackingInterval.value}
                  onChange={(e) =>
                    setTrackingInterval({
                      ...trackingInterval,
                      value: e.target.value,
                    })
                  }
                  min="1"
                  width="60px"
                  mr={2}
                />
                <Select
                  value={trackingInterval.unit}
                  onChange={(e) =>
                    setTrackingInterval({
                      ...trackingInterval,
                      unit: e.target.value,
                    })
                  }
                >
                  <option value="days">Day(s)</option>
                  <option value="weeks">Week(s)</option>
                </Select>
              </Box>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Total Hours in Interval</FormLabel>
              <Input value={totalHoursInInterval} isReadOnly />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Date Range</FormLabel>
              <Box display="flex" alignItems="center">
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                  width="150px"
                  mr={2}
                />
                <Text>to</Text>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                  width="150px"
                  ml={2}
                />
              </Box>
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
            <Button colorScheme="blue" mr={3} onClick={handleAddSleep}>
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
                <FormControl mb={4}>
                  <FormLabel>Date</FormLabel>
                  <Input
                    value={formatDate(selectedSleep.sleep.dateRange.start)}
                    isReadOnly
                  />
                </FormControl>
                <FormControl mb={4}>
                  <FormLabel>Hours Slept</FormLabel>
                  <Input value={selectedSleep.sleep.hoursSlept} isReadOnly />
                </FormControl>
                <FormControl mb={4}>
                  <FormLabel>Sleep Quality</FormLabel>
                  <Input value={selectedSleep.sleep.sleepQuality} isReadOnly />
                </FormControl>
                <FormControl mb={4}>
                  <FormLabel>Note</FormLabel>
                  <Textarea value={selectedSleep.sleep.note || ""} isReadOnly />
                </FormControl>
                {/* Add other detailed fields as needed */}
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="green"
              mr={3}
              onClick={() => handleUpdateSleep(selectedSleep._id)}
            >
              Update
            </Button>
            <Button
              colorScheme="red"
              mr={3}
              onClick={() => handleDeleteSleep(selectedSleep._id)}
            >
              Delete
            </Button>
            <Button onClick={onViewMoreModalClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SleepTracker;
