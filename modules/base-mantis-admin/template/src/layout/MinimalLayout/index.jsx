import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import ScrollTop from 'components/ScrollTop';

// ==============================|| MINIMAL LAYOUT ||============================== //

export default function MinimalLayout() {
  return (
    <ScrollTop>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default'
        }}
      >
        <Outlet />
      </Box>
    </ScrollTop>
  );
}
