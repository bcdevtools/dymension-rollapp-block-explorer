import { ThemeMode } from '@/consts/theme';
import React from 'react';

type ThemeContextType = {
  theme: ThemeMode;
  handleThemeToggle: () => void;
};

export default React.createContext<ThemeContextType>({
  theme: ThemeMode.LIGHT,
  handleThemeToggle: () => {},
});
