import {createContext, useState, useContext, Children} from "react";


export const AuthContext = createContext()

export const AuthProvider = ({children}) =>{
    const[user,setUser] = useState(null)
    // const[isAuthenticated,setIsAuthenticated] = useState(false)
    const[loading,setLoading] = useState(false)

    return (
        <AuthContext.Provider value={{user,setUser,loading,setLoading}}>
            {children}
        </AuthContext.Provider>
    )
}