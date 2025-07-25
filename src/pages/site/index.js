import {
  Box,
  Typography,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  useMediaQuery,
  Chip,
  TextField,
} from "@mui/material";
import imgCover from "../../images/cover.png";
import Divisor from "../../images/divisor.png";
import DivisorGray from "../../images/divisorGray.png";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../components/Header.js";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import Loading from "./Loading.js";
import LoadingComponent from "../../components/LoadingComponent.js";
import ScrollToTop from "../../components/ScrollToTop.js";
import config from "../../config.js";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import {
  formatDateConsulting,
  currentDateFull,
  currentDateMonth,
} from "../../functions/formatDate.js";
import { formatCleanCpf, formatInputCPF } from "../../functions/formatCpf.js";
import {
  formatCleanPhone,
  formatInputPhone,
} from "../../functions/formatPhone.js";

// const BACKEND_URL = process.env.REACT_APP_API_URL;
const BACKEND_URL = config.BACKEND_URL;

function Site() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const maxServices = 3;
  const maxEmployes = 3;

  const { currentName } = useParams();
  const [customer, setCustomer] = useState({});
  const [shopData, setShopData] = useState([]);
  const [schedulingData, setSchedulingData] = useState({ modalStep: 1 });
  const [loadingComponent, setLoadingComponent] = useState(false);
  const [avaliableTimes, setAvaliableTimes] = useState(false);
  const [currentDate, setCurrentDate] = useState(dayjs(currentDateMonth()));

  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  const [loadingPage, setLoadingPage] = useState(true);
  const [open, setOpen] = useState(false);
  const [returnHours, setReturnHours] = useState(false);

  const formatTitleNameEstablishment = (name) => {
    if (name === undefined) {
      return;
    }

    let arrStr = name.split("_");

    let firstStr = arrStr[0].replace(arrStr[0][0], arrStr[0][0].toUpperCase());
    let lastStr = arrStr[arrStr.length - 1].replace(
      arrStr[arrStr.length - 1][0],
      arrStr[arrStr.length - 1][0].toUpperCase()
    );

    arrStr[0] = firstStr;
    arrStr[arrStr.length - 1] = lastStr;

    let originalName = arrStr.toString();

    return originalName.replace(/,/g, " ");
  };

  const unavailableDates = (date) => {
    let dateCalender = new Date();

    dateCalender.toLocaleDateString("pt-BR");

    let previousDaysUnavailable = dateCalender.setDate(
      dateCalender.getDate() - 1
    );
    let sevenDaysAvaliables = dateCalender.setDate(dateCalender.getDate() + 7);

    return (
      date.isBefore(previousDaysUnavailable) ||
      date.isAfter(sevenDaysAvaliables)
    );
  };

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

  // Responsividade
  const isMobile = useMediaQuery("(max-width:800px)");

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setSchedulingData({ modalStep: 1 });
    setReturnHours(false);
    setCpf("");
    setName("");
    setPhone("");
    setOpen(false);
    setCurrentDate(dayjs(currentDateMonth()));
    setAvaliableTimes([]);
  };

  const handleModalClick = () => {
    if (schedulingData.modalStep == 1) {
      setSchedulingData({
        ...schedulingData,
        customer: {
          id: customer.id || "",
          name: customer.name || name,
          cpf: customer.cpf || formatCleanCpf(cpf),
          whatsapp: customer.whatsapp || formatCleanPhone(phone),
        },
        modalStep: 2,
      });

      setLoadingPage(false);
    }

    if (schedulingData.modalStep == 2) {
      setSchedulingData({
        ...schedulingData,
      });

      axios
        .post(`${BACKEND_URL}/scheduling/${currentName}`, {
          activities: schedulingData.activities,
          employe: schedulingData.employe,
          customer: {
            name,
            cpf: formatCleanCpf(cpf),
            whatsapp: formatCleanPhone(phone),
          },
          date_scheduling: `${schedulingData.date}T${schedulingData.time}`,
          starts_at: currentDateFull(),
          ends_at: currentDateFull(),
          status: 1,
        })
        .then((response) => {
          enqueueSnackbar("Agendamento realizado com sucesso!", {
            variant: "success",
            anchorOrigin: { horizontal: "right", vertical: "top" },
          });
          setCustomer({});
          handleClose();
        })
        .catch((err) => {
          enqueueSnackbar("Erro ao salvar agendamento, tente novamente.", {
            variant: "error",
            anchorOrigin: { horizontal: "right", vertical: "top" },
          });
          console.log(err);
          handleClose();
        });
    }
  };

  useEffect(() => {
    if ((shopData.length <= 0 && loadingPage) || loadingPage) {
      async function fetchApi() {
        try {
          const response = await axios.get(
            `${BACKEND_URL}/establishment/${currentName}`
          );
          const data = response.data;
          setShopData(data);
        } catch (err) {
          navigate("/site/page");
          console.error("Error fetching API: ", err);
        } finally {
          setLoadingPage(false);
        }
      }

      fetchApi();
    }

    if (currentDate) {
      consultAvaliableHours(currentDate);
    }
  }, [currentName, navigate, currentDate]);

  const consultAvaliableHours = async (selectedDate) => {
    setLoadingComponent(true);
    setAvaliableTimes([]);

    if (schedulingData?.activities?.length <= 0) {
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

        setAvaliableTimes(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingComponent(false);
      }
    }
  };

  const isScheduleButtonDisable = () => {
    if (schedulingData.modalStep == 1) {
      return (
        !schedulingData.employe ||
        !schedulingData.activities ||
        phone.length !== 14 ||
        !cpf ||
        !name
      );
    }

    if (schedulingData.modalStep == 2) {
      return !schedulingData.date || !schedulingData.time;
    }
  };

  if (loadingPage) {
    return (
      <Loading
        title={"Aguarde um momento..."}
        message={"Estamos preparando tudo para o seu agendamento!"}
      />
    );
  }

  return (
    <>
      <Header shopData={shopData} isMobile={isMobile} />

      {/* Hero Section */}
      <Box
        sx={{
          backgroundImage: `url(${imgCover})`,
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          height: isMobile ? "300px" : "400px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            maxWidth: "580px",
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: isMobile ? "35px" : "50px",
              fontFamily: "Marcellus",
            }}
          >
            {" "}
            {formatTitleNameEstablishment(shopData?.name)}{" "}
          </Typography>
          <Typography
            sx={{ fontSize: isMobile ? "18px" : "30px", marginTop: 3 }}
          >
            {" "}
            {shopData.description}{" "}
          </Typography>
        </Box>
      </Box>

      {/* Services Section */}
      <Box
        sx={{
          backgroundColor: "#FFFAF0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
        id="services"
      >
        <Box sx={{ textAlign: "center", marginTop: "40px", maxWidth: "630px" }}>
          <Typography
            sx={{
              fontFamily: "Marcellus",
              fontSize: isMobile ? "35px" : "45px",
            }}
          >
            NOSSOS SERVIÇOS
          </Typography>
          <Typography
            sx={{ fontSize: isMobile ? "20px" : "28px", marginTop: "15px" }}
          >
            {" "}
            Nós temos os melhores serviços para você{" "}
          </Typography>
        </Box>

        <img src={Divisor} alt="Divisor" className="divisor" />

        {shopData?.activities?.length ? (
          <>
            {shopData.activities.slice(0, maxServices).map((service) => (
              <Box
                key={service.id}
                sx={{
                  marginTop: "30px",
                  display: "flex",
                  width: isMobile ? "90%" : "650px",
                  justifyContent: "space-between",
                  borderBottom: "2px solid black",
                  height: "50px",
                }}
              >
                <Typography sx={{ fontSize: isMobile ? "18px" : "22px" }}>
                  {service.name_service}
                </Typography>
                <Typography sx={{ fontSize: isMobile ? "18px" : "22px" }}>
                  R${service.price}
                </Typography>
              </Box>
            ))}

            {shopData.activities.length > maxServices && (
              <Typography sx={{ fontSize: isMobile ? "18px" : "22px" }}>
                ...
              </Typography>
            )}
          </>
        ) : (
          <Typography sx={{ fontSize: isMobile ? "18px" : "22px" }}>
            Não há nenhum serviço cadastrado...
          </Typography>
        )}
        <Button
          onClick={handleOpen}
          variant="contained"
          sx={{
            width: "250px",
            backgroundColor: "#35312D",
            borderRadius: "27px",
            marginTop: "50px",
            marginBottom: "70px",
            fontWeight: "bold",
          }}
          disabled={
            shopData?.employes?.length && shopData?.activities?.length
              ? false
              : true
          }
        >
          Agendar horário
        </Button>
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
            backgroundColor: "#FFFAF0",
            width: isMobile ? "90%" : "470px" && returnHours ? "auto" : "580px",
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
          {schedulingData.modalStep === 2 ? (
            <Box
              sx={{
                width: "100%",
                marginTop: "20px",
                display: "flex",
                justifyContent: "left", // Alinha o botão à esquerda
              }}
            >
              <Button
                sx={{
                  padding: "5px",
                  minWidth: "0",
                  marginLeft: "10px",
                  borderRadius: "50%",
                }}
                onClick={() =>
                  setSchedulingData({
                    ...schedulingData,
                    modalStep: 1,
                  })
                }
              >
                <ArrowBackIcon sx={{ padding: "5px", fontSize: "1.5em" }} />
              </Button>
            </Box>
          ) : (
            <></>
          )}
          <Typography
            sx={{
              fontSize: isMobile ? "25px" : "30px",
              marginTop: schedulingData.modalStep === 2 ? "0" : "60px",
            }}
          >
            Agende um Horário
          </Typography>
          <img src={Divisor} alt="Divisor" />

          {schedulingData.modalStep == 1 && (
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
                      setCurrentDate(dayjs(currentDate));
                      setSchedulingData({
                        ...schedulingData,
                        activities: e.target.value,
                      });
                    }}
                  >
                    {shopData?.activities?.map((service) => {
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
                    {shopData?.employes?.map((employe) => {
                      return (
                        <MenuItem key={employe.id} value={employe}>
                          {employe.name}
                        </MenuItem>
                      );
                    })}
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
            </>
          )}

          {schedulingData.modalStep == 2 && (
            <>
              <Typography
                sx={{
                  fontSize: "16px",
                  marginY: "10px",
                  textAlign: "center",
                  width: "90%",
                }}
              >
                Serviços selecionados:{" "}
                {schedulingData?.activities?.map((service) => {
                  const serviceName = shopData?.activities.map((data) =>
                    data.id === service.id ? data.name_service : null
                  );
                  return <Chip label={serviceName} />;
                })}
              </Typography>
              <Box marginTop="0">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateCalendar
                    format="DD/MM/YYYY"
                    locale="pt-br"
                    value={currentDate}
                    onChange={(newValue) => {
                      setCurrentDate(newValue);
                      consultAvaliableHours(newValue);
                      schedulingData.time = "";
                    }}
                    shouldDisableDate={unavailableDates}
                    sx={{
                      height: isMobile ? "250px" : "336px",
                    }}
                  />
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
                      sx={{
                        marginTop: isMobile ? "5px" : "10px",
                        maxHeight: "18vh", // Define uma altura máxima em relação à altura da viewport
                        overflowY: "auto", // Adiciona rolagem vertical se o conteúdo exceder a altura
                      }}
                    >
                      {avaliableTimes.map((datetime) => {
                        const formattedTime = dayjs(datetime).format("HH:mm");

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
            </>
          )}

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
            {schedulingData.modalStep == 1 ? "Escolher horário" : "Agendar"}
          </Button>
        </Box>
      </Modal>

      {/* Profissionais */}
      <Box
        sx={{
          width: "100%",
          backgroundColor: "#35312D",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
        id="barbers"
      >
        <Box
          sx={{
            maxWidth: "630px",
            color: "white",
            textAlign: "center",
            marginTop: "55px",
          }}
        >
          <Typography
            sx={{
              fontSize: isMobile ? "35px" : "45px",
            }}
          >
            Nossos Barbeiros
          </Typography>
          <Typography
            sx={{
              fontSize: isMobile ? "20px" : "28px",
            }}
          >
            Contamos com uma equipe de profissionais altamente capacitados
          </Typography>
        </Box>

        <img src={DivisorGray} alt="Divisor Gray" className="divisorGray" />

        <Box
          sx={{
            display: shopData?.employes?.length ? "grid" : "",
            gridTemplateColumns: isMobile
              ? ""
              : `repeat(${Math.min(shopData?.employes?.length || 1, 3)}, auto)`,
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "center",
            alignItems: "center",
            gap: isMobile ? "60px" : "40px",
            marginTop: "28px",
            marginBottom: "30px",
          }}
        >
          {shopData?.employes?.length ? (
            <>
              {shopData.employes.slice(0, maxServices).map((employe) => (
                <Box
                  key={employe.id}
                  sx={{ width: "332px", textAlign: "center" }}
                >
                  <Typography
                    sx={{
                      fontSize: isMobile ? "20px" : "25px",
                      color: "white",
                    }}
                  >
                    {employe.name}
                  </Typography>
                </Box>
              ))}
            </>
          ) : (
            <Typography
              sx={{ fontSize: isMobile ? "18px" : "22px", color: "white" }}
            >
              Não há nenhum barbeiro cadastrado...
            </Typography>
          )}
        </Box>
        {shopData?.employes?.length > maxEmployes && (
          <Typography
            sx={{
              fontSize: isMobile ? "18px" : "22px",
              textAlign: "center",
              color: "white",
              marginBottom: "20px",
            }}
          >
            ...
          </Typography>
        )}
      </Box>

      {/* Localização e Contato */}
      <Box
        sx={{
          width: "100%",
          backgroundColor: "#FFFAF0",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: isMobile ? "40px 20px" : "70px 0",
        }}
        id="location"
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? "40px" : "80px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              height: isMobile ? "auto" : "360px",
              textAlign: isMobile ? "center" : "left",
            }}
          >
            <Typography
              sx={{
                fontSize: isMobile ? "25px" : "32px",
                fontFamily: "Marcellus",
              }}
            >
              Nossa localização
            </Typography>
            <Typography
              sx={{
                fontSize: isMobile ? "16px" : "18px",
                fontFamily: "Marcellus",
                marginBottom: "40px",
              }}
            >
              {shopData.address?.public_place}, {shopData.address?.neighborhood}
              , {shopData.address?.city} - {shopData.address?.uf} |{" "}
              {shopData.address?.cep}
            </Typography>

            <Typography
              sx={{
                fontSize: isMobile ? "25px" : "32px",
                fontFamily: "Marcellus",
              }}
            >
              Entre em contato
            </Typography>
            <Typography
              sx={{
                fontSize: isMobile ? "16px" : "18px",
                fontFamily: "Marcellus",
              }}
            >
              {formatInputPhone(shopData.whatsapp)}
            </Typography>
          </Box>

          {/* Maps */}
          {/* <Box sx={{ marginBottom: isMobile ? "40px" : "" }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.537511844664!2d-46.31347162376024!3d-23.54913116114482!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce709fb98e9c53%3A0x1e54f7f387173d62!2sR.%20Baruel%20-%20Suzano%2C%20SP!5e0!3m2!1spt-BR!2sbr!4v1721328008295!5m2!1spt-BR!2sbr"
              width={isMobile ? "300" : "520"}
              height={isMobile ? "200" : "360"}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </Box> */}
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          width: "100%",
          backgroundColor: "#35312D",
          height: isMobile ? "80px" : "100px",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        id="contact"
      >
        <Typography
          sx={{ fontSize: isMobile ? "15px" : "20px", fontFamily: "Marcellus" }}
        >
          © 2024 BarberEasy. Todos os direitos reservados.
        </Typography>
      </Box>
      <ScrollToTop />
    </>
  );
}

export default Site;
