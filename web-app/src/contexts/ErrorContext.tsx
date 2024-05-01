'use client';

import React, { useState } from 'react';

type ErrorContextType = {
  isShowErrorSnackbar: boolean;
  message: string;
  showErrorSnackbar: (message: string) => void;
  closeErrorSnackbar: () => void;
};

const ErrorContext = React.createContext<ErrorContextType>({
  isShowErrorSnackbar: false,
  message: '',
  showErrorSnackbar: () => {},
  closeErrorSnackbar: () => {},
});

export function ErrorContextProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [isShowErrorSnackbar, setShowErrorSnackbar] = useState(false);
  const [message, setMessage] = useState('');
  return (
    <ErrorContext.Provider
      value={{
        isShowErrorSnackbar,
        message,
        showErrorSnackbar: (_m: string) => {
          setMessage(_m);
          setShowErrorSnackbar(true);
        },
        closeErrorSnackbar: () => {
          setMessage('');
          setShowErrorSnackbar(false);
        },
      }}>
      {children}
    </ErrorContext.Provider>
  );
}

export default ErrorContext;
