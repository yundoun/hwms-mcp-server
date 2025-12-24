import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';

import NavGroup from './NavGroup';
import menuItems from 'menu-items';
import { useMenu } from 'contexts/MenuContext';

// ==============================|| NAVIGATION ||============================== //

export default function Navigation() {
  const { drawerOpen } = useMenu();

  const navGroups = menuItems.items.map((item) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={item.id} item={item} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Navigation Group
          </Typography>
        );
    }
  });

  return (
    <Box sx={{ pt: 2, px: drawerOpen ? 2 : 1 }}>
      <List sx={{ p: 0 }}>{navGroups}</List>
    </Box>
  );
}
