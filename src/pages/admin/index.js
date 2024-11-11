import {
  Box,
  Button,
  FormControl,
  Typography,
  TextField,
  FormHelperText,
  Link,
} from "@mui/material";
import imgCover from "../../images/cover.png";
import LogoAdm from "../../images/logo.png";
import "../../styles/index.css";
import { useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Cookies from "js-cookie";
import ScrollToTop from "../../components/ScrollToTop";

// Continuar com a parte de segurança / Login
const BACKEND_URL = process.env.REACT_APP_API_URL;

function Login() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [responseError, setResponseError] = useState(false);
  const [message, setMessage] = useState("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Verifica se a tela é mobile

  const [error, setError] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isDisabled, setIsDisabled] = useState(false);

  const handleLogin = async () => {
    setResponseError(false);
    setError({
      name: "",
      email: "",
      password: "",
    });

    if (name === "") {
      setError((prev) => ({
        ...prev,
        name: "O nome precisa ser preenchido!",
      }));
      return;
    }

    if (!email.includes("@")) {
      setError((prev) => ({ ...prev, email: "Email inválido" }));
      return;
    }

    if (password === "") {
      setError((prev) => ({
        ...prev,
        password: "A senha precisa ser preenchida!",
      }));
      return;
    }

    try {
      setIsDisabled(true);
      const response = await axios.post(`${BACKEND_URL}/auth/login`, {
        name_establishment: name,
        email,
        password,
      });
      const { token, name_establishment } = response.data;
      Cookies.set("token", `${token}`);

      window.location.assign(`${name_establishment}/admin/schedules`);
    } catch (err) {
      console.log(err);
      if (err.code === "ERR_NETWORK") {
        setResponseError(true);
        setMessage("Erro de conexão!");
      } else if (
        err.response.data === "Resource not found." &&
        err.response.status === 404
      ) {
        setError((prev) => ({
          ...prev,
          name: "Salão não encontrado!",
        }));
      } else if (err.response.status === 400) {
        setResponseError(true);
        setMessage("Email ou Senha incorreto");
      }
      console.error("Login failed", err);
    } finally {
      setIsDisabled(false);
    }
  };

  return (
    <>
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
          flexDirection: "column",
          height: "70vh",
          padding: isMobile ? "20px" : "0",
          boxSizing: "border-box",
        }}
      >
        <Typography
          sx={{
            fontSize: isMobile ? "24px" : "35px",
            marginTop: "40px",
            marginBottom: "30px",
          }}
        >
          Olá, acesse seu painel
        </Typography>

        <FormControl variant="outlined" error={Boolean(error.name)}>
          <TextField
            onChange={(newValue) => setName(newValue.target.value)}
            label="Nome do Salão"
            variant="outlined"
            sx={{
              width: isMobile ? "100%" : "670px",
              height: "67px",
            }}
            disabled={isDisabled}
          />
          {error.name && <FormHelperText>{error.name}</FormHelperText>}
        </FormControl>

        <FormControl variant="outlined" error={Boolean(error.email)}>
          <TextField
            onChange={(newValue) => setEmail(newValue.target.value)}
            label="Email"
            variant="outlined"
            sx={{
              width: isMobile ? "100%" : "670px",
              height: "67px",
              marginTop: "20px",
            }}
            disabled={isDisabled}
          />
          {error.email && <FormHelperText>{error.email}</FormHelperText>}
        </FormControl>

        <FormControl variant="outlined" error={Boolean(error.password)}>
          <TextField
            onChange={(newValue) => setPassword(newValue.target.value)}
            label="Senha"
            type="password"
            variant="outlined"
            sx={{
              width: isMobile ? "100%" : "670px",
              height: "67px",
              marginTop: "20px",
            }}
            disabled={isDisabled}
          />
          {error.password && <FormHelperText>{error.password}</FormHelperText>}
        </FormControl>

        {responseError ? (
          <>
            <FormHelperText
              sx={{ fontSize: "1.1em", color: "#D7392F", textAlign: "center" }}
            >
              {message}
            </FormHelperText>
          </>
        ) : (
          <></>
        )}

        <Button
          onClick={handleLogin}
          variant="contained"
          sx={{
            width: isMobile ? "100%" : "250px",
            height: "40px",
            backgroundColor: "#35312D",
            fontWeight: "bold",
            borderRadius: "27px",
            marginTop: "30px",
          }}
          disabled={isDisabled}
        >
          Acessar
        </Button>

        <Typography
          sx={{
            marginTop: "40px",
            fontSize: "1.1em",
          }}
        >
          Não possui uma conta?{" "}
          <Link
            href={`/create/account`}
            variant="body2"
            sx={{ fontSize: "0.9em" }}
          >
            {"Crie sua conta"}
          </Link>
        </Typography>
      </Box>
      <ScrollToTop />
    </>
  );
}

export default Login;
