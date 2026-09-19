import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return children;

  switch (user?.role) {
    case "admin":
      return <Navigate to="/admin/dashboard" />;

    // case "teacher":
    //   return <Navigate to="/teacher/dashboard" />;

    case "librarian":
      return <Navigate to="/librarian/dashboard" />;

    default:
      return <Navigate to="/dashboard" />;
  }

};

export default PublicRoute;
