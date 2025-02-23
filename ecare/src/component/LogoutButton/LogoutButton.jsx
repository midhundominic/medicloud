import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import { ROUTES } from "../../router/routes";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user data from local storage
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    localStorage.removeItem("profilePhoto");

    // Navigate to the login page
    navigate(ROUTES.LOGIN, { replace: true });

    // Prevent going back to the protected route
    window.history.pushState(null, null, window.location.href);
    window.addEventListener("popstate", () => {
      navigate(ROUTES.LOGIN, { replace: true });
    });
  };

  return (
    <Button variant="contained" color="secondary" onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default LogoutButton;
