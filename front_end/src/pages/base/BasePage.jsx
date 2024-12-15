
import { Outlet } from 'react-router-dom';
import { MainLayout } from '../../layout';
import { Toaster } from 'react-hot-toast';

const BasePage = () => {
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
