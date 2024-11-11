import { Box, Typography } from "@mui/material";
import SideBar from "../../components/sideBar";
import LogoSchedules from "../../images/logo.png";
import { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

function DataEstablishment() {
  const [shopData, setShopData] = useState({});
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Verifica se é mobile

  useEffect(() => {
    if (!shopData && !loading) {
      setLoading(true);

      const estabelishmentId = localStorage.getItem("estabelishmentId");
      if (!estabelishmentId) {
        window.location.assign("/admin");
      }

      axios
        .get(`/establishment/${estabelishmentId}`)
        .then((response) => {
          console.log(response);
          setShopData(response.data);
          setLoading(false);
        })
        .catch((error) => console.log(error));
    }
  }, [shopData, loading]);

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
            width: isMobile ? "100%" : "80%",
            padding: isMobile ? "10px" : "80px",
            paddingTop: "80px",
            boxSizing: "border-box",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Marcellus",
              fontSize: isMobile ? "24px" : "35px",
              marginBottom: "20px",
            }}
          >
            Dados do seu estabelecimento
          </Typography>
          <img
            src={LogoSchedules}
            alt="Logo"
            className="logoEstablishment"
            style={{ maxWidth: isMobile ? "150px" : "250px" }}
          />

          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: "10px",
              marginTop: "35px",
            }}
          >
            <Typography
              sx={{ fontSize: isMobile ? "18px" : "22px", fontWeight: "bold" }}
            >
              Nome:
            </Typography>
            <Typography sx={{ fontSize: isMobile ? "18px" : "22px" }}>
              {shopData?.name}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: "10px",
              marginTop: "15px",
            }}
          >
            <Typography
              sx={{ fontSize: isMobile ? "18px" : "22px", fontWeight: "bold" }}
            >
              Endereço:
            </Typography>
            <Typography sx={{ fontSize: isMobile ? "18px" : "22px" }}>
              {shopData?.address?.public_place}, {shopData?.address?.city},
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: "10px",
              marginTop: "15px",
            }}
          >
            <Typography
              sx={{ fontSize: isMobile ? "18px" : "22px", fontWeight: "bold" }}
            >
              Telefone:
            </Typography>
            <Typography sx={{ fontSize: isMobile ? "18px" : "22px" }}>
              {shopData?.whatsapp}
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default DataEstablishment;
