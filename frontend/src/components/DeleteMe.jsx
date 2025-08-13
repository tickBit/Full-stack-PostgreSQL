import axios from 'axios';
import { useNavigate } from 'react-router';

function DeleteMe() {
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      const res = await axios.post('http://localhost:5000/deleteme',{
        withCredentials: true,
      });

      console.log(res.data); // esim. "User deleted"

      localStorage.removeItem("username");

      navigate('/login');
    } catch (error) {
      console.error('Poistaminen epäonnistui:', error);
    }
  };

  return (
    <div>
      <h2>Poista tilini</h2>
      <p>Oletko varma, että haluat poistaa tilisi?</p>
      <button onClick={handleDelete}>Kyllä, poista minut</button>
    </div>
  );
}

export default DeleteMe;
