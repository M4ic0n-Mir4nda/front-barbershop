import { Typography, Box, CircularProgress } from "@mui/material";

const Loading = (props) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5', // Cor de fundo suave
        textAlign: 'center',
      }}
    >
      <CircularProgress
        size={80}
        thickness={4}
        sx={{
          color: '#333',
          marginBottom: '20px',
          animationDuration: '550ms',
        }}
      />
      <Typography variant="h5" sx={{ color: '#333', marginBottom: '10px' }}>
        {props.title}
      </Typography>
      <Typography variant="body1" sx={{ color: '#666' }}>
        {props.message}
      </Typography>
    </Box>
  );
};
export default Loading;
