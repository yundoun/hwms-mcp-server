import { ThemeMode } from 'config';

// ==============================|| GREY COLORS ||============================== //

const greyLight = {
  0: '#ffffff',
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#eeeeee',
  300: '#e0e0e0',
  400: '#bdbdbd',
  500: '#9e9e9e',
  600: '#757575',
  700: '#616161',
  800: '#424242',
  900: '#212121',
  A50: '#f5f5f5',
  A100: '#d5d5d5',
  A200: '#aaaaaa',
  A400: '#616161',
  A700: '#303030'
};

const greyDark = {
  0: '#121212',
  50: '#1e1e1e',
  100: '#2d2d2d',
  200: '#3d3d3d',
  300: '#4d4d4d',
  400: '#6d6d6d',
  500: '#8d8d8d',
  600: '#adadad',
  700: '#cdcdcd',
  800: '#e0e0e0',
  900: '#f5f5f5',
  A50: '#1a1a1a',
  A100: '#2a2a2a',
  A200: '#4a4a4a',
  A400: '#8a8a8a',
  A700: '#cacaca'
};

// ==============================|| PRESET COLORS ||============================== //

const presetColors = {
  default: {
    primary: {
      lighter: '#e3f2fd',
      light: '#90caf9',
      main: '#1890ff',
      dark: '#1565c0',
      darker: '#0d47a1',
      contrastText: '#fff'
    },
    secondary: {
      lighter: '#f3e5f5',
      light: '#ce93d8',
      main: '#9c27b0',
      dark: '#7b1fa2',
      darker: '#4a148c',
      contrastText: '#fff'
    },
    error: {
      lighter: '#ffebee',
      light: '#ef9a9a',
      main: '#f44336',
      dark: '#c62828',
      darker: '#b71c1c',
      contrastText: '#fff'
    },
    warning: {
      lighter: '#fff3e0',
      light: '#ffb74d',
      main: '#ff9800',
      dark: '#f57c00',
      darker: '#e65100',
      contrastText: 'rgba(0, 0, 0, 0.87)'
    },
    info: {
      lighter: '#e1f5fe',
      light: '#4fc3f7',
      main: '#03a9f4',
      dark: '#0288d1',
      darker: '#01579b',
      contrastText: '#fff'
    },
    success: {
      lighter: '#e8f5e9',
      light: '#81c784',
      main: '#4caf50',
      dark: '#388e3c',
      darker: '#1b5e20',
      contrastText: '#fff'
    }
  }
};

// ==============================|| PALETTE BUILDER ||============================== //

export function buildPalette(presetColor = 'default', mode = ThemeMode.LIGHT) {
  const colors = presetColors[presetColor] || presetColors.default;
  const grey = mode === ThemeMode.DARK ? greyDark : greyLight;

  const palette = {
    mode,
    common: { black: '#000', white: '#fff' },
    ...colors,
    grey,
    text: {
      primary: mode === ThemeMode.DARK ? grey[900] : grey[700],
      secondary: mode === ThemeMode.DARK ? grey[700] : grey[500],
      disabled: mode === ThemeMode.DARK ? grey[600] : grey[400]
    },
    action: {
      disabled: grey[300],
      disabledBackground: grey[200],
      hover: mode === ThemeMode.DARK ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      selected: mode === ThemeMode.DARK ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)'
    },
    divider: mode === ThemeMode.DARK ? grey[200] : grey[200],
    background: {
      paper: mode === ThemeMode.DARK ? grey[100] : grey[0],
      default: mode === ThemeMode.DARK ? grey[50] : grey[50]
    }
  };

  return palette;
}

export default buildPalette;
