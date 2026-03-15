import { Navigate, Outlet } from "react-router-dom";

export default function AdminGuard({ user }) {
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  return <Outlet />;
}
