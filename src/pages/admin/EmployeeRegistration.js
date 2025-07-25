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

import { formatInputCPF, formatCleanCpf } from "../../functions/formatCpf";

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
  const [employes, setEmploye] = useState({});

  const [nameEmploye, setNameEmploye] = useState("");
  const [cpfEmploye, setCpfEmploye] = useState("");
  const [idItem, setIdItem] = useState(null);
  const [docFound, setDocFound] = useState("");
  const [status, setStatus] = useState(false);

  const [error, setError] = useState({
    nameEmploye: "",
    cpfEmploye: "",
  });

  const [currentPage, setCurrentPage] = useState(1);

  const [loadingSave, setLoadingSave] = useState(false);

  const [loadingComponent, setLoadingComponent] = useState(false);
  const [addEmploye, setAddEmploye] = useState(false);
  const { currentName } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Verifica se é mobile
  const navigate = useNavigate();

  const handleAdd = () => {
    setAddEmploye(true);
  };

  const handleClose = () => {
    setIdItem(null);
    setNameEmploye("");
    setCpfEmploye("");
    setAddEmploye(false);
    setLoadingSave(false);
    setError({
      nameEmploye: "",
      cpfEmploye: "",
    });
  };

  const handleOpenItem = (employe) => {
    setAddEmploye(true);
    setIdItem(employe.id);
    setNameEmploye(employe.name);
    setCpfEmploye(formatInputCPF(employe.cpf));
    setDocFound(formatInputCPF(employe.cpf));
  };

  const handleSaveItem = async () => {
    setError({
      nameEmploye: "",
      cpfEmploye: "",
    });

    if (nameEmploye === "") {
      setError((prev) => ({
        ...prev,
        nameEmploye: "Nome do funcionário precisa ser preenchido",
      }));
      return;
    }

    if (cpfEmploye.length < 14) {
      setError((prev) => ({
        ...prev,
        cpfEmploye: "O CPF precisa ser preenchido corretamente",
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
      const employe = {
        name: nameEmploye,
        cpf: formatCleanCpf(cpfEmploye),
      };
      if (!idItem) {
        const response = await axios.post(
          `${BACKEND_URL}/employe/${currentName}`,
          employe,
          { headers }
        );
        setEmploye({});
        handleClose();
      } else {
        const response = await axios.put(
          `${BACKEND_URL}/employe/${currentName}?employe_id=${idItem}`,
          employe,
          { headers }
        );
        setEmploye({});
        handleClose();
      }
    } catch (err) {
      if (
        docFound !== cpfEmploye &&
        err.response.data === "CPF already registered."
      ) {
        setError((prev) => ({
          ...prev,
          cpfEmploye: "CPF já cadastrado!",
        }));
        setStatus(true);
      }
    }
  };

  const handleChangeCpf = (newValue, setValue) => {
    const input = newValue.target.value;
    const formattedCpf = formatInputCPF(input);
    setValue(formattedCpf);
  };

  const currentTableData = useMemo(() => {
    if (Array.isArray(employes)) {
      const findServices = employes.map((employe) => {
        return employe;
      });

      // Paginar os agendamentos de hoje
      const firstPageIndex = (currentPage - 1) * PageSize;
      const lastPageIndex = firstPageIndex + PageSize;
      return findServices.slice(firstPageIndex, lastPageIndex);
    }
    return [];
  }, [employes, currentPage]);

  const totalCount = useMemo(() => {
    if (Array.isArray(employes)) {
      return employes.map((employe) => {
        return employe;
      }).length;
    }
    return 0;
  }, [employes]);

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
                  Doc.
                </StyledTableCell>
                <StyledTableCell></StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentTableData?.map((employe) => (
                <StyledTableRow key={employe.id}>
                  <StyledTableCell component="th" scope="row">
                    {employe.name}
                  </StyledTableCell>
                  <StyledTableCell
                    component="th"
                    scope="row"
                    align="center"
                    sx={{
                      width: "150px",
                    }}
                  >
                    {formatInputCPF(employe.cpf)}
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
                      onClick={() => handleOpenItem(employe)}
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
            textAlign: "center",
          }}
        >
          Não há nenhum funcionário cadastrado...
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
    if (!employes.length) {
      async function fetchApi() {
        setLoadingComponent(true);

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
          setEmploye(response.data);
        } catch (err) {
          navigate("/site/page");
          console.error("Error fetching API: ", err);
        } finally {
          setLoadingComponent(false);
        }
      }

      fetchApi();
    }

    if (addEmploye) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  }, [currentName, addEmploye]);

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
            width: employes.length ? "100%" : "100%",
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
                Barbeiros
              </Typography>
            </Box>
            {employes.length ? (
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
            ) : (
              <></>
            )}
          </Box>
          <Box
            sx={{
              border: employes.length ? "" : "1px solid black",
              height: employes.length ? "auto" : "500px",
            }}
          >
            <TableData />
          </Box>
          {addEmploye ? (
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
                        error={Boolean(error.nameEmploye)}
                      >
                        <TextField
                          label="Nome do Barbeiro"
                          value={nameEmploye}
                          onChange={(newValue) =>
                            setNameEmploye(newValue.target.value)
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
                        {error.nameEmploye && (
                          <FormHelperText>{error.nameEmploye}</FormHelperText>
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
                        error={Boolean(error.cpfEmploye)}
                      >
                        <TextField
                          label="CPF"
                          type="text"
                          value={cpfEmploye}
                          onChange={(newValue) => {
                            handleChangeCpf(newValue, setCpfEmploye);
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
                        {error.cpfEmploye && (
                          <FormHelperText>{error.cpfEmploye}</FormHelperText>
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
                    ></Box>
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
