/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useEffect, useState } from "react";
import { userClient } from "../utils/api";

type User = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  biography: string;
  profilePictureUrl: string;
  createdAt: Date;
};

type AuthContextType = {
  signup: () => void;
  login: () => void;
  logout: () => void;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider: React.FC<{ children?: React.ReactNode }> = (props) => {
  const { children } = props;
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("token");
    userClient
      .get("/auth/verify-token", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => setUser(res.data.data))
      .catch((_err) => setUser(null));
  }, []);

  // TODO
  const signup = () => {};

  const login = () => {};

  const logout = () => {};

  return (
    <AuthContext.Provider value={{ signup, login, logout, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
