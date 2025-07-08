import { createContext, useState } from "react";
import { TProfile } from "../types/auth.types";

type TAuthContext = {
  profile: TProfile | null;
  isLoggedIn: boolean;
  setProfile: React.Dispatch<React.SetStateAction<TProfile | null>>;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
};

const initialState: TAuthContext = {
  isLoggedIn: false,
  profile: localStorage.getItem("profile")
    ? JSON.parse(localStorage.getItem("profile") || "{}")
    : {},
  setProfile: () => null,
  setIsLoggedIn: () => null,
};

export const AuthContext = createContext<TAuthContext>(initialState);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<TProfile | null>(initialState.profile);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    initialState.isLoggedIn
  );
  return (
    <AuthContext.Provider
      value={{
        profile,
        isLoggedIn,
        setProfile,
        setIsLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
