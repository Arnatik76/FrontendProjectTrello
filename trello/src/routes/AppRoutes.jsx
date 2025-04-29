import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import BoardPage from "../pages/BoardPage";
import LoginForm from "../auth/LoginForm";
import RegisterForm from "../auth/RegisterForm";
import ProtectedRoute from "../components/ProtectedRoute.jsx";

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/board/:id" element={<BoardPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default AppRoutes;