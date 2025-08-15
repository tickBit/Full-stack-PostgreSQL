import {FaSignInAlt, FaSignOutAlt, FaUser} from 'react-icons/fa';
import { useNavigate } from 'react-router';
import { Link } from 'react-router';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

import { useAuth } from '../AuthContext';

function Header() {

  const navigate = useNavigate();

  const { isLoggedIn, logout, token } = useAuth();

  const handleDelete = async () => {
    try {
        const res = await axios.delete('http://localhost:5000/deleteme', {
          headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                },
          withCredentials: true },
        );

        if (res.data === undefined) {
          toast("Perhaps the PostgreSQL database isn't running");
          return;
        } else {
          toast(res.data); // esim. "User deleted"
          logout();
          navigate('/');
        }


    } catch (error) {
        toast("Deleting user failed. Perhaps there exists images by the user.");
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

          <ToastContainer />
          <h1>Image Gallery</h1>
          
    </header>

    </div>
    
  );
}

export default Header