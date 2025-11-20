import Login from './pages/Login';
import BookCatalog from './pages/BookCatalog';
import MyBorrows from './pages/MyBorrows';
import Transactions from './pages/Transactions';
import AdminBooks from './pages/AdminBooks';
import AdminUsers from './pages/AdminUsers';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  staffOnly?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Login',
    path: '/login',
    element: <Login />,
    visible: false
  },
  {
    name: 'Book Catalog',
    path: '/',
    element: <BookCatalog />,
    visible: true
  },
  {
    name: 'My Borrows',
    path: '/my-borrows',
    element: <MyBorrows />,
    visible: true
  },
  {
    name: 'Transactions',
    path: '/transactions',
    element: <Transactions />,
    visible: true
  },
  {
    name: 'Manage Books',
    path: '/admin/books',
    element: <AdminBooks />,
    visible: true,
    staffOnly: true
  },
  {
    name: 'Manage Users',
    path: '/admin/users',
    element: <AdminUsers />,
    visible: true,
    staffOnly: true
  }
];

export default routes;