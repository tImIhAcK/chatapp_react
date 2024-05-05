import { Navigate } from "react-router-dom";
import { useAuthStore } from "../storage/auth";
import { ReactNode } from "react";

interface PrivateRouteProps {
  children?: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const loggedIn = useAuthStore((state) => state.isLoggedIn)();

  return loggedIn ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
