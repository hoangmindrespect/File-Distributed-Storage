import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Outlet } from 'react-router-dom'
import './App.css'
import { Toaster } from 'react-hot-toast'
import { RefreshContext } from './components/context/RefreshContext';

function App() {
  const [count, setCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshData = () => setRefreshKey(prev => prev + 1);

  return (
    <RefreshContext.Provider value={{ refreshKey, refreshData }}>  
      <Outlet />
      <Toaster
        toastOptions={{
          duration: 2000,
        }}
      />
    </RefreshContext.Provider>
  )
}

export default App
