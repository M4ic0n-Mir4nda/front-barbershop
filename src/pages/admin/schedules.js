import {
  Box,
  Button,
  Typography,
  useMediaQuery,
  useTheme,
  Modal,
} from "@mui/material";
import "../../styles/index.css";
import Divisor from "../../images/divisor.png";
import Calendar from "../../images/calendar.png";
import ScheduleItem from "../../components/scheduleItem";
import SideBar from "../../components/sideBar";
import { useNavigate, useParams } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Loading from "../site/Loading";
import Pagination from "../../components/Pagination.js";
import ScrollToTop from "../../components/ScrollToTop.js";
import Cookies from "js-cookie";

const BACKEND_URL = process.env.REACT_APP_API_URL;

let PageSize = 5;

function Schedules() {
  const [shopData, setShopData] = useState("empty");
  const [dates, setDates] = useState("");
  const [loadingPage, setLoadingPage] = useState(true);

  const [open, setOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Consider 'md' as mobile breakpoint
  const { currentName } = useParams();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [currentChosenPage, setCurrentChosenPage] = useState(1);

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
  };

  const unavailableDates = (date) => {
    let dateCalender = new Date();

    dateCalender.toLocaleDateString("pt-BR");

    let previousDaysUnavailable = dateCalender.setDate(dateCalender.getDate());

    return date.isBefore(previousDaysUnavailable);
  };

  const setDate = (dateSelectd = 0, day = 1) => {
    let date;
    let dateFull;
    if (dateSelectd !== 0) {
      date = new Date();
      date.setDate(date.getDate() + day);
      dateFull = date.toLocaleDateString("pt-BR").split("/").join("/");
    } else {
      date = new Date();
      dateFull = date
        .toLocaleDateString("pt-BR")
        .split("/")
        .reverse()
        .join("-");
    }

    return `${dateFull}`;
  };

  const formatDate = (date) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    let dateFull = newDate.toLocaleDateString("pt-BR").split("/").join("/");
    return dateFull;
  };

  const chosenDateScheduling = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    let dateFull = date
      .toLocaleDateString("pt-BR")
      .split("/")
      .reverse()
      .join("-");
    if (Array.isArray(shopData)) {
      const chosenDate = shopData.filter((schedule) => {
        let splitDate = schedule.date_scheduling.split("T");
        let dateSplit = splitDate[0];
        return dates.length <= 0
          ? dateSplit === dateFull
          : dateSplit === dates.date;
      });

      const firstPageIndex = (currentChosenPage - 1) * PageSize;
      const lastPageIndex = firstPageIndex + PageSize;
      return chosenDate.slice(firstPageIndex, lastPageIndex);
    }
    return [];
  }, [shopData, currentChosenPage, dates.date]);

  // Calcule o currentTableData com base na paginação e no filtro
  const currentTableData = useMemo(() => {
    if (Array.isArray(shopData)) {
      // Filtrar os agendamentos de hoje
      const todaySchedules = shopData.filter((schedule) => {
        let splitDate = schedule.date_scheduling.split("T");
        let date = splitDate[0];
        return date === setDate();
      });

      // Paginar os agendamentos de hoje
      const firstPageIndex = (currentPage - 1) * PageSize;
      const lastPageIndex = firstPageIndex + PageSize;
      return todaySchedules.slice(firstPageIndex, lastPageIndex);
    }
    return []; // Retorna um array vazio se shopData não for um array
  }, [shopData, currentPage]);

  const totalCountChosen = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    let dateFull = date
      .toLocaleDateString("pt-BR")
      .split("/")
      .reverse()
      .join("-");
    if (Array.isArray(shopData)) {
      return shopData.filter((schedule) => {
        let splitDate = schedule.date_scheduling.split("T");
        let dateSplit = splitDate[0];
        return dates.length <= 0
          ? dateSplit === dateFull
          : dateSplit === dates.date;
      }).length;
    }
    return 0; // Retorna 0 se shopData não for um array
  }, [shopData, dates.date]);

  const totalCount = useMemo(() => {
    if (Array.isArray(shopData)) {
      return shopData.filter((schedule) => {
        let splitDate = schedule.date_scheduling.split("T");
        let date = splitDate[0];
        return date === setDate();
      }).length;
    }
    return 0; // Retorna 0 se shopData não for um array
  }, [shopData]);

  useEffect(() => {
    if (shopData == "empty" && loadingPage) {
      setLoadingPage(true);

      async function fetchApi() {
        try {
          const token = Cookies.get("token");
          if (!token) {
            window.location.assign("/login");
          }

          const headers = { Authorization: `Bearer ${token}` };
          const response = await axios.get(
            `${BACKEND_URL}/scheduling/${currentName}`,
            { headers }
          );
          setShopData(response.data);
        } catch (err) {
          if (err.code === "ERR_BAD_REQUEST") {
            window.location.assign("/login");
          }
          navigate("/site/page");
        } finally {
          setLoadingPage(false);
        }
      }
      fetchApi();
    }
  }, [shopData, loadingPage, currentName, navigate]);

  if (loadingPage) {
    return <Loading />;
  }

  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          backgroundColor: "#FFFAF0",
          minHeight: "100vh",
        }}
      >
        <SideBar />
        <Box
          sx={{
            width: isMobile ? "100%" : "80%",
            padding: isMobile ? "0px" : "80px",
            paddingTop: "80px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: "17px",
              alignItems: "center",
              marginBottom: "40px",
            }}
          >
            <Box sx={{ display: "flex", gap: "17px" }}>
              <img
                src={Calendar}
                alt="Calendar"
                className="calendar"
                style={{ width: isMobile ? "30px" : "40px" }}
              />
              <Typography
                sx={{
                  fontSize: isMobile ? "24px" : "35px",
                  fontFamily: "Marcellus",
                }}
              >
                Agendamentos de hoje
              </Typography>
            </Box>
          </Box>

          {currentTableData.map((schedule) => (
            <ScheduleItem key={schedule.id} schedule={schedule} />
          ))}

          <Pagination
            className="pagination-bar"
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={PageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />

          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: "17px",
              alignItems: isMobile ? "center" : "flex-start",
              marginBottom: "40px",
              marginTop: "65px",
            }}
          >
            <Box sx={{ display: "flex", gap: "17px" }}>
              <img
                src={Calendar}
                alt="Calendar"
                className="calendar"
                style={{ width: isMobile ? "30px" : "40px" }}
              />
              <Typography
                sx={{
                  fontSize: isMobile ? "24px" : "35px",
                  fontFamily: "Marcellus",
                }}
              >
                Todos os agendamentos
              </Typography>
            </Box>
            <Modal
              open={open}
              onClose={handleClose}
              aria-labelledby="modal-title"
              aria-describedby="modal-description"
            >
              <Box
                sx={{
                  backgroundColor: "#FFFAF0",
                  width: isMobile ? "90%" : "470px",
                  paddingBottom: "50px",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: isMobile ? "25px" : "30px",
                    marginTop: "50px",
                  }}
                >
                  Datas de agendamentos
                </Typography>
                <img src={Divisor} alt="Divisor" />
                <Box
                  display={isMobile ? "block" : "flex"}
                  gap="10px"
                  marginTop="0"
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateCalendar
                      value={dates.date ? dayjs(dates.date) : null}
                      onChange={(newValue) => {
                        setDates({
                          date: newValue.format("YYYY-MM-DD"),
                        });
                        setCurrentChosenPage(1); // Redefinir para a primeira página
                      }}
                      // onClick={handleClose}
                      shouldDisableDate={unavailableDates}
                    />
                  </LocalizationProvider>
                </Box>
              </Box>
            </Modal>
            <Button
              onClick={handleOpen}
              variant="contained"
              sx={{
                width: "170px",
                color: "white",
                height: "40px",
                backgroundColor: "black",
                fontWeight: "bold",
                borderRadius: "27px",
                marginTop: isMobile ? "20px" : "0",
                marginLeft: isMobile ? "0" : "125px",
              }}
            >
              {" "}
              Filtrar por data{" "}
            </Button>
          </Box>

          <Box sx={{ marginBottom: "40px" }}>
            {dates.length <= 0 ? (
              <Typography
                sx={{
                  fontSize: "22px",
                  fontWeight: "bold",
                  textAlign: isMobile ? "center" : "",
                }}
              >
                Amanhã
              </Typography>
            ) : (
              <></>
            )}
            <Box>
              <Typography
                sx={{
                  fontSize: "22px",
                  fontWeight: "bold",
                  textAlign: isMobile ? "center" : "",
                  marginTop: "25px",
                }}
              >
                {dates.length <= 0 ? setDate(1) : formatDate(dates.date)}
              </Typography>
            </Box>

            {chosenDateScheduling.map((schedule) => (
              <ScheduleItem key={schedule.id} schedule={schedule} />
            ))}

            <Pagination
              className="pagination-bar"
              currentPage={currentChosenPage}
              totalCount={totalCountChosen}
              pageSize={PageSize}
              onPageChange={(page) => setCurrentChosenPage(page)}
            />
          </Box>
        </Box>
      </Box>
      <ScrollToTop />
    </>
  );
}

export default Schedules;
