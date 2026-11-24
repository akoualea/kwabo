import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {registerServiceWorker} from './utils/pwa';
import {initTheme} from './utils/theme';

initTheme();
registerServiceWorker();

createRoot(document.getElementById('root')!).render(<App />);
