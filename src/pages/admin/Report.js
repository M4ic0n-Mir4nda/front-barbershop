import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Tooltip,
  Modal,
  useTheme,
  Checkbox,
  TextField,
  FormHelperText,
} from "@mui/material";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import imgCover from "../../images/cover.png";
import Divisor from "../../images/divisor.png";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import dayjs from "dayjs";
import Loading from "../site/Loading.js";
import LogoImage from "../../components/Logo.js";
import LoadingComponent from "../../components/LoadingComponent.js";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import SideBar from "../../components/sideBar.js";
import { styled } from "@mui/material/styles";
import { useNavigate, useParams } from "react-router-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import SearchIcon from "@mui/icons-material/Search";
import Pagination from "../../components/Pagination.js";
import ScrollToTop from "../../components/ScrollToTop.js";
import Cookies from "js-cookie";
import { useSnackbar } from "notistack";
import config from "../../config.js";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 16,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

// const BACKEND_URL = process.env.REACT_APP_API_URL;
const BACKEND_URL = config.BACKEND_URL;
let PageSize;

function Report() {
  const firstDayMonth = () => {
    const date = new Date();
    let dateBr = date
      .toLocaleDateString("pt-BR")
      .split("/")
      .reverse()
      .join("-");
    let dateSplit = dateBr.split("-");
    let month = dateSplit[1];
    let year = dateSplit[0];

    return `${year}-${month}-01`;
  };

  const currentDate = () => {
    const newDate = new Date();
    let dateFull = newDate
      .toLocaleDateString("pt-BR")
      .split("/")
      .reverse()
      .join("-");
    return dateFull;
  };

  const [employes, setEmployes] = useState([]);
  const [employe, setEmploye] = useState("");
  const [startDate, setStartDate] = useState(dayjs(firstDayMonth()));
  const [endDate, setEndDate] = useState(dayjs(currentDate()));
  const [report, setReport] = useState("Acumulado");
  const [status, setStatus] = useState("Agendado");

  const [shopData, setShopData] = useState([]);
  const [reports, setReports] = useState([]);

  const maxServices = 3;
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingComponent, setLoadingComponent] = useState(false);
  const [checked, setChecked] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const { currentName } = useParams();
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Consider 'md' as mobile breakpoint

  if (isMobile) {
    PageSize = 8;
  } else {
    PageSize = 13;
  }

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
  };

  const handleChangeCheckbox = (event) => {
    setChecked(event.target.checked);
  };

  const unavailableDates = (date) => {
    let dateCalender = new Date();

    dateCalender.toLocaleDateString("pt-BR");
    let previousDaysUnavailable = dateCalender.setDate(dateCalender.getDate());

    if (checked) {
      return;
    }

    return date.isAfter(previousDaysUnavailable);
  };

  useEffect(() => {
    if (!checked) {
      setStartDate(dayjs(firstDayMonth()));
      setEndDate(dayjs(currentDate()));
    }
  }, [checked]);

  const formatDateConsulting = (date) => {
    let newDate = new Date(date);
    let dateFormat = newDate
      .toLocaleDateString("pt-BR")
      .split("/")
      .reverse()
      .join("-");

    return dateFormat;
  };

  const formatDateTable = (date) => {
    if (report === "Acumulado") {
      let dateFormatted = date.split("-").reverse().join("/");

      return dateFormatted;
    } else if (report === "Detalhado") {
      let dateSplit = date.split("T");
      let dateFormatted = dateSplit[0].split("-").reverse().join("/");

      return `${dateFormatted} ${dateSplit[1]}`;
    }
  };

  const sumPrice = (price) => {
    return parseFloat(price).toFixed(2).replace(".", ",");
  };

  const formatCurrency = (value) => {
    // Remove caracteres não numéricos e formata como moeda
    try {
      let formattedValue;
      if (isNaN(value)) {
        const numericValue = value.replace(/\D/g, "");
        formattedValue = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(parseFloat(numericValue) / 100); // Divide por 100 para considerar centavos
      } else {
        formattedValue = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(parseFloat(value)); // Divide por 100 para considerar centavos
      }

      return formattedValue;
    } catch (err) {
      console.log(err);
      return "R$ 0,00";
    }
  };

  const sumValueTotal = (listReport) => {
    let sum = 0;
    listReport.map((schedule) => {
      sum += schedule.accumulatedTotal;
    });
    return parseFloat(sum).toFixed(2).replace(".", ",");
  };

  const currentTableData = useMemo(() => {
    if (Array.isArray(reports)) {
      // Filtrar os agendamentos de hoje
      const findReports = reports.map((schedule) => {
        return schedule;
      });

      // Paginar os agendamentos de hoje
      const firstPageIndex = (currentPage - 1) * PageSize;
      const lastPageIndex = firstPageIndex + PageSize;
      return findReports.slice(firstPageIndex, lastPageIndex);
    }
    return [];
  }, [reports, currentPage]);

  const totalCount = useMemo(() => {
    if (Array.isArray(reports)) {
      return reports.map((schedule) => {
        return schedule;
      }).length;
    }
    return 0;
  }, [reports]);

  const TableData = () => {
    if (loadingComponent) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          mt="20px"
          padding="10px"
        >
          <LoadingComponent title={""} message={""} />
        </Box>
      );
    }

    return currentTableData.length ? (
      <Box>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell
                  sx={{
                    fontSize: "1.1em",
                  }}
                >
                  Data
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{
                    fontSize: "1.1em",
                  }}
                >
                  Cliente
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{
                    fontSize: "1.1em",
                  }}
                >
                  Cliente Doc
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{
                    fontSize: "1.1em",
                  }}
                >
                  Serviço
                </StyledTableCell>
                <StyledTableCell
                  align="right"
                  sx={{
                    fontSize: "1.1em",
                  }}
                >
                  Valor
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentTableData.length ? (
                currentTableData.map((scheduling) => (
                  <StyledTableRow key={scheduling.date}>
                    <StyledTableCell component="th" scope="row">
                      {formatDateTable(scheduling.date)}
                    </StyledTableCell>
                    {report === "Acumulado" ? (
                      <>
                        <StyledTableCell align="center">*</StyledTableCell>
                        <StyledTableCell align="center">*</StyledTableCell>
                        <StyledTableCell align="center">*</StyledTableCell>
                      </>
                    ) : (
                      <>
                        <StyledTableCell align="center">
                          {scheduling.nameEmploye}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {scheduling.cpfCustomer}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {
                            scheduling.listActivities
                              .slice(0, maxServices)
                              .map((service) => service)
                              .join(", ") // Adiciona a vírgula entre os elementos
                          }

                          {scheduling.listActivities.length > maxServices && (
                            <Tooltip
                              title={scheduling.listActivities
                                .slice(maxServices)
                                .map((service) => service)
                                .join(", ")}
                              arrow
                            >
                              <span style={{ cursor: "pointer" }}>...</span>
                            </Tooltip>
                          )}
                        </StyledTableCell>
                      </>
                    )}
                    <StyledTableCell align="right">
                      R$ {formatCurrency(scheduling.accumulatedTotal)}
                    </StyledTableCell>
                  </StyledTableRow>
                ))
              ) : (
                <></>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            backgroundColor: "#F5F5F5",
            boxShadow:
              "rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;",
            padding: "10px",
            marginTop: "20px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: isMobile ? "60%" : "70%",
            }}
          >
            <Typography
              sx={{
                textAlign: "left",
                fontSize: "1.0em",
                fontWeight: "bold",
              }}
            >
              TOTAL
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: "1.2em",
                fontWeight: "bold",
              }}
            >
              R$ {sumValueTotal(reports)}
            </Typography>
          </Box>
        </Box>

        <Pagination
          className="pagination-bar"
          currentPage={currentPage}
          totalCount={totalCount}
          pageSize={PageSize}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Box>
    ) : (
      <Box display="flex" justifyContent="center" alignItems="center" mt="20px">
        <Typography variant="h6" fontSize="1.8em" textAlign="center">
          Não há nada para ser exibido...
        </Typography>
      </Box>
    );
  };

  const handleClickSearchReport = async () => {
    setLoadingComponent(true);
    setReports([]);

    if (startDate > endDate) {
      enqueueSnackbar("A data inicial não pode ser maior que a data final", {
        variant: "warning",
        anchorOrigin: { horizontal: "right", vertical: "top" },
      });
      setLoadingComponent(false);
      return;
    }

    const differenceInDays = endDate.diff(startDate, "day");
    if (differenceInDays > 30) {
      enqueueSnackbar("A diferença em dias não pode ser maior que 30", {
        variant: "warning",
        anchorOrigin: { horizontal: "right", vertical: "top" },
      });
      setLoadingComponent(false);
      return;
    }

    try {
      const statusEnum = Object.freeze({
        states: [
          { value: "Agendado", status: 1 },
          { value: "Feito na hora", status: 2 },
          { value: "Desmarcado", status: 0 },
        ],
      });
      const num = statusEnum.states.find((item) => item.value === status);

      const token = Cookies.get("token");
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(
        `${BACKEND_URL}/scheduling/${currentName}/report?id_employe=${employe}&startDate=${formatDateConsulting(
          startDate
        )}&endDate=${formatDateConsulting(endDate)}&report=${report}&status=${
          num.status
        }`,
        { headers }
      );
      setReports(response.data);
    } catch (err) {
      console.error("Error fetching report: ", err);
    } finally {
      setLoadingComponent(false);
    }
  };

  useEffect(() => {
    async function fetchApi() {
      setLoadingPage(true);

      try {
        const token = Cookies.get("token");
        if (!token) {
          window.location.assign("/login");
        }

        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(
          `${BACKEND_URL}/employe/${currentName}/employes`,
          { headers }
        );
        setEmployes(response.data);
      } catch (err) {
        if (err.code === "ERR_BAD_REQUEST") {
          window.location.assign("/login");
        }
        navigate("/site/page");
        console.error("Error fetching API: ", err);
      } finally {
        setLoadingPage(false);
      }
    }

    fetchApi();
  }, [currentName, navigate]);

  if (loadingPage) {
    return <Loading title={"Aguarde um momento..."} message={""} />;
  }

  return (
    /* Box geral */
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        minHeight: "100vh",
      }}
    >
      <SideBar />
      <Box
        style={{
          backgroundColor: "#FFFAF0",
          paddingBottom: "1vh",
          width: "100%",
        }}
      >
        {/* Menu Section */}
        <Box
          sx={{
            backgroundImage: `url(${imgCover})`,
            backgroundRepeat: "no-repeat, repeat",
            backgroundSize: "cover",
            width: "100%",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            height: isMobile ? "" : "420px",
          }}
        >
          <Box
            sx={{
              marginBottom: "20px",
            }}
          >
            <LogoImage src={shopData?.logoUrl} marginTop={"20px"} />
          </Box>
          <Box
            sx={{
              backgroundColor: "#FFFAF0",
              padding: isMobile ? "" : "15px",
              paddingBottom: isMobile ? "" : "20px",
              borderRadius: isMobile ? "" : "10px",
              width: isMobile ? "100%" : "45%",
            }}
          >
            {/* Section Select Search */}
            <Box
              sx={{
                display: "flex",
                marginTop: isMobile ? "30px" : "",
                padding: isMobile ? "5px" : "",
              }}
            >
              <FormControl
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  minWidth: 120,
                  margin: 0,
                }}
              >
                <InputLabel>Nome</InputLabel>
                <Select
                  sx={{
                    backgroundColor: "#FFFAF0",
                    width: "800px",
                  }}
                  inputProps={{ MenuProps: { disableScrollLock: true } }}
                  label="Nome"
                  value={employe}
                  onChange={(e) => {
                    setReports([]);
                    setCurrentPage(1);
                    setEmploye(e.target.value);
                  }}
                >
                  <MenuItem value="">
                    <em>Default</em>
                  </MenuItem>
                  {employes?.map((employe) => (
                    <MenuItem key={employe.id} value={employe.id}>
                      {employe.name}
                    </MenuItem>
                  ))}
                </Select>
                <Button
                  onClick={handleClickSearchReport}
                  sx={{
                    fontSize: 40,
                    marginLeft: "10px",
                    padding: "0",
                    cursor: "pointer",
                    border: "1px solid #D3D3D3", // Borda acinzentada
                    borderRadius: "5px", // Arredondar as bordas
                    transition: "0.3s", // Transição suave ao passar o mouse
                    "&:hover": {
                      borderColor: "#000", // Borda preta no hover
                    },
                    "&:active": {
                      color: "#1E96FC", // Mudar cor para azul ao clicar (botão)
                      borderColor: "#1E96FC",
                    },
                  }}
                >
                  <SearchIcon
                    color="disabled"
                    sx={{
                      fontSize: 40,
                      padding: "7px",
                      transition: "0.3s", // Transição suave ao passar o mouse
                      "&:hover": {
                        borderColor: "#000", // Borda preta no hover
                      },
                      "&:active": {
                        color: "#1E96FC", // Mudar cor para azul ao clicar (botão)
                        borderColor: "#1E96FC",
                      },
                    }}
                  />
                </Button>
              </FormControl>
            </Box>

            {/* Calenders */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: isMobile ? "5px" : "",
              }}
            >
              <Box>
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
                    label="Inicio"
                    sx={{
                      color: "#000000",
                    }}
                  >
                    {isMobile ? (
                      <MobileDatePicker
                        format="DD/MM/YYYY"
                        locale="pt-br"
                        value={startDate}
                        onChange={(newValue) => {
                          setReports([]);
                          setCurrentPage(1);
                          setStartDate(newValue);
                        }}
                        shouldDisableDate={unavailableDates}
                      />
                    ) : (
                      <DatePicker
                        format="DD/MM/YYYY"
                        locale="pt-br"
                        value={startDate}
                        onChange={(newValue) => {
                          setReports([]);
                          setCurrentPage(1);
                          setStartDate(newValue);
                        }}
                        shouldDisableDate={unavailableDates}
                      />
                    )}
                  </DemoItem>
                </LocalizationProvider>
              </Box>
              <img
                src={Divisor}
                alt="Divisor"
                style={{
                  marginTop: "30px",
                  width: isMobile ? "100px" : "auto",
                  padding: "5px",
                }}
              />
              <Box>
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
                    label="Fim"
                    sx={{
                      color: "#000000",
                    }}
                  >
                    {isMobile ? (
                      <MobileDatePicker
                        format="DD/MM/YYYY"
                        locale="pt-br"
                        value={endDate}
                        onChange={(newValue) => {
                          setReports([]);
                          setCurrentPage(1);
                          setEndDate(newValue);
                        }}
                        shouldDisableDate={unavailableDates}
                      />
                    ) : (
                      <DatePicker
                        format="DD/MM/YYYY"
                        locale="pt-br"
                        value={endDate}
                        onChange={(newValue) => {
                          setReports([]);
                          setCurrentPage(1);
                          setEndDate(newValue);
                        }}
                        shouldDisableDate={unavailableDates}
                      />
                    )}
                  </DemoItem>
                </LocalizationProvider>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Modal */}
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              width: isMobile ? "80%" : "90%",
              backgroundColor: "white",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Radio */}
            <Box>
              <Box
                sx={{
                  paddingTop: "50px",
                  marginBottom: "50px",
                }}
              >
                <Box
                  sx={{
                    border: "1px solid black",
                    width: "140px",
                    padding: "40px",
                    borderRadius: "10px",
                  }}
                >
                  <FormControl id="demo-controlled-radio-buttons-group">
                    <FormLabel fontSize="1.2em">Relatório</FormLabel>
                    <RadioGroup
                      aria-labelledby="demo-controlled-radio-buttons-group"
                      name="controlled-radio-buttons-group"
                      value={report}
                      onChange={(newValue) => {
                        setReports([]);
                        setCurrentPage(1);
                        setReport(newValue.target.value);
                      }}
                    >
                      <FormControlLabel
                        value="Acumulado"
                        control={<Radio />}
                        label="Acumulado"
                      />
                      <FormControlLabel
                        value="Detalhado"
                        control={<Radio />}
                        label="Detalhado"
                      />
                      <FormControlLabel
                        value="Pendentes"
                        control={
                          <Checkbox
                            checked={checked}
                            onChange={handleChangeCheckbox}
                            inputProps={{ "aria-label": "controlled" }}
                          />
                        }
                        label="Pendentes"
                      />
                      <FormHelperText
                        sx={{ fontWeight: "bold", fontSize: "0.8em" }}
                      >
                        Obs: Habilita datas posteriores
                      </FormHelperText>
                    </RadioGroup>
                  </FormControl>
                </Box>
              </Box>
              <Box
                sx={{
                  marginBottom: "50px",
                }}
              >
                <Box
                  sx={{
                    border: "1px solid black",
                    width: "140px",
                    padding: "40px",
                    borderRadius: "10px",
                  }}
                >
                  <FormControl id="demo-controlled-radio-buttons-group">
                    <FormLabel>Status</FormLabel>
                    <RadioGroup
                      aria-labelledby="demo-controlled-radio-buttons-group"
                      name="controlled-radio-buttons-group"
                      value={status}
                      onChange={(newValue) => {
                        setReports([]);
                        setCurrentPage(1);
                        setStatus(newValue.target.value);
                      }}
                    >
                      <FormControlLabel
                        value="Agendado"
                        control={<Radio />}
                        label="Agendado"
                      />
                      <FormControlLabel
                        value="Feito na hora"
                        control={<Radio />}
                        label="Feito na hora"
                      />
                      <FormControlLabel
                        value="Desmarcado"
                        control={<Radio />}
                        label="Desmarcado"
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>
              </Box>
            </Box>
          </Box>
        </Modal>
        {isMobile ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "left",
              width: "90%",
              paddingTop: "10px",
              paddingBottom: "10px",
              paddingLeft: "5px",
            }}
          >
            <Button
              inputProps={{ MenuProps: { disableScrollLock: true } }}
              onClick={handleOpen}
              variant="contained"
              sx={{
                fontSize: "0.7em",
                width: "110px",
                color: "white",
                height: "25px",
                backgroundColor: "black",
                fontWeight: "bold",
                borderRadius: "5px",
                padding: "5px",
              }}
            >
              {" "}
              Filtros{" "}
            </Button>
          </Box>
        ) : (
          <></>
        )}

        <Box
          sx={{
            display: "flex",
            minHeight: "100vh",
            width: isMobile ? "98%" : "85%",
            margin: isMobile ? "0 auto" : "30px auto",
            marginBottom: "30px",
            padding: "0px",
            boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
            borderRadius: "10px",
            backgroundColor: "white",
          }}
        >
          {isMobile ? (
            <></>
          ) : (
            <Box
              sx={{
                display: "block",
                padding: "40px",
                paddingRight: "0",
              }}
            >
              {/* Radio */}
              <Box
                sx={{
                  marginBottom: "50px",
                }}
              >
                <Box
                  sx={{
                    border: "1px solid black",
                    width: "140px",
                    padding: "40px",
                    borderRadius: "10px",
                  }}
                >
                  <FormControl id="demo-controlled-radio-buttons-group">
                    <FormLabel fontSize="1.2em">Relatório</FormLabel>
                    <RadioGroup
                      aria-labelledby="demo-controlled-radio-buttons-group"
                      name="controlled-radio-buttons-group"
                      value={report}
                      onChange={(newValue) => {
                        setReports([]);
                        setCurrentPage(1);
                        setReport(newValue.target.value);
                      }}
                    >
                      <FormControlLabel
                        value="Acumulado"
                        control={<Radio />}
                        label="Acumulado"
                      />
                      <FormControlLabel
                        value="Detalhado"
                        control={<Radio />}
                        label="Detalhado"
                      />
                      <FormControlLabel
                        value="Pendentes"
                        control={
                          <Checkbox
                            checked={checked}
                            onChange={handleChangeCheckbox}
                            inputProps={{ "aria-label": "controlled" }}
                          />
                        }
                        label="Pendentes"
                      />
                      <FormHelperText
                        sx={{ fontWeight: "bold", fontSize: "0.8em" }}
                      >
                        Obs: Habilita datas posteriores
                      </FormHelperText>
                    </RadioGroup>
                  </FormControl>
                </Box>
              </Box>
              <Box
                sx={{
                  marginBottom: "50px",
                }}
              >
                <Box
                  sx={{
                    border: "1px solid black",
                    width: "140px",
                    padding: "40px",
                    borderRadius: "10px",
                  }}
                >
                  <FormControl id="demo-controlled-radio-buttons-group">
                    <FormLabel>Status</FormLabel>
                    <RadioGroup
                      aria-labelledby="demo-controlled-radio-buttons-group"
                      name="controlled-radio-buttons-group"
                      value={status}
                      onChange={(newValue) => {
                        setReports([]);
                        setCurrentPage(1);
                        setStatus(newValue.target.value);
                      }}
                    >
                      <FormControlLabel
                        value="Agendado"
                        control={<Radio />}
                        label="Agendado"
                      />
                      <FormControlLabel
                        value="Feito na hora"
                        control={<Radio />}
                        label="Feito na hora"
                      />
                      <FormControlLabel
                        value="Desmarcado"
                        control={<Radio />}
                        label="Desmarcado"
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>
              </Box>
            </Box>
          )}
          {/* Radio */}

          {/* Table Data */}
          <Box
            sx={{
              width: "100%",
              padding: isMobile ? "" : "40px",
              display: reports.length > 0 ? "" : "flex",
              justifyContent: reports.length > 0 ? "" : "center",
              alignItems: reports.length > 0 ? "" : "center",
            }}
          >
            <TableData />
          </Box>
        </Box>
        <ScrollToTop />
      </Box>
    </Box>
  );
}

export default Report;
