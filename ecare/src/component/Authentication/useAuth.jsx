import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ROUTES } from "../../router/routes"

const useAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
        navigate(ROUTES.LOGIN);
      // Optionally show a session expired message
      Swal.fire('Session expired. Please log in again.');
    }
  }, [navigate]);
};

export default useAuth;