// ==============================|| THEME CONSTANT ||============================== //

export const APP_DEFAULT_PATH = '/dashboard';
export const DRAWER_WIDTH = 260;
export const MINI_DRAWER_WIDTH = 60;

export const ThemeMode = {
  LIGHT: 'light',
  DARK: 'dark'
};

export const MenuOrientation = {
  VERTICAL: 'vertical',
  HORIZONTAL: 'horizontal'
};

export const ThemeDirection = {
  LTR: 'ltr',
  RTL: 'rtl'
};

// ==============================|| THEME CONFIG ||============================== //

const config = {
  fontFamily: `'Public Sans', sans-serif`,
  menuOrientation: MenuOrientation.VERTICAL,
  themeDirection: ThemeDirection.LTR,
  presetColor: 'default',
  container: true
};

export default config;
