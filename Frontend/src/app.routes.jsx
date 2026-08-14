import { createBrowserRouter, Navigate } from "react-router";
import Login from "./features/auth/pages/login.jsx";
import Register from "./features/auth/pages/register.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <h1>Home Page</h1>,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);