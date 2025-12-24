import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import Loader from 'components/Loader';
import MainLayout from 'layout/MainLayout';
import MinimalLayout from 'layout/MinimalLayout';

// Lazy load pages
const Error404 = lazy(() => import('pages/error/404'));

// Suspense wrapper
const Loadable = (Component) => (props) =>
  (
    <Suspense fallback={<Loader />}>
      <Component {...props} />
    </Suspense>
  );

// Wrapped components
const Error404Page = Loadable(Error404);

// ==============================|| ROUTING ||============================== //

const router = createBrowserRouter([
  // Main Routes (with layout)
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '*',
        element: <Error404Page />
      }
    ]
  },

  // Auth Routes (minimal layout) - Add auth modules to enable
  {
    path: '/',
    element: <MinimalLayout />,
    children: []
  }
]);

export default router;
