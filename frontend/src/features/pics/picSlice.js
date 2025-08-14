import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


export const fetchPics = createAsyncThunk(
  'pic/fetchPics',
  async (token, thunkAPI) => {

    try {
      const response = await axios.get('http://localhost:5000/getUserPics', {
        headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
        },
      withCredentials: true
    })
      return response.data;
    }
      catch (error) {
        return thunkAPI.rejectWithValue(error.message);
    }
  })

const picSlice = createSlice({
  name: 'pic',
  initialState: {
    pics: [],
    isError: false,
    isLoading: false,
    isSuccess: false,
    isUploaded: false,
    message: '',
    error: '',
  },
  reducers: {
        reset: (state) => {
            state.pics = []
            state.isLoading = false
            state.isError = false
            state.isSuccess = false
            state.isUploaded = false
            state.message = ''
        },
          deleteOne: (state, action) => {
            state.pics = state.pics.filter(pic => pic.id !== action.payload)
        },
          uploadPic: (state, action) => {
            state.pics.push(action.payload)
        }
    },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPics.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.error = '';
      })
      .addCase(fetchPics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.pics = action.payload;
      })
      .addCase(fetchPics.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.error = action.payload || 'Failed to fetch pics';
        state.pics = [];
      });
  },
});

export const {reset, deleteOne, uploadPic } = picSlice.actions
export default picSlice.reducer;