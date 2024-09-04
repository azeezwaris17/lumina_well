import React, { useState, useEffect } from "react";
import {
  Container,
  Flex,
  Heading,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  Text,
  Card,
  CardHeader,
  CardBody,
} from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../../store/slices/user/auth/userAuthSlice";
import { fetchMetrics } from "../../../store/slices/metrics";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const chartTypes = {
  steps: Line,
  mood: Pie,
  dietary: Bar,
  hydration: Line,
  sleep: Bar,
  weight: Line,
};

const UserDashboard = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const [metricsData, setMetricsData] = useState({});
  const { metrics, loading, error } = useSelector((state) => state.metrics);

  useEffect(() => {
    const fetchMetricsData = async () => {
      try {
        const token = user?.token;
        if (!token) {
          throw new Error("No token found");
        }
        await dispatch(fetchMetrics(token));
      } catch (err) {
        console.error("Error fetching metrics:", err);
      }
    };

    fetchMetricsData();
  }, [dispatch, user]);

  useEffect(() => {
    if (metrics && metrics.length > 0) {
      const data = metrics.reduce((acc, metric) => {
        const chartType = chartTypes[metric.metricType] || Line;
        const chartData = {
          labels: metric?.data?.map((entry) => entry.date) || [],
          datasets: [
            {
              label: metric.metricType || "Unknown",
              data: metric?.data?.map((entry) => entry.value) || [],
              borderColor: "rgba(75,192,192,1)",
              backgroundColor: "rgba(75,192,192,0.2)",
              borderWidth: 2,
              fill: false,
            },
          ],
        };

        if (metric.metricType === "mood") {
          const moodCounts = (metric.data || []).reduce((counts, entry) => {
            counts[entry.value] = (counts[entry.value] || 0) + 1;
            return counts;
          }, {});
          chartData.labels = Object.keys(moodCounts);
          chartData.datasets[0] = {
            data: Object.values(moodCounts),
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
          };
        } else if (metric.metricType === "dietary") {
          const foodCounts = (metric.data || []).reduce((counts, entry) => {
            counts[entry.value] = (counts[entry.value] || 0) + 1;
            return counts;
          }, {});
          chartData.labels = Object.keys(foodCounts);
          chartData.datasets[0] = {
            data: Object.values(foodCounts),
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
          };
        } else if (metric.metricType === "sleep") {
          chartData.datasets[0].backgroundColor = "rgba(75,192,192,0.2)";
        }

        acc[metric.metricType] = chartData;
        return acc;
      }, {});
      setMetricsData(data);
    }
  }, [metrics]);

  return (
    <Container maxW="container.lg" p={4} overflowY="auto" h="100vh">
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading as="h2" size="xl">
          Dashboard
        </Heading>
      </Flex>

      {/* Metrics display */}
      {loading ? (
        <Spinner size="xl" />
      ) : error ? (
        <Alert status="error">
          <AlertIcon />
          <Text>{error.message || "An error occurred"}</Text>
        </Alert>
      ) : (
        <VStack spacing={4} align="stretch">
          {Object.keys(metricsData).length === 0 ? (
            <Text>No metrics data available.</Text>
          ) : (
            Object.entries(metricsData).map(([metricType, chartData]) => {
              const ChartComponent = chartTypes[metricType] || Line;
              return (
                <Card key={metricType} p={4} shadow="md" borderWidth="1px">
                  <CardHeader>
                    <Heading fontSize="xl">{metricType}</Heading>
                  </CardHeader>
                  <CardBody>
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "calc(50vh - 20px)",
                      }}
                    >
                      <ChartComponent
                        data={chartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            x: {
                              display: true,
                            },
                            y: {
                              display: true,
                            },
                          },
                        }}
                      />
                    </div>
                  </CardBody>
                </Card>
              );
            })
          )}
        </VStack>
      )}
    </Container>
  );
};

export default UserDashboard;
