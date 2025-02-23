export const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/check-session', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Session check failed:', error);
      return { success: false, isSessionExpired: true };
    }
  };
