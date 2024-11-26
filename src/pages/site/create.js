import {
  Box,
  Button,
  FormControl,
  Typography,
  TextField,
  FormHelperText,
  Modal,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  IconButton,
} from "@mui/material";
import imgCover from "../../images/cover.png";
import LogoAdm from "../../images/logo.png";
import "../../styles/index.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import axios from "axios";
import ScrollToTop from "../../components/ScrollToTop";
import Cookies from "js-cookie";
import config from "../../config.js";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

// const BACKEND_URL = process.env.REACT_APP_API_URL;
const BACKEND_URL = config.BACKEND_URL;
const BACKEND_PAIRING_URL = config.API_WHATSAPP;

function CreateAccount() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [salonName, setSalonName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [opening, setOpening] = useState("00:00:00");
  const [closing, setClosing] = useState("00:00:00");
  const [cep, setCep] = useState("");
  const [publicPlace, setPublicPlace] = useState("");
  const [completment, setCompletment] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [uf, setUf] = useState("");

  const [isDisabled, setIsDisabled] = useState(false);
  const [statusBindWhatsapp, setStatusBindWhatsapp] = useState("Vincular");
  const [showPassword, setShowPassword] = useState(false);
  const [open, setOpen] = useState(false);
  const [disableButtonBind, setDisableButtonBind] = useState(false);
  const [code, setCode] = useState(null);

  const [error, setError] = useState({
    email: "",
    password: "",
    salonName: "",
    whatsapp: "",
    cnpj: "",
    opening: "",
    closing: "",
    cep: "",
    publicPlace: "",
    completment: "",
    neighborhood: "",
    city: "",
    uf: "",
  });
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Verifica se a tela é mobile

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const formatCleanCep = (value) => {
    try {
      return value.replace(/[-]/g, "");
    } catch (err) {
      console.error("Error when searching for cep", err);
    }
  };

  const formatCleanPhone = (value) => {
    try {
      return value.replace(/[()-]/g, "");
    } catch (err) {
      console.error("Error when searching for cep", err);
    }
  };

  const formatCleanCnpj = (value) => {
    try {
      return value.replace(/[-./]/g, "");
    } catch (err) {
      console.error("Error when searching for cep", err);
    }
  };

  const formatNameEstablishment = (value) => {
    const nameFormatted = value.toLowerCase().replace(/[" "]/g, "_");
    return nameFormatted;
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

  const formatInputCnpj = (value) => {
    if (!value.replace(/\D/g, "")) {
      return "";
    }

    const cleaned = value.replace(/\D/g, ""); // Remove caracteres não numéricos
    const match = cleaned.match(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/);

    if (match) {
      return `${match[1]}.${match[2]}.${match[3]}/${match[4]}-${match[5]}`;
    }

    return value;
  };

  const formatInputCep = (value) => {
    if (!value.replace(/\D/g, "")) {
      return "";
    }

    const cleaned = value.replace(/\D/g, ""); // Remove caracteres não numéricos
    const match = cleaned.match(/(\d{5})(\d{3})/);

    if (match) {
      return `${match[1]}-${match[2]}`;
    }

    return value;
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

  const handleChangeOpening = (e) => {
    const input = e.target.value;
    const formattedOpening = formatInputHours(input);
    setOpening(formattedOpening);
  };

  const handleChangeClosing = (e) => {
    const input = e.target.value;
    const formattedClosing = formatInputHours(input);
    setClosing(formattedClosing);
  };

  const handleChangePhone = (e) => {
    const input = e.target.value;
    const formattedPhone = formatInputPhone(input);
    setWhatsapp(formattedPhone);
  };

  const handleChangeCnpj = (e) => {
    const input = e.target.value;
    const formattedCnpj = formatInputCnpj(input);
    setCnpj(formattedCnpj);
  };

  const handleChangeCep = (e) => {
    const input = e.target.value;
    const formattedCep = formatInputCep(input);
    setCep(formattedCep);
  };

  const handleSearchCep = async () => {
    const cleanCep = formatCleanCep(cep);
    setIsDisabled(true);

    try {
      const response = await axios.get(
        `https://viacep.com.br/ws/${cleanCep}/json/`
      );
      setPublicPlace(response.data.logradouro);
      setCompletment(response.data.complemento);
      setNeighborhood(response.data.bairro);
      setCity(response.data.localidade);
      setUf(response.data.uf);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDisabled(false);
    }
  };

  const handlePairingWhatsapp = async () => {
    try {
      setDisableButtonBind(true);
      if (statusBindWhatsapp === "Vincular") {
        const response = await axios.post(
          `${BACKEND_PAIRING_URL}/whatsapp/pairing/${formatCleanPhone(
            whatsapp
          )}`
        );
        if (response.data.code === "O número já está emparelhado.") {
          setCode("Número já vinculado!");
          setTimeout(() => {
            setCode(null);
            setStatusBindWhatsapp("Não vincular");
          }, 3000);
          setDisableButtonBind(false);
          return;
        }
        setCode(response.data.code);

        let count = 0;
        const intervalId = setInterval(async () => {
          if (count < 2) {
            const response = await axios.post(
              `${BACKEND_PAIRING_URL}/whatsapp/pairing/${formatCleanPhone(
                whatsapp
              )}`
            );
            if (response.data.code === "O número já está emparelhado.") {
              setCode("Número já vinculado!");
              setTimeout(() => {
                setCode(null);
                setStatusBindWhatsapp("Não vincular");
              }, 3000);
              setDisableButtonBind(false);
              clearInterval(intervalId);
              return;
            }
            setCode(response.data.code);
            count++;
          } else {
            setCode(null);
            setDisableButtonBind(false);
            clearInterval(intervalId);
          }
        }, 70000);
      } else if (statusBindWhatsapp === "Não vincular") {
        console.log();
      }
    } catch (err) {
      setDisableButtonBind(false);
      setCode("Erro ao gerar código");
      console.error("Error pairing number: ", err);
    }
  };

  const handleConfirmDataEstablishment = () => {
    const States = Object.freeze({
      AC: "AC", // Acre
      AL: "AL", // Alagoas
      AP: "AP", // Amapá
      AM: "AM", // Amazonas
      BA: "BA", // Bahia
      CE: "CE", // Ceará
      DF: "DF", // Distrito Federal
      ES: "ES", // Espírito Santo
      GO: "GO", // Goiás
      MA: "MA", // Maranhão
      MT: "MT", // Mato Grosso
      MS: "MS", // Mato Grosso do Sul
      MG: "MG", // Minas Gerais
      PA: "PA", // Pará
      PB: "PB", // Paraíba
      PR: "PR", // Paraná
      PE: "PE", // Pernambuco
      PI: "PI", // Piauí
      RJ: "RJ", // Rio de Janeiro
      RN: "RN", // Rio Grande do Norte
      RS: "RS", // Rio Grande do Sul
      RO: "RO", // Rondônia
      RR: "RR", // Roraima
      SC: "SC", // Santa Catarina
      SP: "SP", // São Paulo
      SE: "SE", // Sergipe
      TO: "TO", // Tocantins
    });

    setError({
      email: "",
      password: "",
      salonName: "",
      whatsapp: "",
      cnpj: "",
      opening: "",
      closing: "",
      cep: "",
      publicPlace: "",
      complement: "",
      neighborhood: "",
      city: "",
      uf: "",
    });

    var regularExpression =
      /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;

    if (!email.includes("@")) {
      setError((prev) => ({ ...prev, email: "Email inválido" }));
      return;
    }

    if (!regularExpression.test(password)) {
      setError((prev) => ({
        ...prev,
        password:
          "A senha deve ter entre 6 e 16 caracteres, incluindo pelo menos 1 letra maiúscula, 1 número e 1 caractere especial [!@#$%^&*]",
      }));
      return;
    }

    if (!salonName) {
      setError((prev) => ({
        ...prev,
        salonName: "Preencha o nome da sua barbearia",
      }));
    }

    if (whatsapp.length < 14) {
      setError((prev) => ({
        ...prev,
        whatsapp: "É obrigatório preencher Whatsapp",
      }));
      return;
    }

    if (opening === "00:00:00") {
      setError((prev) => ({
        ...prev,
        opening: "Preencha o horario da sua abertura",
      }));
      return;
    }

    if (closing === "00:00:00") {
      setError((prev) => ({
        ...prev,
        closing: "Preencha o horario do seu fechamento",
      }));
      return;
    }

    if (cep.length < 9) {
      setError((prev) => ({ ...prev, cep: "Preencha o CEP corretamente" }));
      return;
    }

    if (neighborhood === "") {
      setError((prev) => ({ ...prev, neighborhood: "Preencha o Bairro" }));
      return;
    }

    if (city === "") {
      setError((prev) => ({ ...prev, city: "Preencha a Cidade" }));
      return;
    }

    if (!Object.values(States).includes(uf)) {
      setError((prev) => ({ ...prev, uf: "Preencha um Estado existente" }));
      return;
    }

    setOpen(true);
  };

  const handleRegisterEstablishment = async () => {
    setIsDisabled(true);
    setOpen(false);

    try {
      const response = await axios.post(`${BACKEND_URL}/auth/register`, {
        email,
        password,
        name: formatNameEstablishment(salonName),
        whatsapp: formatCleanPhone(whatsapp),
        cnpj: formatCleanCnpj(cnpj),
        opening,
        closing,
        cep: formatCleanCep(cep),
        public_place: publicPlace,
        complement: completment || "",
        neighborhood,
        city,
        uf,
      });
      const { token, name_establishment } = response.data;
      const experationTime = new Date();
      experationTime.setHours(experationTime.getHours + 23);
      Cookies.set("token", `${token}`, { expires: experationTime, path: "/" });
      navigate(`/${name_establishment}/admin/schedules`);
    } catch (err) {
      if (
        err.status === 422 &&
        err.response.data ===
          "The name of the establishment already exists in the database metadata."
      ) {
        setError((prev) => ({ ...prev, salonName: "Nome já existente" }));
        return;
      }
      console.error(err);
    } finally {
      setIsDisabled(false);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          backgroundImage: `url(${imgCover})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "30vh",
          backgroundSize: "cover",
        }}
      >
        <img
          src={LogoAdm}
          alt="Logo"
          className="logoAdmin"
          style={{
            maxWidth: "250px",
            borderRadius: "50%",
            height: isMobile ? "100px" : "150px",
            width: isMobile ? "150px" : "200px",
          }}
        />
      </Box>

      <Box
        sx={{
          backgroundColor: "#FFFAF0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: isMobile ? "100vh" : "85vh",
          padding: isMobile ? "20px" : "0",
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "white",
            width: isMobile ? "90%" : "auto",
            border: "1px solid black",
            marginTop: "30px",
            marginBottom: "30px",
            paddingLeft: isMobile ? "0" : "60px",
            paddingRight: isMobile ? "0" : "60px",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: isMobile ? "24px" : "35px",
                marginTop: "40px",
                marginBottom: "30px",
              }}
            >
              Criar conta
            </Typography>
          </Box>

          {error.password && (
            <FormHelperText
              sx={{ color: "#D7392F", textAlign: "center", fontSize: "0.9em" }}
            >
              {error.password}
            </FormHelperText>
          )}

          <Box
            sx={{
              display: isMobile ? "block" : "flex",
              gap: "100px",
            }}
          >
            <Box
              sx={{
                padding: "10px",
              }}
            >
              {/* Campo Email */}
              <Box sx={{ marginTop: "20px" }}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  error={Boolean(error.email)}
                >
                  <TextField
                    label="Email"
                    type="text"
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    inputProps={{ maxLength: 50 }}
                    disabled={isDisabled}
                  />
                  {error.email && (
                    <FormHelperText>{error.email}</FormHelperText>
                  )}
                </FormControl>
              </Box>

              {/* Campo Senha */}
              <Box sx={{ marginTop: "20px" }}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  error={Boolean(error.password)}
                >
                  <TextField
                    label="Senha"
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    inputProps={{ maxLength: 50 }}
                    disabled={isDisabled}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={
                              showPassword
                                ? "hide the password"
                                : "display the password"
                            }
                            onClick={handleClickShowPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>
              </Box>

              {/* Campo Nome do Salão */}
              <Box sx={{ marginTop: "20px" }}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  error={Boolean(error.salonName)}
                >
                  <TextField
                    label="Nome do Salão"
                    type="text"
                    variant="outlined"
                    value={salonName}
                    onChange={(e) => setSalonName(e.target.value)}
                    disabled={isDisabled}
                  />
                  {error.salonName && (
                    <FormHelperText>{error.salonName}</FormHelperText>
                  )}
                </FormControl>
              </Box>

              {/* Campo Whatsapp */}
              <Box sx={{ marginTop: "20px" }}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  error={Boolean(error.whatsapp)}
                >
                  <TextField
                    label="Whatsapp"
                    type="text"
                    variant="outlined"
                    value={whatsapp}
                    onChange={handleChangePhone}
                    helperText="Recomendado não utilizar número pessoal!"
                    disabled={isDisabled}
                  />
                  {error.whatsapp && (
                    <FormHelperText>{error.whatsapp}</FormHelperText>
                  )}
                </FormControl>
              </Box>

              {/* Campo CNPJ */}
              <Box sx={{ marginTop: "20px" }}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  error={Boolean(error.cnpj)}
                >
                  <TextField
                    label="CNPJ"
                    type="text"
                    variant="outlined"
                    value={cnpj}
                    onChange={handleChangeCnpj}
                    disabled={isDisabled}
                  />
                  {error.cnpj && <FormHelperText>{error.cnpj}</FormHelperText>}
                </FormControl>
              </Box>

              {/* Campo Abertura */}
              <Box sx={{ marginTop: "20px" }}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  error={Boolean(error.opening)}
                >
                  <TextField
                    label="Abertura"
                    type="text"
                    variant="outlined"
                    value={opening}
                    onChange={handleChangeOpening}
                    disabled={isDisabled}
                  />
                  {error.opening && (
                    <FormHelperText>{error.opening}</FormHelperText>
                  )}
                </FormControl>
              </Box>

              {/* Campo Fechamento */}
              <Box sx={{ marginTop: "20px" }}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  error={Boolean(error.closing)}
                >
                  <TextField
                    label="Fechamento"
                    type="text"
                    variant="outlined"
                    value={closing}
                    onChange={handleChangeClosing}
                    disabled={isDisabled}
                  />
                  {error.closing && (
                    <FormHelperText>{error.closing}</FormHelperText>
                  )}
                </FormControl>
              </Box>
            </Box>

            <Box
              sx={{
                borderTop: isMobile ? "1px solid black" : "",
                marginTop: isMobile ? "20px" : "",
                padding: "10px",
              }}
            >
              {/* Campo CEP */}
              <Box sx={{ marginTop: "20px" }}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  error={Boolean(error.cep)}
                >
                  <TextField
                    label="Cep"
                    type="text"
                    variant="outlined"
                    value={cep}
                    onChange={handleChangeCep}
                    onBlur={handleSearchCep}
                    disabled={isDisabled}
                  />
                  {error.cep && <FormHelperText>{error.cep}</FormHelperText>}
                </FormControl>
              </Box>

              {/* Campo Endereço */}
              <Box sx={{ marginTop: "20px" }}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  error={Boolean(error.publicPlace)}
                >
                  <TextField
                    label="Endereço"
                    type="text"
                    variant="outlined"
                    value={publicPlace}
                    onChange={(e) => setPublicPlace(e.target.value)}
                    inputProps={{ maxLength: 50 }}
                    disabled={isDisabled}
                  />
                  {error.publicPlace && (
                    <FormHelperText>{error.publicPlace}</FormHelperText>
                  )}
                </FormControl>
              </Box>

              {/* Campo Complemento */}
              <Box sx={{ marginTop: "20px" }}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  error={Boolean(error.completment)}
                >
                  <TextField
                    label="Complemento"
                    type="text"
                    variant="outlined"
                    value={completment}
                    onChange={(e) => setCompletment(e.target.value)}
                    inputProps={{ maxLength: 50 }}
                    disabled={isDisabled}
                  />
                  {error.completment && (
                    <FormHelperText>{error.completment}</FormHelperText>
                  )}
                </FormControl>
              </Box>

              {/* Campo Bairro */}
              <Box sx={{ marginTop: "20px" }}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  error={Boolean(error.neighborhood)}
                >
                  <TextField
                    label="Bairro"
                    type="text"
                    variant="outlined"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    inputProps={{ maxLength: 50 }}
                    disabled={isDisabled}
                  />
                  {error.neighborhood && (
                    <FormHelperText>{error.neighborhood}</FormHelperText>
                  )}
                </FormControl>
              </Box>

              {/* Campo Cidade */}
              <Box sx={{ marginTop: "20px" }}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  error={Boolean(error.city)}
                >
                  <TextField
                    label="Cidade"
                    type="text"
                    variant="outlined"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    inputProps={{ maxLength: 50 }}
                    disabled={isDisabled}
                  />
                  {error.city && <FormHelperText>{error.city}</FormHelperText>}
                </FormControl>
              </Box>

              {/* Campo UF */}
              <Box sx={{ marginTop: "20px" }}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  error={Boolean(error.uf)}
                >
                  <TextField
                    label="UF"
                    type="text"
                    variant="outlined"
                    value={uf}
                    onChange={(e) => setUf(e.target.value)}
                    inputProps={{ maxLength: 2 }}
                    disabled={isDisabled}
                  />
                  {error.uf && <FormHelperText>{error.uf}</FormHelperText>}
                </FormControl>
              </Box>
            </Box>
          </Box>

          <Box sx={{ marginBottom: "30px", marginTop: "30px" }}>
            <Button
              onClick={handleConfirmDataEstablishment}
              variant="contained"
              sx={{
                width: isMobile ? "100%" : "250px",
                height: "40px",
                backgroundColor: "#35312D",
                fontWeight: "bold",
                borderRadius: "27px",
              }}
              disabled={isDisabled}
            >
              Cadastrar
            </Button>
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
                width: isMobile ? "80%" : "800px",
                padding: isMobile ? "20px" : "40px",
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                alignItems: "center",
                borderRadius: "5px",
                maxHeight: "95vh", // Define uma altura máxima em relação à altura da viewport
                overflowY: "auto", // Adiciona rolagem vertical se o conteúdo exceder a altura
              }}
            >
              <Typography
                sx={{
                  marginBottom: isMobile ? "0" : "30px",
                  textAlign: "center",
                  lineHeight: isMobile ? "1" : "1.5",
                }}
              >
                Nosso sistema permite integrar o Whatsapp com facilidade: você
                vincula o número desejado e, a partir disso, um bot é criado
                para ajudar a gerenciar agendamentos. Assim, seus clientes podem
                marcar horários direto pelo WhatsApp de forma prática e rápida,
                melhorando a experiência de atendimento.
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    marginTop: "20px",
                    marginBottom: isMobile ? "0" : "20px",
                  }}
                >
                  <FormControl
                    fullWidth
                    variant="outlined"
                    error={Boolean(error.whatsapp)}
                  >
                    <TextField
                      label="Whatsapp"
                      type="text"
                      variant="outlined"
                      value={whatsapp}
                      onChange={handleChangePhone}
                      disabled={isDisabled}
                    />
                    {error.whatsapp && (
                      <FormHelperText>{error.whatsapp}</FormHelperText>
                    )}
                  </FormControl>
                </Box>
                <Box>
                  <FormControl id="demo-controlled-radio-buttons-group">
                    <RadioGroup
                      aria-labelledby="demo-controlled-radio-buttons-group"
                      name="controlled-radio-buttons-group"
                      value={statusBindWhatsapp}
                      onChange={(newValue) => {
                        setStatusBindWhatsapp(newValue.target.value);
                      }}
                    >
                      <Box>
                        <FormControlLabel
                          value="Vincular"
                          control={<Radio />}
                          label="Vincular"
                        />
                        <FormControlLabel
                          value="Não vincular"
                          control={<Radio />}
                          label="Não vincular"
                        />
                      </Box>
                    </RadioGroup>
                  </FormControl>
                </Box>
                {statusBindWhatsapp === "Vincular" ? (
                  <Button
                    onClick={handlePairingWhatsapp}
                    variant="contained"
                    sx={{
                      width: isMobile ? "100%" : "120px",
                      height: "30px",
                      backgroundColor: "#35312D",
                      fontWeight: "bold",
                      borderRadius: "27px",
                      marginBottom: "20px",
                    }}
                    disabled={disableButtonBind}
                  >
                    Enviar
                  </Button>
                ) : (
                  <></>
                )}
              </Box>
              <Typography
                sx={{
                  fontSize: "0.8em",
                  fontWeight: "bold",
                  marginBottom: isMobile ? "0" : "20px",
                  textAlign: "center",
                }}
              >
                Recomendamos não utilizar um número pessoal para essa integração
                com o Whatsapp. Caso opte por usar, lembre-se que é de total
                responsabilidade sua, podendo inclusive haver risco de bloqueio
                do Whatsapp vinculado. Obs: Caso queira realizar o vinculo, não
                passe o código que irá receber para NINGUEM!
              </Typography>
              {statusBindWhatsapp === "Vincular" ? (
                <Typography
                  sx={{
                    textAlign: "center",
                  }}
                >
                  Você recebera 3 códigos e terá 4 minutos para vincular um
                  deles, coloque-o no whatsapp assim que receber uma notificação
                  e somente após realizar o vinculo aperte o botão 'Finalizar
                  cadastro': <strong>{code}</strong>
                </Typography>
              ) : (
                <></>
              )}
              <Button
                onClick={handleRegisterEstablishment}
                variant="contained"
                sx={{
                  width: isMobile ? "100%" : "250px",
                  height: "40px",
                  backgroundColor: "#35312D",
                  fontWeight: "bold",
                  borderRadius: "27px",
                  marginTop: "20px",
                }}
                disabled={
                  (statusBindWhatsapp === "Vincular" && code === null) ||
                  code === "Número já vinculado!" ||
                  whatsapp.length < 14
                    ? true
                    : false
                }
              >
                Finalizar cadastro
              </Button>
            </Box>
          </Modal>
        </Box>
        <ScrollToTop />
      </Box>
    </Box>
  );
}

export default CreateAccount;
