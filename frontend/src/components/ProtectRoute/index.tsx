import type { JSX } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { accessToken } = useSelector((state: RootState) => state.auth);
  if (!accessToken) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
