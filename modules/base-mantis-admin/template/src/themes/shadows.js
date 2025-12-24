import { ThemeMode } from 'config';

// ==============================|| CUSTOM SHADOWS ||============================== //

export default function CustomShadows(mode) {
  const isDark = mode === ThemeMode.DARK;

  return {
    button: isDark
      ? '0 2px 0 rgba(0, 0, 0, 0.045)'
      : '0 2px 0 rgba(0, 0, 0, 0.045)',
    text: isDark
      ? '0 -1px 0 rgba(255, 255, 255, 0.12)'
      : '0 -1px 0 rgba(0, 0, 0, 0.12)',
    z1: isDark
      ? '0 1px 2px rgba(0, 0, 0, 0.5)'
      : '0 1px 2px rgba(0, 0, 0, 0.15)',
    primary: '0 0 0 2px rgba(24, 144, 255, 0.2)',
    secondary: '0 0 0 2px rgba(156, 39, 176, 0.2)',
    error: '0 0 0 2px rgba(244, 67, 54, 0.2)',
    warning: '0 0 0 2px rgba(255, 152, 0, 0.2)',
    info: '0 0 0 2px rgba(3, 169, 244, 0.2)',
    success: '0 0 0 2px rgba(76, 175, 80, 0.2)'
  };
}
