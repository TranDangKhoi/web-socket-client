import { createContext, useState } from "react";
import { TProfile } from "../types/auth.types";

type TAuthContext = {
    profile: TProfile;
    setProfile: React.Dispatch<React.SetStateAction<TProfile>>
}

const initialState: TAuthContext = {
    profile: localStorage.getItem("profile") ? JSON.parse(localStorage.getItem("profile") || "{}") : {},
    setProfile: () => null,
}

export const AuthContext = createContext<TAuthContext>(initialState);

export const AuthProvider = ({children}: { children: React.ReactNode }) => {
    const [profile, setProfile] = useState<TProfile>({
        name: "",
        _id: ""
    })
    return (
        <AuthContext.Provider value={{
            profile,
            setProfile
        }}>{children}</AuthContext.Provider>
    )
}