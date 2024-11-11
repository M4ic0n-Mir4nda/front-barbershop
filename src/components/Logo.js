import { Box } from '@mui/material';
import Logo from '../images/logo.png'

function LogoImage(props) {
  return(
    <>
      <Box>
          <img src={props.src ? props.src : Logo} alt="Logo" style={{width: 150, height: 100, borderRadius: '50%', padding: 5, marginTop: props.marginTop ? props.marginTop : ""}}/>
      </Box>
    </>
  );
}

export default LogoImage;