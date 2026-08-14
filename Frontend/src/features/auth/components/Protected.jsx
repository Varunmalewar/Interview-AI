import React from "react";
import { useAuth } from "../Hooks/useAuth";
import {Navigate} from "react-router";

const Protected = ({children}) => {
  const{loading,user} = useAuth()
//   const navigate = useNavigate()

  if(loading){
    return (
      <div>
        <p>loading....</p>
      </div>
    )
  }

  if(!user){
   return <Navigate to="/login" replace />
  }
  return children;
};

export default Protected;
