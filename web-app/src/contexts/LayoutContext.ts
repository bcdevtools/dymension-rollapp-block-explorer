import React from 'react';

type LayoutContextType = {
  handleMenuClose: () => void;
};

export default React.createContext<LayoutContextType>({
  handleMenuClose: () => {},
});
