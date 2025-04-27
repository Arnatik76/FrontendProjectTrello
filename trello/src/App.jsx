import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import AppRoutes from "./routes/AppRoutes";
import { checkAuth } from './store/slices/authSlice';
import "./App.css";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);
  return (
      <AppRoutes />
  );
}

export default App;