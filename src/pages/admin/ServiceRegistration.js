import {
  Box,
  Fab,
  FormControl,
  FormHelperText,
  TextField,
  Typography,
} from "@mui/material";

import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import TableRow from "@mui/material/TableRow";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { red, yellow } from "@mui/material/colors";

import SideBar from "../../components/sideBar";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import config from "../../config";
import LoadingComponent from "../../components/LoadingComponent";
import Pagination from "../../components/Pagination";
import ScrollToTop from "../../components/ScrollToTop";

const BACKEND_URL = config.BACKEND_URL;

let PageSize = 6;

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

function ServiceRegistration() {
  const [services, setServices] = useState({});

  const [nameService, setNameService] = useState("");
  const [timeService, setTimeService] = useState("00:00:00");
  const [price, setPrice] = useState("R$ 0,00");
  const [description, setDescription] = useState("");
  const [idItem, setIdItem] = useState(null);

  const [error, setError] = useState({
    nameService: "",
    timeService: "",
    price: "",
    description: "",
  });

  const [currentPage, setCurrentPage] = useState(1);

  const [loadingSave, setLoadingSave] = useState(false);

  const [loadingComponent, setLoadingComponent] = useState(false);
  const [addService, setAddService] = useState(false);
  const { currentName } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Verifica se é mobile
  const navigate = useNavigate();

  const handleAdd = () => {
    setAddService(true);
  };

  const handleClose = () => {
    setIdItem(null);
    setNameService("");
    setTimeService("00:00:00");
    setPrice("R$ 0,00");
    setDescription("");
    setAddService(false);
    setLoadingSave(false);
    setError({
      nameService: "",
      timeService: "",
      price: "",
      description: "",
    });
  };

  const handleOpenItem = (service) => {
    setAddService(true);
    setIdItem(service.id);
    setNameService(service.name_service);
    setTimeService(service.time_service);
    setPrice(service.price);
    setDescription(service.description);
  };

  const handleSaveItem = async () => {
    setError({
      nameService: "",
      timeService: "",
      price: "",
      description: "",
    });

    if (nameService === "") {
      setError((prev) => ({
        ...prev,
        nameService: "Nome do Serviço precisa ser preenchido",
      }));
      return;
    }

    if (timeService === "00:00:00") {
      setError((prev) => ({
        ...prev,
        timeService: "O tempo precisa ser maior que 00:00:00",
      }));
      return;
    }

    const arrPrice = price.split("R$");
    const cleanPrice = arrPrice[1].replace(/[" "]/g, "");
    const formattedPrice = cleanPrice.replace(/[","]/g, ".");
    const transformValue = parseFloat(formattedPrice);

    if (transformValue === 0 || isNaN(transformValue)) {
      setError((prev) => ({
        ...prev,
        price: "O valor não pode ser R$ 0,00 e necessita ser númerico",
      }));
      return;
    }

    setLoadingSave(true);

    try {
      const token = Cookies.get("token");
      if (!token) {
        window.location.assign("/login");
      }

      const headers = { Authorization: `Bearer ${token}` };
      const service = {
        name_service: nameService,
        price: transformValue,
        time_service: timeService,
        description,
      };
      if (!idItem) {
        const response = await axios.post(
          `${BACKEND_URL}/activity/${currentName}`,
          service,
          { headers }
        );
      } else {
        const response = await axios.put(
          `${BACKEND_URL}/activity/${currentName}?activity_id=${idItem}`,
          service,
          { headers }
        );
      }
    } catch (err) {
    } finally {
      setServices({});
      handleClose();
    }
  };

  const formatInputHours = (num) => {
    // Remove caracteres não numéricos e os dois pontos
    const cleaned = num.replace(/[^\d:]/g, "");

    // Verifica se a string limpa não contém nenhum dígito
    if (!cleaned.replace(/\D/g, "")) {
      return "00:00:00";
    }

    // Conta quantos pontos foram encontrados
    const colonCount = (cleaned.match(/:/g) || []).length;

    // Se não houver dois pontos, retorna "00:00:00"
    if (colonCount !== 2) {
      return "00:00:00";
    }

    // Remove os dois pontos para processamento
    const withoutColons = cleaned.replace(/:/g, "");

    // Preenche com zeros à esquerda para garantir que a string tenha pelo menos 8 caracteres
    const paddedNum = withoutColons.padStart(8, "0");

    // Extrai partes da string
    const hours = paddedNum.slice(-6, -4); // Horas
    const minutes = paddedNum.slice(-4, -2); // Minutos
    const seconds = paddedNum.slice(-2); // Segundos

    // Formata a string no formato hh:mm:ss
    return `${hours}:${minutes}:${seconds}`;
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

  const handleValueChange = (event, setValue) => {
    const input = event.target.value;
    const formattedValue = formatCurrency(input);
    setValue(formattedValue); // Atualiza o estado com o valor formatado
  };

  const handleChangeOpening = (newValue, setValue) => {
    const input = newValue.target.value;
    const formattedOpening = formatInputHours(input);
    setValue(formattedOpening);
  };

  const currentTableData = useMemo(() => {
    if (Array.isArray(services)) {
      const findServices = services.map((service) => {
        return service;
      });

      // Paginar os agendamentos de hoje
      const firstPageIndex = (currentPage - 1) * PageSize;
      const lastPageIndex = firstPageIndex + PageSize;
      return findServices.slice(firstPageIndex, lastPageIndex);
    }
    return [];
  }, [services, currentPage]);

  const totalCount = useMemo(() => {
    if (Array.isArray(services)) {
      return services.map((service) => {
        return service;
      }).length;
    }
    return 0;
  }, [services]);

  const TableData = () => {
    if (loadingComponent) {
      return (
        <Box
          mt="20px"
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "10px",
            height: "400px",
          }}
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
                    width: "300px",
                  }}
                >
                  Nome
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{
                    fontSize: "1.1em",
                    width: "150px",
                  }}
                >
                  Tempo do Serviço
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{
                    fontSize: "1.1em",
                    width: "700px",
                  }}
                >
                  Descrição
                </StyledTableCell>
                <StyledTableCell
                  align="right"
                  sx={{
                    fontSize: "1.1em",
                    width: "100px",
                  }}
                >
                  Valor
                </StyledTableCell>
                <StyledTableCell></StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentTableData?.map((service) => (
                <StyledTableRow key={service.id}>
                  <StyledTableCell component="th" scope="row">
                    {service.name_service}
                  </StyledTableCell>
                  <StyledTableCell
                    component="th"
                    scope="row"
                    align="center"
                    sx={{
                      width: "150px",
                    }}
                  >
                    {service.time_service}
                  </StyledTableCell>
                  <StyledTableCell
                    align="left"
                    sx={{
                      width: "700px",
                    }}
                  >
                    {service.description}
                  </StyledTableCell>
                  <StyledTableCell
                    align="right"
                    sx={{
                      width: "100px",
                    }}
                  >
                    {formatCurrency(service.price)}
                  </StyledTableCell>
                  <StyledTableCell
                    align="center"
                    sx={{
                      width: "100px",
                    }}
                  >
                    <Fab
                      size="small"
                      aria-label="add"
                      sx={{
                        backgroundColor: yellow[500],
                        "&:hover": {
                          backgroundColor: yellow[700],
                        },
                      }}
                      onClick={() => handleOpenItem(service)}
                    >
                      <EditIcon />
                    </Fab>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Pagination
          className="pagination-bar"
          currentPage={currentPage}
          totalCount={totalCount}
          pageSize={PageSize}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Box>
    ) : (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Typography
          sx={{
            fontSize: "20px",
            fontWeight: "bold",
          }}
        >
          Não há nenhum serviço cadastrado...
        </Typography>
        <Box
          sx={{
            marginTop: "30px",
          }}
        >
          <Fab color="primary" aria-label="add" onClick={handleAdd}>
            <AddIcon />
          </Fab>
        </Box>
      </Box>
    );
  };

  useEffect(() => {
    if (!services.length) {
      async function fetchApi() {
        setLoadingComponent(true);

        try {
          const token = Cookies.get("token");
          if (!token) {
            window.location.assign("/login");
          }

          const headers = { Authorization: `Bearer ${token}` };
          const response = await axios.get(
            `${BACKEND_URL}/activity/${currentName}/activities`,
            { headers }
          );
          setServices(response.data);
        } catch (err) {
          navigate("/site/page");
          console.error("Error fetching API: ", err);
        } finally {
          setLoadingComponent(false);
        }
      }

      fetchApi();
    }

    if (addService) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  }, [currentName, addService]);

  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          backgroundColor: "#FFFAF0",
          minHeight: "100vh",
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        <SideBar />
        <Box
          sx={{
            width: services.length ? "100%" : "100%",
            padding: isMobile ? "10px" : "80px",
            paddingTop: "35px",
            boxSizing: "border-box",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: "36px",
                  fontFamily: "Marcellus",
                  width: isMobile ? "30%" : "100%",
                }}
              >
                Serviços cadastrados
              </Typography>
            </Box>
            <Box
              sx={{
                marginTop: "30px",
                paddingBottom: "10px",
              }}
            >
              <Fab
                color="primary"
                aria-label="add"
                onClick={handleAdd}
                size="medium"
              >
                <AddIcon />
              </Fab>
            </Box>
          </Box>
          <Box
            sx={{
              border: services.length ? "" : "1px solid black",
              height: services.length ? "auto" : "500px",
            }}
          >
            <TableData />
          </Box>
          {addService ? (
            <Box
              sx={{
                border: "1px solid black",
                minHeight: "250px",
                marginTop: "30px",
                marginBottom: isMobile ? "80px" : "0",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "15px",
                }}
              >
                <Fab
                  color="primary"
                  aria-label="save"
                  sx={{
                    borderRadius: "8px", // Define os cantos arredondados (use 0 para totalmente quadrado)
                    width: "46px", // Tamanho personalizado
                    height: "46px",
                  }}
                  onClick={handleSaveItem}
                >
                  <SaveIcon />
                </Fab>
                <Fab
                  sx={{
                    borderRadius: "8px", // Define os cantos arredondados (use 0 para totalmente quadrado)
                    width: "46px", // Tamanho personalizado
                    height: "46px",
                    backgroundColor: red[900],
                    "&:hover": {
                      backgroundColor: red[700],
                    },
                  }}
                  onClick={handleClose}
                >
                  <CloseIcon
                    sx={{
                      color: "#ffff",
                    }}
                  />
                </Fab>
              </Box>
              <Box
                sx={{
                  display: isMobile ? "block" : "flex",
                  gap: "100px",
                }}
              >
                <Box
                  sx={{
                    padding: "10px",
                    width: isMobile ? "auto" : "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      gap: "10px",
                    }}
                  >
                    <Box
                      sx={{
                        width: isMobile ? "100%" : "80%",
                      }}
                    >
                      <FormControl
                        fullWidth
                        variant="outlined"
                        error={Boolean(error.nameService)}
                      >
                        <TextField
                          label="Nome do Serviço"
                          value={nameService}
                          onChange={(newValue) =>
                            setNameService(newValue.target.value)
                          }
                          type="text"
                          variant="outlined"
                          autoComplete="off"
                          inputProps={{ maxLength: 255 }}
                          sx={{
                            width: "100%",
                            height: "67px",
                            marginTop: "10px",
                          }}
                        />
                        {error.nameService && (
                          <FormHelperText>{error.nameService}</FormHelperText>
                        )}
                      </FormControl>
                    </Box>

                    <Box
                      sx={{
                        width: isMobile ? "100%" : "20%",
                      }}
                    >
                      <FormControl
                        fullWidth
                        variant="outlined"
                        error={Boolean(error.timeService)}
                      >
                        <TextField
                          label="Tempo do Serviço"
                          type="text"
                          value={timeService}
                          onChange={(newValue) => {
                            handleChangeOpening(newValue, setTimeService);
                          }}
                          variant="outlined"
                          autoComplete="off"
                          sx={{
                            width: "100%",
                            height: "67px",
                            marginTop: "10px",
                          }}
                          // disabled={isDisabled}
                        />
                        {error.timeService && (
                          <FormHelperText>{error.timeService}</FormHelperText>
                        )}
                      </FormControl>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      gap: "10px",
                    }}
                  >
                    <Box
                      sx={{
                        width: isMobile ? "100%" : "85%",
                      }}
                    >
                      <FormControl
                        fullWidth
                        variant="outlined"
                        error={Boolean(error.description)}
                      >
                        <TextField
                          label="Descrição"
                          value={description}
                          onChange={(newValue) =>
                            setDescription(newValue.target.value)
                          }
                          type="text"
                          variant="outlined"
                          autoComplete="off"
                          inputProps={{ maxLength: 255 }}
                          sx={{
                            width: "100%",
                            height: "67px",
                            marginTop: "10px",
                          }}
                        />
                        {error.description && (
                          <FormHelperText>{error.description}</FormHelperText>
                        )}
                      </FormControl>
                    </Box>
                    <Box
                      sx={{
                        width: isMobile ? "100%" : "15%",
                      }}
                    >
                      <FormControl
                        fullWidth
                        variant="outlined"
                        error={Boolean(error.price)}
                      >
                        <TextField
                          label="Valor"
                          type="text"
                          value={price}
                          onChange={(newValue) =>
                            handleValueChange(newValue, setPrice)
                          }
                          autoComplete="off"
                          variant="outlined"
                          sx={{
                            width: "100%",
                            height: "67px",
                            marginTop: "10px",
                          }}
                        />
                        {error.price && (
                          <FormHelperText>{error.price}</FormHelperText>
                        )}
                      </FormControl>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box></Box>
          )}
          <ScrollToTop />
        </Box>
      </Box>
    </>
  );
}

export default ServiceRegistration;
