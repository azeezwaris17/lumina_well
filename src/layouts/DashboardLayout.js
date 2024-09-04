import React from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../store/slices/user/auth/userAuthSlice";
import UserHeader from "../components/user/dashboard/UserHeader";
import UserSidebar from "../components/user/dashboard/UserSidebar";
import UserFooter from "../components/user/dashboard/UserFooter";
import UserDashboard from "../components/user/dashboard/UserDashboard";
import Steps from "../components/user/dashboard/Steps";
import DietaryIntake from "../components/user/dashboard/DietaryIntake";
import Hydration from "../components/user/dashboard/Hydration";
import Mood from "../components/user/dashboard/Mood";
import Sleep from "../components/user/dashboard/Sleep";
import Weight from "../components/user/dashboard/Weight";

import AdminHeader from "../components/admin/dashboard/AdminHeader";
import AdminSidebar from "../components/admin/dashboard/AdminSidebar";
import AdminFooter from "../components/admin/dashboard/AdminFooter";
import AdminDashboard from "../components/admin/dashboard/AdminDashboard";
import AdminProfile from "../components/admin/dashboard/AdminProfile";

import { Grid, GridItem } from "@chakra-ui/react";

const DashboardLayout = ({ role, component, setComponent }) => {
  const user = useSelector(selectUser);

  const renderComponent = () => {
    if (role === "user") {
      switch (component) {
        case "Steps":
          return <Steps />;
        case "DietaryIntake":
          return <DietaryIntake />;
        case "Hydration":
          return <Hydration />;
        case "Mood":
          return <Mood />;
        case "Sleep":
          return <Sleep />;
        case "Weight":
          return <Weight />;
        default:
          return <Sleep />;
      }
    } else if (role === "admin") {
      switch (component) {
        case "AdminProfile":
          return <AdminProfile />;
        default:
          return <AdminDashboard />;
      }
    }
  };

  return (
    <Grid
      templateAreas={{
        base: `"header" "main" "footer"`,
        md: `"header header" "nav main" "footer footer"`,
      }}
      gridTemplateRows={{
        base: "50px 1fr 50px",
      }}
      gridTemplateColumns={{
        base: "1fr",
        md: "256px 1fr",
      }}
      h="100vh"
      overflow="hidden"
    >
      <GridItem area="header" bg="customWhite.50" zIndex="20">
        {role === "user" ? (
          <UserHeader setComponent={setComponent} />
        ) : (
          <AdminHeader setComponent={setComponent} />
        )}
      </GridItem>

      {/* sidebar */}
      <GridItem
      p={2}
        bg="customWhite.400"
        area="nav"
        display={{ base: "none", md: "block" }}
        zIndex="5"
      >
        {role === "user" ? (
          <UserSidebar setComponent={setComponent} />
        ) : (
          <AdminSidebar setComponent={setComponent} />
        )}
      </GridItem>

      {/* main component */}
      <GridItem p="4" bg="customWhite.100" area="main" zIndex="10">
        {renderComponent()}
      </GridItem>

      {/* footer */}
      <GridItem
        area="footer"
        p={4}
        bg="customWhite.50"
        color="customGray.500"
        borderTop="2px solid"
        borderColor="customGray.500"
        boxShadow="xl"
        zIndex="20"
      >
        {role === "user" ? <UserFooter /> : <AdminFooter />}
      </GridItem>
    </Grid>
  );
};

export default DashboardLayout;
