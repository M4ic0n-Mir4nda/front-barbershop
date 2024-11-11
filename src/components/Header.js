import { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { Link as ScrollLink } from "react-scroll"; // para rolar até a seção correta
import LogoImage from "./Logo";

const Header = ({ isMobile, shopData }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <Box sx={{ width: "100%", backgroundColor: "#35312D" }}>
      <AppBar
        position="static"
        sx={{ backgroundColor: "#35312D", boxShadow: "none" }}
      >
        <Toolbar
          sx={{
            alignItems: "center",
            display: isMobile ? "flex" : "",
            justifyContent: isMobile ? "space-between" : "right",
          }}
          style={{ paddingLeft: "0" }}
        >
          {isMobile ? <></> : <LogoImage src={shopData?.logoUrl} />}
          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={toggleDrawer}
              >
                <MenuIcon />
              </IconButton>
              <Drawer anchor="left" open={isDrawerOpen} onClose={toggleDrawer}>
                <Box
                  sx={{
                    width: 250,
                    backgroundColor: "#35312D",
                    height: "100%",
                    color: "white",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <IconButton
                    onClick={toggleDrawer}
                    sx={{
                      color: "white",
                      justifyContent: "right",
                      marginRight: "10px",
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                  <List>
                    <ListItem button>
                      <ScrollLink
                        to="services"
                        smooth={true}
                        duration={500}
                        onClick={toggleDrawer}
                      >
                        <ListItemText primary="SERVIÇOS" />
                      </ScrollLink>
                    </ListItem>
                    <ListItem button>
                      <ScrollLink
                        to="barbers"
                        smooth={true}
                        duration={500}
                        onClick={toggleDrawer}
                      >
                        <ListItemText primary="BARBEIROS" />
                      </ScrollLink>
                    </ListItem>
                    <ListItem button>
                      <ScrollLink
                        to="location"
                        smooth={true}
                        duration={500}
                        onClick={toggleDrawer}
                      >
                        <ListItemText primary="LOCALIZAÇÃO" />
                      </ScrollLink>
                    </ListItem>
                    <ListItem button>
                      <ScrollLink
                        to="contact"
                        smooth={true}
                        duration={500}
                        onClick={toggleDrawer}
                      >
                        <ListItemText primary="CONTATO" />
                      </ScrollLink>
                    </ListItem>
                  </List>
                </Box>
              </Drawer>
            </>
          ) : (
            <Box
              sx={{
                color: "white",
                display: "flex",
                gap: "35px",
                margin: "0 auto",
              }}
            >
              <ScrollLink to="services" smooth={true} duration={500}>
                <Typography sx={{ fontWeight: "bolder", cursor: "pointer" }}>
                  SERVIÇOS
                </Typography>
              </ScrollLink>
              <ScrollLink to="barbers" smooth={true} duration={500}>
                <Typography sx={{ fontWeight: "bolder", cursor: "pointer" }}>
                  BARBEIROS
                </Typography>
              </ScrollLink>
              <ScrollLink to="location" smooth={true} duration={500}>
                <Typography sx={{ fontWeight: "bolder", cursor: "pointer" }}>
                  LOCALIZAÇÃO
                </Typography>
              </ScrollLink>
              <ScrollLink to="contact" smooth={true} duration={500}>
                <Typography sx={{ fontWeight: "bolder", cursor: "pointer" }}>
                  CONTATO
                </Typography>
              </ScrollLink>
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Header;
