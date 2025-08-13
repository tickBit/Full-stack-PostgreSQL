import { useEffect } from 'react';
import {useNavigate} from 'react-router';
import {useSelector, useDispatch} from 'react-redux';
import axios from 'axios';

import { fetchPics, reset } from '../features/pics/picSlice'; // import the thunk
import UploadForm from '../components/UploadForm';
import { useAuth } from '../AuthContext';

function MainView() {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { isLoggedIn, username } = useAuth();

    const pics = useSelector((state) => state.pic.pics);
    
    
    async function deletePic(e, id) {

        if (!isLoggedIn || !pics) return;
        else {
            const response = await axios.delete(`http://localhost:5000/deletePic?id=${id}`);
            console.log(response);
        }
    }


    useEffect(() => {

        if (localStorage.getItem("token")) {

            dispatch(fetchPics());

            navigate('/');
            return;
        } else {
            navigate('/');
        }

        dispatch(reset());

    }, [isLoggedIn, navigate, dispatch, pics]);

    return (
        <div className="page">
            {isLoggedIn ? (
                <div>
                    <h2>Main page for user {username}</h2>

                    <UploadForm />

                    <div className='picture-area'>

                        {pics && pics.length > 0 ? (
                                pics.map((picture) =>
                    
                                {
                                        return <div className='picture' key={'_' + picture.id}>
                                            <p onClick={(e) => deletePic(e, picture.id)} className='close'>Delete picture</p>
                                            <img src={`data:image/jpeg;base64,${picture.file_data}`} width="350" height="350" alt={`Image: ${picture.fileName}`} />
                                            <p>{picture.description}</p>
                                        </div>;
                                    }
                                ))
                             : (
                    <p>No pictures found.</p>
                    )}
                    </div>
                    </div>
            ) : <p>Please login
                </p>
            }       
        </div>
    );
}


export default MainView