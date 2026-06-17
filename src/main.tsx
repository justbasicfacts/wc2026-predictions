import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, createTheme } from '@mantine/core';
import '@fontsource-variable/space-grotesk';
import '@mantine/core/styles.css';
import './App.css';
import App from './App';

const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: "'Space Grotesk Variable', 'Space Grotesk', system-ui, sans-serif",
  colors: {
    dark: [
      '#C1C2C5', '#A6A7AB', '#909296', '#5C5F66',
      '#373A40', '#2C2E33', '#25262B', '#1A1B1E',
      '#141517', '#101113',
    ],
  },
  components: {
    Card: {
      defaultProps: { radius: 'md' },
    },
  },
});

// Force SW update check on every load so new versions activate quickly
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(reg => reg.update()).catch(() => { /* ignore */ });
}

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <App />
    </MantineProvider>
  </React.StrictMode>,
);
