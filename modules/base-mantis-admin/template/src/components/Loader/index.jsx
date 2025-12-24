import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

// ==============================|| LOADER ||============================== //

export default function Loader() {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 2001,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default'
      }}
    >
      <CircularProgress color="primary" />
    </Box>
  );
}
