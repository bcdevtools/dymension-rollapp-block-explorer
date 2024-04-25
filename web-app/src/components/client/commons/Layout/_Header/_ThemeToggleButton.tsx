import IconButton from '@mui/material/IconButton';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import ThemeContext from '@/contexts/ThemeContext';

export default function ThemeToggleButton({
  isDark,
}: Readonly<{ isDark: boolean }>) {
  return (
    <ThemeContext.Consumer>
      {context => (
        <IconButton
          aria-label="theme toggle"
          size="large"
          edge="end"
          sx={{ ml: 2 }}
          onClick={context.handleThemeToggle}>
          {isDark ? (
            <LightModeIcon color="primary" />
          ) : (
            <DarkModeIcon sx={{ color: 'white' }} />
          )}
        </IconButton>
      )}
    </ThemeContext.Consumer>
  );
}
