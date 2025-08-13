import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchPics = createAsyncThunk(
  'pic/fetchPics',
  async (_, thunkAPI) => {

    const token = localStorage.getItem("token");
    
    try {
      const response = await axios.get('http://localhost:5000/getUserPics',
        {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
        withCredentials: true
        });

      return response.data;

    } catch (error) {
      console.log("ERRORI");
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

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
    },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPics.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.error = '';
      })
      .addCase(fetchPics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pics = action.payload;
      })
      .addCase(fetchPics.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.error = action.payload || 'Failed to fetch pics';
        state.pics = [];
      });
  },
});

export const {reset} = picSlice.actions
export default picSlice.reducer;