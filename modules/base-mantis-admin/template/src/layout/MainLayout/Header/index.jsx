import { useMemo } from 'react';

import useMediaQuery from '@mui/material/useMediaQuery';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';

import HeaderContent from './HeaderContent';
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from 'config';
import { useMenu } from 'contexts/MenuContext';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';

// ==============================|| MAIN LAYOUT - HEADER ||============================== //

export default function Header() {
  const { drawerOpen, toggleDrawer } = useMenu();
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const headerContent = useMemo(() => <HeaderContent />, []);

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: '1px solid',
        borderBottomColor: 'divider',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        width: {
          xs: '100%',
          lg: drawerOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : `calc(100% - ${MINI_DRAWER_WIDTH}px)`
        },
        ml: {
          xs: 0,
          lg: drawerOpen ? `${DRAWER_WIDTH}px` : `${MINI_DRAWER_WIDTH}px`
        },
        transition: 'width 0.3s, margin-left 0.3s'
      }}
    >
      <Toolbar>
        <IconButton
          aria-label="toggle drawer"
          onClick={toggleDrawer}
          edge="start"
          sx={{
            color: 'text.primary',
            bgcolor: drawerOpen ? 'transparent' : 'grey.100',
            mr: 2
          }}
        >
          {drawerOpen ? <MenuOpenIcon /> : <MenuIcon />}
        </IconButton>
        <Box sx={{ flexGrow: 1 }} />
        {headerContent}
      </Toolbar>
    </AppBar>
  );
}
