import { Box, Typography } from "@mui/material";
import SideBar from "../../components/sideBar";
import { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useParams } from "react-router-dom";

const BACKEND_URL = "http://localhost:8080";

function EmployeeRegistration() {
  const [shopData, setShopData] = useState([]);
  const [loading, setLoading] = useState(false);

  const { currentName } = useParams();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Verifica se é mobile

  useEffect(() => {
    if (shopData && !loading) {
      setLoading(true);

      // const estabelishmentId = localStorage.get("estabelishmentId");
      // if (!estabelishmentId) {
      //   window.location.assign("/admin");
      // }
      axios
        .get(`${BACKEND_URL}/employe/${currentName}/employes`)
        .then((response) => {
          setShopData(response.data);
          setLoading(false);
        });
    }
  }, []);

  console.log(shopData);

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
          <Typography sx={{ fontSize: "36px", fontFamily: "Marcellus" }}>
            Barbeiros cadastrados
          </Typography>
          {shopData?.length ? (
            shopData?.map((employee) => {
              return (
                <Box
                  key={employee.id}
                  sx={{
                    width: "715px",
                    borderBottom: "1px solid black",
                    marginTop: "50px",
                  }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography sx={{ fontSize: "22px", fontWeight: "bold" }}>
                      {employee.name}
                    </Typography>
                    <Typography sx={{ fontSize: "22px" }}>
                      {employee.whatsapp}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          ) : (
            <Typography
              sx={{ fontSize: "20px", marginTop: "40px", fontWeight: "bold" }}
            >
              Não há barbeiros cadastrados...
            </Typography>
          )}
          <Typography sx={{ fontSize: "22px", marginTop: "70px" }}>
            Entre em contato com o suporte para cadastrar ou editar
          </Typography>
        </Box>
      </Box>
    </>
  );
}

export default EmployeeRegistration;
