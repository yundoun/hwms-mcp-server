import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import useMediaQuery from '@mui/material/useMediaQuery';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';

import Header from './Header';
import Drawer from './Drawer';
import Footer from './Footer';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import ScrollTop from 'components/ScrollTop';

import { DRAWER_WIDTH } from 'config';
import useConfig from 'hooks/useConfig';
import { useMenu, MenuProvider } from 'contexts/MenuContext';

// ==============================|| MAIN LAYOUT CONTENT ||============================== //

function MainLayoutContent() {
  const { drawerOpen, setDrawerOpen } = useMenu();
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const { state } = useConfig();

  useEffect(() => {
    setDrawerOpen(!downLG);
  }, [downLG, setDrawerOpen]);

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <Header />
      <Drawer />

      <Box
        component="main"
        sx={{
          width: { xs: '100%', lg: `calc(100% - ${drawerOpen ? DRAWER_WIDTH : 60}px)` },
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          transition: 'width 0.3s'
        }}
      >
        <Toolbar />
        <Container
          maxWidth={state.container ? 'xl' : false}
          sx={{
            ...(state.container && { px: { xs: 0, sm: 2 } }),
            position: 'relative',
            minHeight: 'calc(100vh - 110px)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Breadcrumbs />
          <Outlet />
          <Footer />
        </Container>
      </Box>
    </Box>
  );
}

// ==============================|| MAIN LAYOUT ||============================== //

export default function MainLayout() {
  return (
    <MenuProvider>
      <ScrollTop>
        <MainLayoutContent />
      </ScrollTop>
    </MenuProvider>
  );
}
