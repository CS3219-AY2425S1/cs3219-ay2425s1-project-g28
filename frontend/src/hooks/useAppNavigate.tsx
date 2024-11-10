import { useNavigate } from "react-router-dom";

export interface LocationState {
  from: string;
}

export const useAppNavigate = () => {
  const navigate = useNavigate();

  const appNavigate = (path: string) => {
    navigate(path, {
      replace: location.pathname !== "/home",
      state: { from: "app-navigation" } as LocationState,
    });
  };

  return appNavigate;
};

export default useAppNavigate;
