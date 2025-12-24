import PropTypes from 'prop-types';
import { useMemo } from 'react';

import { createTheme, StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { ThemeMode } from 'config';
import useConfig from 'hooks/useConfig';
import { buildPalette } from './palette';
import Typography from './typography';
import CustomShadows from './shadows';
import ComponentsOverrides from './overrides';

// ==============================|| DEFAULT THEME - MAIN ||============================== //

export default function ThemeCustomization({ children }) {
  const { state } = useConfig();

  const themeTypography = useMemo(() => Typography(state.fontFamily), [state.fontFamily]);

  const themeOptions = useMemo(
    () => ({
      breakpoints: {
        values: {
          xs: 0,
          sm: 768,
          md: 1024,
          lg: 1266,
          xl: 1440
        }
      },
      direction: state.themeDirection,
      mixins: {
        toolbar: {
          minHeight: 60,
          paddingTop: 8,
          paddingBottom: 8
        }
      },
      typography: themeTypography,
      colorSchemes: {
        light: {
          palette: buildPalette(state.presetColor, ThemeMode.LIGHT)
        },
        dark: {
          palette: buildPalette(state.presetColor, ThemeMode.DARK)
        }
      },
      cssVariables: {
        colorSchemeSelector: 'data-color-scheme'
      },
      customShadows: {
        light: CustomShadows(ThemeMode.LIGHT),
        dark: CustomShadows(ThemeMode.DARK)
      }
    }),
    [state.themeDirection, state.presetColor, themeTypography]
  );

  const themes = createTheme(themeOptions);
  themes.components = ComponentsOverrides(themes);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider disableTransitionOnChange theme={themes} modeStorageKey="theme-mode" defaultMode="light">
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

ThemeCustomization.propTypes = { children: PropTypes.node };
