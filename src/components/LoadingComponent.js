import { CircularProgress } from "@mui/material";

function LoadingComponent() {
    return (
        <CircularProgress
        size={80}
        thickness={4}
        sx={{
          color: '#333',
          marginBottom: '20px',
          animationDuration: '550ms',
        }}
      />
    )
}

export default LoadingComponent;