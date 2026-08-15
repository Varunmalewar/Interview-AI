import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/login.jsx";
import Register from "./features/auth/pages/register.jsx";
import Protected from "./features/auth/components/Protected.jsx";
import Interview from "./features/interview/pages/Interview.jsx";
import Home from "./features/interview/pages/Home.jsx"


export const router = createBrowserRouter([
  {
    path: "/",
    element: <Protected><Home /></Protected>,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/interview/:interviewId",
    element: <Protected><Interview /></Protected>,
  }
]);