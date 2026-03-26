import { RouterProvider } from 'react-router';
import { router } from './routes';
import { LanguageProvider } from './i18n/LanguageProvider';

export default function App() {
  return (
    <LanguageProvider>
      <RouterProvider router={router} />
    </LanguageProvider>
  );
}
