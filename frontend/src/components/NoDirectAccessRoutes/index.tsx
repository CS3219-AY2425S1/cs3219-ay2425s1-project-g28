import { Navigate, Outlet, useLocation } from "react-router-dom";

const NoDirectAccessRoutes: React.FC = () => {
  const location = useLocation();

  if (location.state?.from !== "app-navigation") {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default NoDirectAccessRoutes;
