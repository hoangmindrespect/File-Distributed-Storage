
import { Outlet } from 'react-router-dom';
import { MainLayout } from '../../layout';
import { Toaster } from 'react-hot-toast';

const BasePage = () => {
  
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login';
  }

  return (
    <MainLayout>
      <Outlet />
      <Toaster
        toastOptions={{
          duration: 2000,
        }}
      />
    </MainLayout>
  );
};

export default BasePage;
