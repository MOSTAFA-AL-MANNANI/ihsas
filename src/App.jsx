import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Add from "./compenents/addcandidat";
import AdminLogin from "./compenents/login";
import CandidatPage from "./compenents/candidat";
import ProtectedRoute from "./compenents/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Add />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/candidat" element={<ProtectedRoute><CandidatPage /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
