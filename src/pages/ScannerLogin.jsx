import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ScannerLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login', { replace: true });
  }, [navigate]);

  return null;
};

export default ScannerLogin;
