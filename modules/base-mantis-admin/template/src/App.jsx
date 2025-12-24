import { RouterProvider } from 'react-router-dom';

// Project imports
import router from 'routes';
import ThemeCustomization from 'themes';

// ==============================|| APP - THEME, ROUTER ||============================== //

export default function App() {
  return (
    <ThemeCustomization>
      <RouterProvider router={router} />
    </ThemeCustomization>
  );
}
