import { createBrowserRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import ProcessDetailPage from '../pages/ProcessDetailPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/process/:id',
    element: <ProcessDetailPage />,
  },
]);