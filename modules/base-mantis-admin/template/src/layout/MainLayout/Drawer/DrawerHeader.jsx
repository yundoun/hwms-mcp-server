import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Logo from 'components/Logo';
import { DRAWER_WIDTH } from 'config';

// ==============================|| DRAWER HEADER ||============================== //

export default function DrawerHeader({ open }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: open ? 'flex-start' : 'center',
        height: 60,
        px: open ? 3 : 1,
        borderBottom: '1px solid',
        borderBottomColor: 'divider'
      }}
    >
      <Logo />
      {open && (
        <Typography variant="h5" sx={{ ml: 1, fontWeight: 600 }}>
          Admin
        </Typography>
      )}
    </Box>
  );
}

DrawerHeader.propTypes = {
  open: PropTypes.bool
};
