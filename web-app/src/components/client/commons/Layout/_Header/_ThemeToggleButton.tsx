import IconButton from '@mui/material/IconButton';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import ThemeContext from '@/contexts/ThemeContext';
import { ThemeMode } from '@/consts/theme';

export default function ThemeToggleButton() {
  return (
    <ThemeContext.Consumer>
      {context => (
        <IconButton
          aria-label="theme toggle"
          color="inherit"
          size="large"
          edge="end"
          sx={{ ml: 2 }}
          onClick={context.handleThemeToggle}>
          {context.theme === ThemeMode.LIGHT ? (
            <DarkModeIcon />
          ) : (
            <LightModeIcon />
          )}
        </IconButton>
      )}
    </ThemeContext.Consumer>
  );
}
