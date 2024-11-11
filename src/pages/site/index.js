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

const BACKEND_URL = process.env.REACT_APP_API_URL;

function Site() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const maxServices = 3;
  const maxEmployes = 3;

  const { currentName } = useParams();
  const [customer, setCustomer] = useState({});
  const [shopData, setShopData] = useState([]);
  const [schedulingData, setSchedulingData] = useState({ modalStep: 1 });

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

  const currentDate = () => {
    var date = new Date();
    const dateFull = date
      .toLocaleDateString("pt-BR")
      .split("/")
      .reverse()
      .join("-");
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    if (hours < 10) hours = "0" + hours;

    if (minutes < 10) minutes = "0" + minutes;

    if (seconds < 10) seconds = "0" + seconds;

    return `${dateFull}T${hours}:${minutes}:${seconds}`;
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

  const formatCleanCpf = (value) => {
    return value.replace(/[-.]/g, "");
  };

  const formatCleanPhone = (value) => {
    return value.replace(/[()-]/g, "");
  };

  // Formatar campos de cliente
  const formatInputCPF = (value) => {
    if (!value.replace(/\D/g, "")) {
      return "";
    }

    const cleaned = value.replace(/\D/g, ""); // Remove caracteres não numéricos
    const match = cleaned.match(/(\d{3})(\d{3})(\d{3})(\d{2})/);

    if (match) {
      return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
    }

    return value;
  };

  const formatInputPhone = (value) => {
    if (!value.replace(/\D/g, "")) {
      return "";
    }

    const cleaned = value.replace(/\D/g, ""); // Remove caracteres não numéricos
    const match = cleaned.match(/(\d{2})(\d{5})(\d{4})/);

    if (match) {
      return `(${match[1]})${match[2]}-${match[3]}`;
    }

    return value;
  };

  const handleChangeCpf = (e) => {
    const formattedCpf = formatInputCPF(e.target.value);
    setCpf(formattedCpf);
  };

  const handleChangePhone = (e) => {
    const formattedPhone = formatInputPhone(e.target.value);
    setPhone(formattedPhone);
  };
  //

  const HandleSearchCustomer = () => {
    const cpfClean = formatCleanCpf(cpf);
    axios
      .get(`${BACKEND_URL}/customer/${currentName}/client?cpf=${cpfClean}`)
      .then((response) => {
        setCustomer(response.data);
        setName(response.data.name);
        setPhone(formatInputPhone(response.data.whatsapp));
        // setInputDisable(true);
      })
      .catch(() => {
        setName("");
        setPhone("");
        // setInputDisable(true);
        return;
      });
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
          starts_at: currentDate(),
          ends_at: currentDate(),
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
    async function fetchApi() {
      setLoadingPage(true);

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
  }, [currentName, navigate]);

  const ConsultAvaliableHours = ({
    currentDbName,
    schedulingData,
    setSchedulingData,
  }) => {
    const [avaliableTimes, setAvaliableTimes] = useState([]);
    const [loadingComponent, setLoadingComponent] = useState(true);

    useEffect(() => {
      const fetchAvaliableTimes = async () => {
        if (schedulingData.date) {
          setTimeout(() => setLoadingComponent(false), 2500);
          try {
            const res = await axios.post(
              `${BACKEND_URL}/scheduling/${currentDbName}/period`,
              {
                date: schedulingData.date,
                activities: schedulingData.activities,
              }
            );

            setAvaliableTimes(res.data);
          } catch (err) {
            console.error(err);
          }
        }
      };

      fetchAvaliableTimes(); // Chamar a função dentro do useEffect sempre que schedulingData.date mudar
    }, [schedulingData.date, currentDbName]); // Executar o useEffect sempre que a data ou currentName mudarem

    if (!avaliableTimes.length) {
      return null; // Retorna null enquanto não há horários disponíveis
    }

    setReturnHours(true);

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

    return (
      <Box
        display="grid"
        gridTemplateColumns="repeat(3, auto)"
        gap="5px"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        mt="20px"
        padding="10px"
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
                setSchedulingData({ ...schedulingData, time: formattedTime })
              }
            />
          );
        })}
      </Box>
    );
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
            width: isMobile ? "90%" : "470px" && returnHours ? "33%" : "470px",
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
            sx={{ fontSize: isMobile ? "25px" : "30px", marginTop: "50px" }}
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
                    onChange={(e) =>
                      setSchedulingData({
                        ...schedulingData,
                        activities: e.target.value,
                      })
                    }
                  >
                    {shopData?.activities?.map((service) => {
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
                    value={schedulingData.employe || []}
                    onChange={(e) =>
                      setSchedulingData({
                        ...schedulingData,
                        employe: e.target.value,
                      })
                    }
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
                onBlur={HandleSearchCustomer}
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
                sx={{ fontSize: "16px", marginY: "10px", textAlign: "center" }}
              >
                Serviços selecionados:{" "}
                {schedulingData?.activities?.map((service) => {
                  const serviceName = shopData?.activities.map((data) =>
                    data.id === service.id ? data.name_service : null
                  );
                  return <Chip label={serviceName} />;
                })}
              </Typography>
              <Box
                display={isMobile ? "block" : "flex"}
                gap="10px"
                marginTop="0"
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateCalendar
                    value={
                      schedulingData.date ? dayjs(schedulingData.date) : null
                    }
                    onChange={(newValue) =>
                      setSchedulingData({
                        ...schedulingData,
                        date: newValue.format("YYYY-MM-DD"),
                      })
                    }
                    shouldDisableDate={unavailableDates}
                  />
                </LocalizationProvider>

                <ConsultAvaliableHours
                  currentDbName={currentName}
                  schedulingData={schedulingData}
                  setSchedulingData={setSchedulingData}
                />
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
              , {shopData.address?.city} - {shopData.address?.uf}
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
              {shopData.whatsapp}
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
          © 2024 BarberShop. Todos os direitos reservados.
        </Typography>
      </Box>
      <ScrollToTop />
    </>
  );
}

export default Site;
