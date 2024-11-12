import { Box, Typography } from "@mui/material";
import imgCover from "../images/cover.png";
import LogoAdm from "../images/logo.png";
import "../styles/index.css";

function Home() {
  return (
    <>
      <Box
        sx={{
          backgroundImage: `url(${imgCover})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "30vh",
        }}
      >
        <img src={LogoAdm} alt="Logo" className="logoAdmin" />
      </Box>

      <Box
        sx={{
          backgroundColor: "#FFFAF0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          height: "70vh",
        }}
      >
        <Typography
          sx={{ fontSize: "35px", marginTop: "50px", marginBottom: "30px" }}
        >
          Leve sua barbearia para o próximo nível!!
        </Typography>
      </Box>
    </>
  );
}

export default Home;
