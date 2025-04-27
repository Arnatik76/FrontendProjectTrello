import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import BoardPage from "../pages/BoardPage";
import LoginForm from "../auth/LoginForm";
import RegisterForm from "../auth/RegisterForm";
// Измените импорт, добавив .jsx
import ProtectedRoute from "../components/ProtectedRoute.jsx";

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Публичные */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* Защищенные */}
        <Route element={<ProtectedRoute />}> {/* Обертка */}
          <Route path="/" element={<HomePage />} /> {/* Вложенный маршрут */}
          <Route path="/board/:id" element={<BoardPage />} /> {/* Вложенный маршрут */}
        </Route>

        {/* Можно добавить маршрут 404 Not Found */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </Router>
  );
}

export default AppRoutes;