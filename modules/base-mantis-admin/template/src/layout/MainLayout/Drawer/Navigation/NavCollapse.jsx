import PropTypes from 'prop-types';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';

import NavItem from './NavItem';
import { useMenu } from 'contexts/MenuContext';

// Icons
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// ==============================|| NAVIGATION COLLAPSE ||============================== //

export default function NavCollapse({ menu, level }) {
  const { pathname } = useLocation();
  const { drawerOpen } = useMenu();

  const [open, setOpen] = useState(false);

  // Check if any child is active
  const isChildActive = menu.children?.some((child) => pathname === child.url);

  const handleClick = () => {
    setOpen(!open);
  };

  const Icon = menu.icon;
  const menuIcon = Icon ? (
    <Icon style={{ fontSize: drawerOpen ? '1.25rem' : '1.5rem' }} />
  ) : null;

  const collapseContent = (
    <>
      <ListItemButton
        onClick={handleClick}
        selected={isChildActive}
        sx={{
          pl: drawerOpen ? `${level * 24}px` : 1.5,
          py: 1,
          mb: 0.5,
          borderRadius: 1,
          '&:hover': {
            bgcolor: 'action.hover'
          },
          '&.Mui-selected': {
            bgcolor: 'primary.lighter',
            color: 'primary.main'
          }
        }}
      >
        {menuIcon && (
          <ListItemIcon
            sx={{
              minWidth: 32,
              color: isChildActive ? 'primary.main' : 'text.primary',
              ...(!drawerOpen && { justifyContent: 'center' })
            }}
          >
            {menuIcon}
          </ListItemIcon>
        )}
        {drawerOpen && (
          <>
            <ListItemText
              primary={menu.title}
              primaryTypographyProps={{
                variant: 'body1',
                sx: { fontWeight: isChildActive ? 600 : 400 }
              }}
            />
            {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </>
        )}
      </ListItemButton>

      {drawerOpen && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {menu.children?.map((item) => {
              switch (item.type) {
                case 'collapse':
                  return <NavCollapse key={item.id} menu={item} level={level + 1} />;
                case 'item':
                  return <NavItem key={item.id} item={item} level={level + 1} />;
                default:
                  return null;
              }
            })}
          </List>
        </Collapse>
      )}
    </>
  );

  if (!drawerOpen) {
    return (
      <Tooltip title={menu.title} placement="right" arrow>
        <div>{collapseContent}</div>
      </Tooltip>
    );
  }

  return collapseContent;
}

NavCollapse.propTypes = {
  menu: PropTypes.object.isRequired,
  level: PropTypes.number.isRequired
};
