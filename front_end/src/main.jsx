import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import App from "./App";
import Upload from "./pages/Upload.jsx";
import Login from "./pages/auth/Login/Login.jsx";
import Register from "./pages/auth/Register/Register.jsx";
import MainLayout from "./layout/MainLayout.jsx";
import BasePage from "./pages/base/BasePage.jsx";
import MyDrive from "./pages/MyDrive.jsx";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <BasePage />,
      children: [
        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/register",
          element: <Register />,
        },
        {
          path: "/home",
          element: <MyDrive />,
        },
        {
          path: "/my-drive",
          element: <MyDrive />,
        },
        {
          path: "/upload",
          element: <Upload />,
        },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
);

// Cung cấp router thông qua RouterProvider
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
