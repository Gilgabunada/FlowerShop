import { createContext, useContext } from 'react';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

const NotyContext = createContext(null);

export function NotyProvider({ children }) {
  const notyf = new Notyf({
    duration: 3000,
    position: { x: 'right', y: 'top' },
    types: [
      {
        type: 'success',
        background: '#d63384',
        icon: false,
      },
      {
        type: 'error',
        background: '#dc3545',
        icon: false,
      },
      {
        type: 'warning',
        background: '#ffc107',
        icon: false,
        dismissible: true,
      },
    ],
  });

  return (
    <NotyContext.Provider value={notyf}>
      {children}
    </NotyContext.Provider>
  );
}

export function useNotyf() {
  const ctx = useContext(NotyContext);
  if (!ctx) throw new Error('useNotyf must be used inside NotyProvider');
  return ctx;
}
