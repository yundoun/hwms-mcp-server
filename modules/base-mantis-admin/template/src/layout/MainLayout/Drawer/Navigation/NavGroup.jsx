import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';

import NavItem from './NavItem';
import NavCollapse from './NavCollapse';
import { useMenu } from 'contexts/MenuContext';

// ==============================|| NAVIGATION GROUP ||============================== //

export default function NavGroup({ item }) {
  const { drawerOpen } = useMenu();

  const navCollapse = item.children?.map((menuItem) => {
    switch (menuItem.type) {
      case 'collapse':
        return <NavCollapse key={menuItem.id} menu={menuItem} level={1} />;
      case 'item':
        return <NavItem key={menuItem.id} item={menuItem} level={1} />;
      default:
        return (
          <Typography key={menuItem.id} variant="h6" color="error" align="center">
            Fix - Menu Items
          </Typography>
        );
    }
  });

  return (
    <Box sx={{ mb: 2 }}>
      {drawerOpen && item.title && (
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'text.secondary',
            textTransform: 'uppercase',
            px: 2,
            mb: 1,
            display: 'block'
          }}
        >
          {item.title}
        </Typography>
      )}
      <List sx={{ p: 0 }}>{navCollapse}</List>
    </Box>
  );
}

NavGroup.propTypes = {
  item: PropTypes.object.isRequired
};
