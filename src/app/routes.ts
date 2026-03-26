import { createBrowserRouter } from 'react-router';
import RootLayout from './layouts/RootLayout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AdminDashboard from './pages/AdminDashboard';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'category/:id', Component: ProductListingPage },
      { path: 'product/:id', Component: ProductDetailPage },
      { path: 'admin', Component: AdminDashboard },
    ],
  },
]);
