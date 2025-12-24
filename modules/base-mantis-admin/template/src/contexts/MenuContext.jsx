import PropTypes from 'prop-types';
import { createContext, useContext, useState, useMemo, useCallback } from 'react';

// ==============================|| MENU CONTEXT ||============================== //

const MenuContext = createContext(undefined);

export function MenuProvider({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(true);

  const toggleDrawer = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      drawerOpen,
      setDrawerOpen,
      toggleDrawer
    }),
    [drawerOpen, toggleDrawer]
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

MenuProvider.propTypes = { children: PropTypes.node };

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within MenuProvider');
  }
  return context;
}

export default MenuContext;
