import { useEffect } from 'react';
import {useNavigate} from 'react-router';
import {useSelector, useDispatch} from 'react-redux';
import axios from 'axios';

import { fetchPics, reset } from '../features/pics/picSlice'; // import the thunk
import UploadForm from '../components/UploadForm';
import { useAuth } from '../AuthContext';
import Spinner from '../components/Spinner';

function MainView() {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { isLoggedIn, username, token } = useAuth();

    const { pics, isLoading } = useSelector((state) => state.pic);
    
    async function deletePic(e, id) {
        if (!isLoggedIn) return;

        try {
            const response = await axios.delete(`http://localhost:5000/deletePic/${id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                }
            });

            if (response.data.success) {
                // Remove picture from state of Redux
                dispatch({
                    type: 'pic/deleteOne',
                    payload: id
                });
            } else {
                console.error(response.data.message);
            }
        } catch (err) {
            console.error(err);
        }
    }



    useEffect(() => {

        if (isLoggedIn) {

            dispatch(fetchPics(token));
        } else {
            navigate('/');
        }

        // this is done when component is unmounted
        return () => {
            dispatch(reset())
        }

    }, [isLoggedIn, navigate, dispatch, token]);

    return (
        <div className="page">
            
            {isLoggedIn ? (
                <div>
                    <h2>Main page for user {username}</h2>

                    <UploadForm />

                    <div className='picture-area'>

                    {!isLoading && pics ? (<div>

                        {pics.length > 0 ? (
                                pics.map((picture) => {
                                                    
                                        return (<div className='picture' key={'_'+picture.id}>
                                            <p onClick={(e) => deletePic(e, picture.id)} className='close'>Delete picture</p>
                                            <img src={`data:image/jpeg;base64,${picture.file_data}`} width="350" height="350" alt={`Image: ${picture.fileName}`} />
                                            <p>{picture.description}</p>
                                        </div>);
                                        }
                                    )
                                ) : (
                                    <p>No images</p>
                                )
                            }
                            </div>
                       ) : (<p>PLease wait...</p>)
                    }
                    </div></div>
                    ) : (
                    <p>Please log in</p>
                )}
                </div>
);}
            
export default MainView