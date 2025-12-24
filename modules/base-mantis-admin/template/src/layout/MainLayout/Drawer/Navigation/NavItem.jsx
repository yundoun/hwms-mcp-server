import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';

import { useMenu } from 'contexts/MenuContext';

// ==============================|| NAVIGATION ITEM ||============================== //

export default function NavItem({ item, level }) {
  const { pathname } = useLocation();
  const { drawerOpen } = useMenu();

  const isSelected = pathname === item.url;

  const Icon = item.icon;
  const itemIcon = Icon ? (
    <Icon style={{ fontSize: drawerOpen ? '1.25rem' : '1.5rem' }} />
  ) : null;

  const listItemProps = {
    component: forwardRef((props, ref) => <Link ref={ref} {...props} to={item.url} />)
  };

  const textContent = (
    <ListItemButton
      {...listItemProps}
      disabled={item.disabled}
      selected={isSelected}
      sx={{
        zIndex: 1201,
        pl: drawerOpen ? `${level * 24}px` : 1.5,
        py: 1,
        mb: 0.5,
        borderRadius: 1,
        '&:hover': {
          bgcolor: 'action.hover'
        },
        '&.Mui-selected': {
          bgcolor: 'primary.lighter',
          color: 'primary.main',
          '&:hover': {
            bgcolor: 'primary.lighter'
          }
        }
      }}
    >
      {itemIcon && (
        <ListItemIcon
          sx={{
            minWidth: 32,
            color: isSelected ? 'primary.main' : 'text.primary',
            ...(!drawerOpen && { justifyContent: 'center' })
          }}
        >
          {itemIcon}
        </ListItemIcon>
      )}
      {drawerOpen && (
        <>
          <ListItemText
            primary={item.title}
            primaryTypographyProps={{
              variant: 'body1',
              sx: { fontWeight: isSelected ? 600 : 400 }
            }}
          />
          {item.chip && (
            <Chip
              color={item.chip.color || 'primary'}
              variant={item.chip.variant || 'filled'}
              size="small"
              label={item.chip.label}
            />
          )}
        </>
      )}
    </ListItemButton>
  );

  if (!drawerOpen) {
    return (
      <Tooltip title={item.title} placement="right" arrow>
        {textContent}
      </Tooltip>
    );
  }

  return textContent;
}

NavItem.propTypes = {
  item: PropTypes.object.isRequired,
  level: PropTypes.number.isRequired
};
