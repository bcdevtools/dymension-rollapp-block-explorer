import IconButton from '@mui/material/IconButton';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import ThemeContext from '@/contexts/ThemeContext';
import { ThemeMode } from '@/consts/theme';
import { useTheme } from '@mui/material/styles';

export default function ThemeToggleButton({
  isDark,
}: Readonly<{ isDark: boolean }>) {
  const theme = useTheme();
  return (
    <ThemeContext.Consumer>
      {context => (
        <IconButton
          aria-label="theme toggle"
          size="large"
          edge="end"
          sx={{ ml: 2 }}
          onClick={context.handleThemeToggle}>
          {theme.palette.mode === ThemeMode.LIGHT ? (
            <DarkModeIcon color="inherit" />
          ) : (
            <LightModeIcon color="primary" />
          )}
        </IconButton>
      )}
    </ThemeContext.Consumer>
  );
}
