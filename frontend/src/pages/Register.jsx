import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';

import { useAuth } from '../AuthContext';

function Register() {

    const navigate = useNavigate();
    
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (!username || !password || !email) {
            setError("All fields are required");
            toast("All fields are required!");
            return;
        }

        try {
            const response = await axios.post(`http://localhost:5000/register`, {
                username,
                password,
                email},{
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true});
            
            // Handle successful registration
            // log in after successful registration
            login(username, response.data.token);

            navigate('/');

        } catch (err) {
            setError(err.message);
            console.error("Registration error:", err);
            toast("Registration failed!\nPerhaps a user exists by that username");
        }
    }

    useEffect(() => {
            // Reset error message on component mount
            setError("");
        }, []);

  return (
    <div className="page">
        <ToastContainer />

        <h2>Register</h2>
        <div className="login-register">

        <div className="card bg-glass">
          <div className="card-body px-4 py-5 px-md-5">
            <form onSubmit={handleRegister}>          
                  <div data-mdb-input-init className="form-outline">
                    <input type="text" id="username" name="username" value={username} onChange={(e) => setUsername(e.target.value)} required className="form-control" />
                    <label className="form-label" htmlFor="username">Username</label>
                  </div>
               

              <div data-mdb-input-init className="form-outline mb-4">
                <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-control" />
                <label className="form-label" htmlFor="email">Email address</label>
              </div>

              <div data-mdb-input-init className="form-outline mb-4">
                <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="form-control" />
                <label className="form-label" htmlFor="password">Password</label>
              </div>

              <button type="submit" data-mdb-button-init data-mdb-ripple-init className="btn btn-primary btn-block mb-4">
                Sign up
              </button>

            </form>
            <div>{error.length > 0 ? <p>Error: {error}</p> : <br/>}</div>
          </div>
          </div>
          </div>
          </div>
  )
}

export default Register