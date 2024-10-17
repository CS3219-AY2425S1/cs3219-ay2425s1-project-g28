import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import React from "react";

export const useAppNavigate = () => {
  const navigate = useNavigate();

  const appNavigate = (path: string) => {
    navigate(path, {
      replace: location.pathname !== "/home",
      state: { from: "app-navigation" },
    });
  };

  return appNavigate;
};

const NoDirectAccessRoutes: React.FC = () => {
  const location = useLocation();

  if (location.state?.from !== "app-navigation") {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default NoDirectAccessRoutes;
