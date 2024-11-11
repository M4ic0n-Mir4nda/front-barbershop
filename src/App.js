import "./styles/App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Site from "./pages/site";
import Login from "./pages/admin";
import "./styles/App.css";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../src/theme";
import "@fontsource/manjari";
import Schedules from "./pages/admin/schedules";
import EmployeeRegistration from "./pages/admin/EmployeeRegistration";
import ServiceRegistration from "./pages/admin/ServiceRegistration";
import DataEstablishment from "./pages/admin/dataEstablishment";
import Home from "../src/pages/index";
import { SnackbarProvider } from "notistack";
import NotFound from "./pages/site/NotFound";
import Report from "./pages/admin/Report";
import CreateAccount from "./pages/site/create";

function App() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3}>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/site/:currentName" element={<Site />} />
              <Route path="/create/account" element={<CreateAccount />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/:currentName/admin/report"
                element={<Report />}
              ></Route>
              <Route
                path="/:currentName/admin/schedules"
                element={<Schedules />}
              ></Route>
              <Route
                path="/:currentName/admin/barbers"
                element={<EmployeeRegistration />}
              ></Route>
              <Route
                path="/:currentName/admin/services"
                element={<ServiceRegistration />}
              ></Route>
              <Route
                path="/:currentName/admin/data"
                element={<DataEstablishment />}
              ></Route>
              <Route path="/site/page" element={<NotFound />}></Route>
            </Routes>
          </Router>
        </SnackbarProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
