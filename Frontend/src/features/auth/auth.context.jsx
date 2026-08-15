/* eslint-disable react-refresh/only-export-components */
// Context and provider intentionally live together; fast refresh on the
// context value is acceptable for this app.
import {createContext, useState, useEffect} from "react";
import { getMe } from "./services/auth.api";


export const AuthContext = createContext()

export const AuthProvider = ({children}) =>{
    const[user,setUser] = useState(null)
    
    const[loading,setLoading] = useState(true)

    useEffect(() => {
        const getAndSetUser = async () => {
            try {
                const data = await getMe();
                if (data?.user) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error("Failed to fetch user:", err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        getAndSetUser();
    }, []);

    return (
        <AuthContext.Provider value={{user,setUser,loading,setLoading}}>
            {children}
        </AuthContext.Provider>
    )
}