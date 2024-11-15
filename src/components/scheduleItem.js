import {
  Box,
  Typography,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";

function ScheduleItem({ schedule }) {
  const maxServices = 3;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Consider 'md' as mobile breakpoint

  const sumPrice = (listSchedules) => {
    let sum = 0;
    listSchedules.activities.map((schedule) => {
      sum += schedule.price;
    });
    return parseFloat(sum).toFixed(2).replace(".", ",");
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

  const formatDateInput = (dateScheduling) => {
    let newDate = new Date(dateScheduling);
    let dateSchedulingFormat = newDate
      .toLocaleDateString("pt-BR")
      .split("-")
      .reverse()
      .join("/");
    let dateFullSplit = dateScheduling.split("T");
    let time = dateFullSplit[1];

    return `${dateSchedulingFormat} ${time}`;
  };

  return (
    <>
      <Box
        sx={{
          width: isMobile ? "90%" : "100%",
          margin: isMobile ? "0 auto" : "0",
          display: isMobile ? "block" : "flex",
          borderBottom: "1px solid black",
          border: isMobile ? "1px solid black" : "1px 0px 0px 0px solid black",
          paddingBottom: isMobile ? "0" : "15px",
          marginTop: "30px",
          justifyContent: "center",
          alignItems: "center",
          gap: "30px",
        }}
      >
        <Box
          sx={{
            backgroundColor: "black",
            width: isMobile ? "100%" : "117px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: isMobile ? "42px" : "0",
            padding: isMobile ? "0px" : "10px",
            borderRadius: isMobile ? "0" : "5%",
          }}
        >
          <Typography sx={{ color: "white", fontSize: "22px" }}>
            {formatDateInput(schedule?.date_scheduling)}
          </Typography>
        </Box>
        <Box
          sx={{
            width: "50%",
            paddingRight: "20px",
            margin: "20px 0 20px 10px",
          }}
        >
          <Box
            sx={{
              width: isMobile ? "auto" : "100%",
            }}
          >
            <Typography sx={{ fontSize: "22px", fontWeight: "bold" }}>
              {schedule?.customer.name}
            </Typography>
            <Typography sx={{ fontSize: "22px" }}>
              {formatInputPhone(schedule?.customer.whatsapp)}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            width: "50%",
            paddingRight: "20px",
            margin: "20px 0 20px 10px",
          }}
        >
          <Typography sx={{ fontSize: "22px", fontWeight: "bold" }}>
            {schedule?.employe.name}
          </Typography>
        </Box>
        <Box
          sx={{
            display: isMobile ? "block" : "flex",
            width: isMobile ? "90%" : "100%",
            paddingRight: "20px",
            margin: "20px 0 20px 10px",
          }}
        >
          <Box
            sx={{
              width: "100%",
            }}
          >
            {schedule?.activities.length ? (
              <Typography sx={{ fontSize: "22px" }}>
                {
                  schedule.activities
                    .slice(0, maxServices)
                    .map((service) => service.name_service)
                    .join(", ") // Adiciona a vírgula entre os elementos
                }

                {schedule.activities.length > maxServices && (
                  <Tooltip
                    title={
                      schedule.activities
                        .slice(maxServices)
                        .map((service) => service.name_service)
                        .join(", ") // Lista os serviços adicionais dentro do tooltip
                    }
                    arrow
                  >
                    <span style={{ cursor: "pointer" }}>...</span>
                  </Tooltip>
                )}
              </Typography>
            ) : (
              <Typography>Não há nenhum agendamento para hoje...</Typography>
            )}
          </Box>
          <Box
            sx={{
              fontSize: "22px",
              display: "flex",
              alignItems: "center",
              justifyContent: isMobile ? "flex-start" : "flex-end",
              width: "100%",
            }}
          >
            <Typography sx={{ fontSize: "22px", fontWeight: "bold" }}>
              R$ {sumPrice(schedule)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default ScheduleItem;
