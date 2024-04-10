import React from 'react';

type ThemeContextType = {
  handleThemeToggle: () => void;
};

export default React.createContext<ThemeContextType>({
  handleThemeToggle: () => {},
});
