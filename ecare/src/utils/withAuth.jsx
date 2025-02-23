import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkSession } from '../services/authServices';
import { ROUTES } from '../router/routes';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
      const verifySession = async () => {
        try {
          // Check for token and user data first
          const token = localStorage.getItem('token');
          const userData = JSON.parse(localStorage.getItem('userData'));

          if (!token || !userData) {
            localStorage.clear();
            navigate(ROUTES.LOGIN);
            return;
          }

          const response = await checkSession();
          
          if (response.success) {
            setIsAuthenticated(true);
            // Redirect based on user role
            if (userData.role === 1) { // Patient
              navigate(ROUTES.PATIENT_HOME);
            } else if (userData.role === 2) { // Doctor
              navigate(ROUTES.DOCTOR_HOME);
            } else if (userData.role === 3) { // Coordinator
              navigate(ROUTES.COORDINATOR_HOME);
            }
          } else {
            localStorage.clear();
            navigate(ROUTES.LOGIN);
          }
        } catch (error) {
          console.error('Session verification failed:', error);
          localStorage.clear();
          navigate(ROUTES.LOGIN);
        }
      };

      verifySession();

      // Set up interval to check session periodically
      const intervalId = setInterval(verifySession, 5 * 60 * 1000); // Check every 5 minutes

      return () => {
        clearInterval(intervalId);
      };
    }, [navigate]);

    // Show loading state while checking authentication
    if (!isAuthenticated) {
      return <div>Loading...</div>; // You can replace this with a proper loading component
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;