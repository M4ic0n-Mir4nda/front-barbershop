import { Box, Typography, IconButton, Drawer, List, ListItem, ListItemText, useMediaQuery, useTheme } from "@mui/material";
import { Menu as MenuIcon } from '@mui/icons-material';
import { useState } from "react";
import LogoSchedules from '../images/logo.png';
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";

function SideBar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Consider 'md' as mobile breakpoint
  const [open, setOpen] = useState(false);

  const { currentName } = useParams();

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  const menuItems = [
    { text: 'Agendamentos', path: `/${currentName}/admin/schedules` },
    { text: 'Relatório', path: `/${currentName}/admin/report`},
    { text: 'Site', path: `/site/${currentName}`},
    // { text: 'Serviços', path: '/admin/services' },
    // { text: 'Barbeiros', path: '/admin/barbers' },
    // { text: 'Dados', path: '/admin/data' },
    // { text: 'Fale com o suporte', path: '/admin/support' }
  ];

  return (
    <>
      {isMobile ? (
        <Box sx={{backgroundColor: 'black', height: '70px', display: 'flex', alignItems: 'center'}}>
          <IconButton
            edge="start"
            color="default"
            aria-label="menu"
            onClick={handleDrawerOpen}
          >
            <MenuIcon style={{ color: 'white', marginLeft: '20px' }}/>
          </IconButton>
          <Drawer
            anchor="left"
            open={open}
            onClose={handleDrawerClose}
          >
            <Box
              sx={{
                width: 250,
                backgroundColor: 'black',
                color: 'white',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: '20px'
              }}
            >
              <img src={LogoSchedules} alt="Logo" style={{ width: '150px', marginBottom: '20px' }} />
              <List>
                {menuItems.map((item) => (
                  <ListItem button component={Link} to={item.path} key={item.text}>
                    <ListItemText primary={item.text} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Drawer>
        </Box>
      ) : (
        <Box sx={{ width: '20%', backgroundColor: 'black', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px'}}>
          <img src={LogoSchedules} alt="Logo" className="logoSchedules" style={{ width: '150px', marginBottom: '20px' }} />
          <Box>
            {menuItems.map((item) => (
              <Link to={item.path} key={item.text} style={{ textDecoration: 'none', color: 'white' }}>
                <Typography sx={{ fontSize: '21px', marginBottom: '22px' }}>{item.text}</Typography>
              </Link>
            ))}
          </Box>
        </Box>
      )}
    </>
  );
}

export default SideBar;
