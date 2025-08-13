import { BrowserRouter as Router, Routes, Route} from 'react-router'

import PrivateRoute from './PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Header from './components/Header';
import MainView from './pages/MainView';

function App() {
  return (
    <>
    <Router>
      <>
        <Header />
        <Routes>
        <Route path='/' element={ <PrivateRoute> <MainView /> </PrivateRoute> } />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        </Routes>
      </>
     </Router>
     </>
  );
}

export default App;