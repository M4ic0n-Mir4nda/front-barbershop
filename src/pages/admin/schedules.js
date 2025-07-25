import {
  Box,
  Button,
  Typography,
  useMediaQuery,
  useTheme,
  Modal,
  Fab,
  FormControl,
  InputLabel,
  Select,
  TextField,
  MenuItem,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import "../../styles/index.css";
import Divisor from "../../images/divisor.png";
import Calendar from "../../images/calendar.png";
import ScheduleItem from "../../components/scheduleItem";
import SideBar from "../../components/sideBar";
import { useNavigate, useParams } from "react-router-dom";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useSnackbar } from "notistack";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import { formatCleanCpf, formatInputCPF } from "../../functions/formatCpf.js";
import {
  formatInputPhone,
  formatCleanPhone,
} from "../../functions/formatPhone.js";
import {
  formatDateConsulting,
  currentDateFull,
  currentDateMonth,
} from "../../functions/formatDate.js";
import LoadingComponent from "../../components/LoadingComponent.js";
import Loading from "../site/Loading";
import Pagination from "../../components/Pagination.js";
import ScrollToTop from "../../components/ScrollToTop.js";
import config from "../../config.js";

const BACKEND_URL = config.BACKEND_URL;

let PageSize = 5;

function Schedules() {
  const { enqueueSnackbar } = useSnackbar();

  const [shopData, setShopData] = useState("empty");
  const [schedulingData, setSchedulingData] = useState([]);
  const [loadingComponent, setLoadingComponent] = useState(false);
  const [dataSet, setDataset] = useState([]);
  const [dates, setDates] = useState("");
  const [loadingPage, setLoadingPage] = useState(true);
  const [currentDate, setCurrentDate] = useState(dayjs(currentDateMonth()));
  const [avaliableTimes, setAvaliableTimes] = useState(false);
  const [returnHours, setReturnHours] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [openAddSchedule, setOpenAddSchedule] = useState(false);
  const [customer, setCustomer] = useState({});

  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  const handleChangeCpf = (e) => {
    const formattedCpf = formatInputCPF(e.target.value);
    setCpf(formattedCpf);
  };

  const handleChangePhone = (e) => {
    const formattedPhone = formatInputPhone(e.target.value);
    setPhone(formattedPhone);
  };

  const handleSearchCustomer = async () => {
    const cpfClean = formatCleanCpf(cpf);

    try {
      const res = await axios.get(
        `${BACKEND_URL}/customer/${currentName}/client?cpf=${cpfClean}`
      );
      setCustomer(res.data);
      setName(res.data.name);
      setPhone(formatInputPhone(res.data.whatsapp));
    } catch (e) {
      setCustomer({});
      setName("");
      setPhone("");
      return;
    }
  };

  const isScheduleButtonDisable = () => {
    return (
      !schedulingData.employe ||
      !schedulingData.activities ||
      !schedulingData.date ||
      !schedulingData.time ||
      phone.length !== 14 ||
      !cpf ||
      !name ||
      schedulingData.activities.length <= 0
    );
  };

  const handleModalScheduleOpen = async () => {
    const response = await axios.get(
      `${BACKEND_URL}/establishment/${currentName}`
    );
    setOpenAddSchedule(true);
    setDataset(response.data);
  };

  const handleModalScheduleClose = () => {
    setOpenAddSchedule(false);
    setCustomer({});
    setIsDisabled(true);
    setSchedulingData([]);
    setCpf("");
    setName("");
    setPhone("");
    setReturnHours(false);
    setCurrentDate(dayjs(currentDateMonth()));
    setAvaliableTimes([]);
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Consider 'md' as mobile breakpoint
  const { currentName } = useParams();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [currentChosenPage, setCurrentChosenPage] = useState(1);

  const [open, setOpen] = useState(false);
  const handleModalDateOpen = () => setOpen(true);
  const handleModalDateClose = () => {
    setOpen(false);
  };

  const consultAvaliableHours = async (selectedDate) => {
    setLoadingComponent(true);
    setAvaliableTimes([]);

    if (schedulingData?.activities?.length <= 0) {
      setIsDisabled(true);
      setTimeout(() => setLoadingComponent(false), 500);
      return;
    }

    if (selectedDate) {
      try {
        if (!schedulingData.employe) {
          setLoadingComponent(false);
          return;
        }

        const res = await axios.post(
          `${BACKEND_URL}/scheduling/${currentName}/period?employe_id=${schedulingData.employe.id}`,
          {
            date: formatDateConsulting(selectedDate),
            activities: schedulingData.activities,
          }
        );

        setSchedulingData({
          ...schedulingData,
          date: formatDateConsulting(selectedDate),
        });

        setIsDisabled(false);
        setAvaliableTimes(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingComponent(false);
      }
    }
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

  const handleModalClick = async () => {
    try {
      const token = Cookies.get("token");
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.post(
        `${BACKEND_URL}/scheduling/${currentName}`,
        {
          activities: schedulingData.activities,
          employe: schedulingData.employe,
          customer: {
            id: customer.id || "",
            name: customer.name || name,
            cpf: customer.cpf || formatCleanCpf(cpf),
            whatsapp: customer.whatsapp || formatCleanPhone(phone),
          },
          date_scheduling: `${schedulingData.date}T${schedulingData.time}`,
          starts_at: currentDateFull(),
          ends_at: currentDateFull(),
          status: 1,
        },
        headers
      );
      enqueueSnackbar("Agendamento realizado com sucesso!", {
        variant: "success",
        anchorOrigin: { horizontal: "right", vertical: "top" },
      });
      handleModalScheduleClose();
      setLoadingPage(true);
    } catch (err) {
      enqueueSnackbar("Erro ao salvar agendamento, tente novamente.", {
        variant: "error",
        anchorOrigin: { horizontal: "right", vertical: "top" },
      });
      console.error(err);
      // handleModalScheduleClose();
    }
  };

  useEffect(() => {
    if ((shopData == "empty" && loadingPage) || loadingPage) {
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

    if (currentDate) {
      // console.log(formatDateConsulting(currentDate));
      // console.log(dayjs(currentDateMonth()));
      consultAvaliableHours(currentDate);
    }
  }, [shopData, loadingPage, currentName, navigate, currentDate]);

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
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: "17px",
              }}
            >
              <img
                src={Calendar}
                alt="Calendar"
                className="calendar"
                style={{
                  width: isMobile ? "30px" : "40px",
                }}
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
            {schedulingData ? (
              <Box>
                <Fab
                  color="primary"
                  aria-label="add"
                  onClick={handleModalScheduleOpen}
                  size="medium"
                >
                  <AddIcon />
                </Fab>
              </Box>
            ) : (
              <></>
            )}
            <Modal open={openAddSchedule} onClose={handleModalScheduleClose}>
              <Box
                sx={{
                  backgroundColor: "#FFFAF0",
                  width: isMobile
                    ? "90%"
                    : "470px" && returnHours
                    ? "auto"
                    : "580px",
                  maxWidth: "610px",
                  paddingBottom: "30px",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  alignItems: "center",
                  maxHeight: "85vh", // Define uma altura máxima em relação à altura da viewport
                  overflowY: "auto", // Adiciona rolagem vertical se o conteúdo exceder a altura
                }}
              >
                <Typography
                  sx={{
                    fontSize: isMobile ? "25px" : "30px",
                    marginTop: isMobile ? "50px" : "100px",
                  }}
                >
                  Agendar Horário
                </Typography>
                <img src={Divisor} alt="Divisor" />

                {
                  <>
                    <Box
                      sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <FormControl variant="standard" sx={{ width: "70%" }}>
                        <InputLabel>Escolha o serviço:</InputLabel>
                        <Select
                          multiple
                          value={schedulingData.activities || []}
                          onChange={(e) => {
                            schedulingData.time = "";
                            setCurrentDate(dayjs(currentDate));
                            setSchedulingData({
                              ...schedulingData,
                              activities: e.target.value,
                            });
                          }}
                        >
                          {dataSet?.activities?.map((service) => {
                            setSchedulingData;
                            return (
                              <MenuItem key={service.id} value={service}>
                                {service.name_service}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </Box>
                    <Box
                      sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "20px",
                      }}
                    >
                      <FormControl variant="standard" sx={{ width: "70%" }}>
                        <InputLabel>Escolha um barbeiro:</InputLabel>
                        <Select
                          value={schedulingData.employe || ""}
                          onChange={(e) => {
                            if (schedulingData?.activities?.length > 0) {
                              setCurrentDate(dayjs(currentDate));
                            }
                            setSchedulingData({
                              ...schedulingData,
                              employe: e.target.value,
                            });
                          }}
                        >
                          {dataSet?.employes?.map((employe) => (
                            <MenuItem key={employe.id} value={employe}>
                              {employe.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    <TextField
                      label="Cpf"
                      name="cpf"
                      value={cpf}
                      autoComplete="off"
                      inputProps={{ maxLength: 15 }}
                      variant="outlined"
                      sx={{
                        width: "70%",
                        height: "67px",
                        marginTop: "20px",
                      }}
                      onChange={handleChangeCpf}
                      onBlur={handleSearchCustomer}
                    />

                    <TextField
                      label="Nome"
                      name="name"
                      value={name}
                      autoComplete="off"
                      variant="outlined"
                      sx={{
                        width: "70%",
                        height: "67px",
                        marginTop: "10px",
                      }}
                      onChange={(e) => setName(e.target.value)}
                    />

                    <TextField
                      label="Tel"
                      name="tel"
                      value={phone}
                      autoComplete="off"
                      placeholder="(xx)xxxxx-xxxx"
                      inputProps={{ maxLength: 11 }}
                      variant="outlined"
                      sx={{
                        width: "70%",
                        height: "67px",
                        marginTop: "10px",
                      }}
                      onChange={handleChangePhone}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: isMobile ? "5px" : "",
                        width: "70%",
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                        }}
                      >
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DemoContainer
                            components={[
                              "DatePicker",
                              "MobileDatePicker",
                              "DesktopDatePicker",
                              "StaticDatePicker",
                            ]}
                          ></DemoContainer>
                          <DemoItem
                            label="Data"
                            sx={{
                              color: "#000000",
                            }}
                          >
                            {isMobile ? (
                              <MobileDatePicker
                                format="DD/MM/YYYY"
                                locale="pt-br"
                                value={currentDate}
                                onChange={(newValue) => {
                                  setCurrentPage(1);
                                  setCurrentDate(newValue);
                                  consultAvaliableHours(newValue);
                                  schedulingData.time = "";
                                }}
                                disabled={isDisabled}
                              />
                            ) : (
                              <DatePicker
                                format="DD/MM/YYYY"
                                locale="pt-br"
                                value={currentDate}
                                onChange={(newValue) => {
                                  setCurrentPage(1);
                                  setCurrentDate(newValue);
                                  consultAvaliableHours(newValue);
                                  schedulingData.time = "";
                                }}
                                disabled={isDisabled}
                              />
                            )}
                          </DemoItem>
                        </LocalizationProvider>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            // marginTop: "20px",
                          }}
                        >
                          {loadingComponent ? (
                            <LoadingComponent title={""} message={""} />
                          ) : (
                            <></>
                          )}
                          {avaliableTimes.length > 0 ? (
                            <Box
                              display="grid"
                              gridTemplateColumns="repeat(3, auto)"
                              gap="2px"
                              justifyContent="center"
                              alignItems="center"
                              flexDirection="column"
                              padding="10px"
                              sx={{
                                marginTop: "10px",
                                maxHeight: "18vh", // Define uma altura máxima em relação à altura da viewport
                                overflowY: "auto", // Adiciona rolagem vertical se o conteúdo exceder a altura
                              }}
                            >
                              {avaliableTimes.map((datetime) => {
                                const formattedTime =
                                  dayjs(datetime).format("HH:mm");

                                return (
                                  <Chip
                                    key={datetime}
                                    label={formattedTime}
                                    variant="outlined"
                                    sx={{
                                      marginBottom: "6px",
                                      width: "80px",
                                      cursor: "pointer",
                                      backgroundColor:
                                        schedulingData.time === formattedTime
                                          ? "#35312D!important"
                                          : "",
                                      color:
                                        schedulingData.time === formattedTime
                                          ? "white!important"
                                          : "",
                                      "&:hover": {
                                        backgroundColor: "#35312D!important",
                                        color: "white",
                                      },
                                    }}
                                    onClick={() =>
                                      setSchedulingData({
                                        ...schedulingData,
                                        time: formattedTime,
                                      })
                                    }
                                  />
                                );
                              })}
                            </Box>
                          ) : (
                            <></>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </>
                }

                <Button
                  onClick={handleModalClick}
                  variant="contained"
                  sx={{
                    marginTop: "20px",
                    backgroundColor: "#35312D",
                    color: "white",
                  }}
                  disabled={isScheduleButtonDisable()}
                >
                  Agendar
                </Button>
              </Box>
            </Modal>
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
              onClose={handleModalDateClose}
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
                      shouldDisableDate={unavailableDates}
                    />
                  </LocalizationProvider>
                </Box>
              </Box>
            </Modal>
            <Button
              onClick={handleModalDateOpen}
              variant="contained"
              sx={{
                width: "170px",
                color: "white",
                height: isMobile ? "55px" : "40px",
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
