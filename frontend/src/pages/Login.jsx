import { useState } from "react";
import { useNavigate } from 'react-router';
import { ToastContainer, toast } from 'react-toastify';
import axios from "axios";

import { useAuth } from '../AuthContext';

function Login() {

    const navigate = useNavigate();
    
    const { login } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            toast("Username and password are required");
            return;
        }

            try {
                const response = await axios.post(`http://localhost:5000/login`, {
                                username: username,
                                password: password
                                });

                if (response.status === 401) {
                    toast('Unauthorized: Invalid credentials');
                    return;
                }

                // Handle successful login
                // localStorage.setItem('isLoggedIn', 'true');
                // localStorage.setItem('username', username);
                // localStorage.setItem('token', response.data.token);

                login(username, response.data.token);

                navigate('/');
            } catch (error) {
                console.error('Login failed:', error.message);
            }
            };

    
  return (
    <div className="page">
        <h2>Log in</h2>
        <div className="login-register">

        <div className="card bg-glass">
          <div className="card-body px-4 py-5 px-md-5">

        <form onSubmit={handleLogin}>

    <div data-mdb-input-init className="form-outline mb-4">
        <input type="text" id="username" name="username" value={username} onChange={(e) => setUsername(e.target.value)} required className="form-control" />
        <label className="form-label" htmlFor="username">Username</label>
    </div>

    <div data-mdb-input-init className="form-outline mb-4">
        <input type="password" id='password' name='password' value={password} onChange={(e) => setPassword(e.target.value)} required className="form-control" />
        <label className="form-label" htmlFor="password">Password</label>
    </div>

    <button type="submit" data-mdb-button-init data-mdb-ripple-init className="btn btn-primary btn-block mb-4">Sign in</button>

    <ToastContainer />
    </form>
    </div>
    </div>
    </div>
    </div>
    )
}

export default Login