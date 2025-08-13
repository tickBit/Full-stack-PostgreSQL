import {FaSignInAlt, FaSignOutAlt, FaUser} from 'react-icons/fa';
import { useNavigate } from 'react-router';
import { Link } from 'react-router';
import axios from 'axios';

import { useAuth } from '../AuthContext';

function Header() {

  const navigate = useNavigate();

  const { isLoggedIn, logout } = useAuth();

  const handleDelete = async () => {
    try {
        const res = await axios.post('http://localhost:5000/deleteme', {
          withCredentials: true,
        });

        console.log(res.data); // esim. "User deleted"
        
        localStorage.removeItem("username");
        logout();

        navigate('/');
    } catch (error) {
        console.error('Poistaminen epäonnistui:', error);
      }

  }

  const onLogout = (e) => {
    console.log("Log out!");
    logout();
  }

  return (
    <div className='container'>

    <header className='header'>
          <div className='menu'>
          {!isLoggedIn ? (<>
          <Link to="/register">
            <span>Register</span>
          </Link>
          <Link to="/login">
            <span><FaSignInAlt /> Login</span>
          </Link>
          </>
          
          ): (<> <Link onClick={handleDelete} >
            <span>Delete my account</span>
          </Link>
          <Link onClick={(e) => onLogout(e)}>
            <span >Logout</span>
          </Link>
         </>) }
          </div>
          <h1>Image Gallery</h1>
          
    </header>

    </div>
    
  );
}

export default Header