import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import axios from 'axios';

import Spinner from './Spinner';

function UploadForm() {

    // initial state of the upload form for file and its description
    const [file, setFile] = useState();
    const [description, setDescription] = useState('');

    const { isError, message, isUploaded, isUploading } = useSelector((state) => state.pic);

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

    // handle possible error in uploading and inform, if upload was successful
    useEffect(() => {
    
        if (isError) toast.error(message)

        if (isUploaded) toast.success('Picture uploaded!')
    
    }, [isError, isUploaded, message])

    const onSubmit = (e) => {
        e.preventDefault()

        
        
        sendFormData();

        setFile(null)
        setDescription('')

    }

    if (isUploading) {
        return <Spinner />
    }

  const sendFormData = async () => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("description", description);

        console.log(file, description);
        const token = localStorage.getItem("token");
        console.log(token);
  
    const response = await axios.post(
  "http://localhost:5000/upload",
  formData,
  {
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "multipart/form-data"
  },
  withCredentials: true
})
.then(res => {
  console.log("Upload OK:", res.data);
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