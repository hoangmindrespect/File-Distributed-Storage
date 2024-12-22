import { Spinner } from '@nextui-org/react';
import { PropsWithChildren, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbar';
import toast from "react-hot-toast";

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const { folder_id } = useParams();
  
  useEffect(() => {
    console.log('token', token);
    if (!token && pathname !== '/login' && pathname !== '/register') {
      toast.error("Please login to continue!", {
        id: 'auth-toast', 
        duration: 2000,
      });
      navigate("/login");
    }
  }, [navigate, token, pathname]);

  const hideComponents = ['/login', '/register'];
  const shouldShowComponent = !hideComponents.includes(location.pathname);


  return (
    <div className="flex max-h-screen min-h-screen flex-col">
      {shouldShowComponent && <Navbar />}
      <div className="flex flex-1 overflow-hidden">
        {shouldShowComponent && <Sidebar currentFolderId={folder_id || "folder-root-"} />}
        <div className="flex-1 overflow-auto bg-background p-2 md:p-6">
          {children}
        </div>
      </div>
    </div>
  ); 
};

export default MainLayout;
