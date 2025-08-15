import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import axios from 'axios';

import { uploadPic } from '../features/pics/picSlice'; // import the thunk
import { useAuth } from '../AuthContext';


function UploadForm() {

    const { token } = useAuth();

    const dispatch = useDispatch();

    // initial state of the upload form for file and its description
    const [file, setFile] = useState();
    const [description, setDescription] = useState('');

    const fileChange = (e) => {
        const file = e.target.files[0];

        if (file && file.type !== 'image/jpeg') {
            toast("JPEG images allowed only");
            return;
        }

        if (file.size > 200 * 1024) {
            toast("The image must be <= 200 kb");
            return;
        }

        setFile(file);

    }

    const handleEdit = (e) => {
        
        // limit description length to 180 chars
        if (e.target.value.length > 180) {
            toast("Too long description")
            return;
        }

        setDescription(e.target.value);

    }

    const onSubmit = (e) => {
        e.preventDefault()

        sendFormData();

        setFile(null)
        setDescription('')
    }

  const sendFormData = async () => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("description", description);
  
        const response = await axios.post("http://localhost:5000/upload",
            formData, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                },
                withCredentials: true
            }
        )
.then(res => {
    if (res.data.success) {
            } else {
                console.error(response.data.message);
            }
  console.log("Upload OK:", res.data);
  
  dispatch(uploadPic(res.data));

})
.catch(err => {
  console.error("Upload failed:", err.response?.data || err.message);
});
}


return (<>
<section className='form'>
<form onSubmit={onSubmit} id="uploadForm" encType="multipart/form-data">
  
<div className="form-group">
    <label htmlFor="picFile" id="picFileLbl">Choose file to upload </label>
    <br />
    <input type="file" className="form-control-file" id="picFile" onChange={(e) => fileChange(e)} required />
</div>

<div className="form-group-sm">
    <label htmlFor="picDescription">Description:</label>
    <textarea className="form-control" id="picDescription" rows="1" value={description} onChange={handleEdit} required></textarea>
</div>

<div className='form-buttons'>
    <button type="button" className="btn btn-primary mb-2" id="clrButtonUp" onClick={() => setDescription("")}>Clear</button>
    <button type="submit" className="btn btn-primary mb-2">Submit</button>
</div>

</form>

<ToastContainer />

</section>
</>);
}

export default UploadForm