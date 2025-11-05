
import React from 'react';
import { Outlet } from 'react-router-dom';
import AppNavbar from './Navbar';

const MainLayout = () => (
  <>
    <AppNavbar />
    <main>
      <Outlet />
    </main>
  </>
);

export default MainLayout;
