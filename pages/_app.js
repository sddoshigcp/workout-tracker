import { AuthProvider } from '../components/AuthProvider';
import { DarkModeProvider } from '../components/DarkModeContext';
import '../styles/globals.css'; // Tailwind base styles

export default function App({ Component, pageProps }) {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </DarkModeProvider>
  );
}
