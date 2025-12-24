import Box from '@mui/material/Box';
import SimpleBar from 'simplebar-react';

import Navigation from './Navigation';

// ==============================|| DRAWER CONTENT ||============================== //

export default function DrawerContent() {
  return (
    <Box sx={{ height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>
      <SimpleBar style={{ height: '100%', overflowX: 'hidden' }}>
        <Navigation />
      </SimpleBar>
    </Box>
  );
}
