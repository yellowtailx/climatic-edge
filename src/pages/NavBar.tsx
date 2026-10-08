// src/pages/NavBar.tsx
import { Link, useNavigate } from 'react-router-dom';
import { SESSION_KEY } from '../security/passwordAlgorithm';

const NavBar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-end items-center">
      <Link to="/" className="ml-4 hover:text-yellow-500">Home</Link>
      <Link to="/news" className="ml-4 hover:text-yellow-500">News</Link>
      <Link to="/weather" className="ml-4 hover:text-yellow-500">Weather</Link>
      <button
        onClick={handleLogout}
        className="ml-6 bg-white text-blue-600 px-3 py-1 rounded hover:bg-yellow-400"
      >
        Logout
      </button>
    </nav>
  );
};

export default NavBar;
