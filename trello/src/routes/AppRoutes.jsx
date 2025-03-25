import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/HomePage";
import Board from "../pages/BoardPage";

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/board/:id" element={<Board />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
