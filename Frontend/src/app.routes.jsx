import { createBrowserRouter, Navigate } from "react-router";
import Login from "./features/auth/pages/login.jsx";
import Register from "./features/auth/pages/register.jsx";
import Protected from "./features/auth/components/protected.jsx";
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Protected>
      <h1>Home Page</h1>
    </Protected>,
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