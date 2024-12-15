import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Outlet } from 'react-router-dom'
import './App.css'
import { Toaster } from 'react-hot-toast'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>  
      <Outlet />
      <Toaster
        toastOptions={{
          duration: 2000,
        }}
      />
    </>
  )
}

export default App
