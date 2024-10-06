/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useEffect, useState } from "react";
import { userClient } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import { SUCCESS_LOG_OUT } from "../utils/constants";

type User = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  biography?: string;
  profilePictureUrl?: string;
  createdAt: string;
  isAdmin: boolean;
};

type AuthContextType = {
  signup: (
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    password: string
  ) => void;
  login: (email: string, password: string) => void;
  logout: () => void;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider: React.FC<{ children?: React.ReactNode }> = (props) => {
  const { children } = props;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem("token");
    if (accessToken) {
      userClient
        .get("/auth/verify-token", {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((res) => setUser(res.data.data))
        .catch(() => setUser(null))
        .finally(() => {
          setTimeout(() => setLoading(false), 500);
        });
    } else {
      setUser(null);
      setTimeout(() => setLoading(false), 500);
    }
  }, []);

  const signup = (
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    password: string
  ) => {
    userClient
      .post("/users", {
        firstName: firstName,
        lastName: lastName,
        username: username,
        email: email,
        password: password,
      })
      .then(() => login(email, password))
      .catch((err) => {
        setUser(null);
        toast.error(err.response?.data.message || err.message);
      });
  };

  const login = (email: string, password: string) => {
    userClient
      .post("/auth/login", {
        email: email,
        password: password,
      })
      .then((res) => {
        const { accessToken, user } = res.data.data;
        localStorage.setItem("token", accessToken);
        setUser(user);
        navigate("/home");
      })
      .catch((err) => {
        setUser(null);
        toast.error(err.response?.data.message || err.message);
      });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
    toast.success(SUCCESS_LOG_OUT);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <AuthContext.Provider value={{ signup, login, logout, user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
