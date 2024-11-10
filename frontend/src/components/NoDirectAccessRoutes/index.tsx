import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LocationState } from "../../hooks/useAppNavigate";

const NoDirectAccessRoutes: React.FC = () => {
  const location = useLocation();

  if ((location.state as LocationState)?.from !== "app-navigation") {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default NoDirectAccessRoutes;
