import { useContext } from "react";
import { AuthContext } from "../../contexts/authContext";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ element }) {
  const { loggedInUser } = useContext(AuthContext);

  if (loggedInUser) {
    return element;
  } else {
    return <Navigate to="/login" />;
  }
}

export default ProtectedRoute;
