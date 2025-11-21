import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Add from "./compenents/addcandidat";
import AdminLogin from "./compenents/login";
import CandidatPage from "./compenents/candidat";
import ProtectedRoute from "./compenents/ProtectedRoute";
import { FilierePage } from "./compenents/Filiere";
import CenterPage from "./compenents/Center";
import Layout from "./compenents/layout";
import FilterCandidats from "./compenents/change";
import CandidatFilterPage from "./compenents/candidatfilter";
import Dashboard from "./compenents/statistque";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Add />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/filiere" element={<ProtectedRoute><Layout><FilierePage /></Layout></ProtectedRoute>} />
        <Route path="/center" element={<ProtectedRoute><Layout><CenterPage /></Layout></ProtectedRoute>} />
        <Route path="/candidat" element={<ProtectedRoute><Layout><CandidatPage /></Layout></ProtectedRoute>} />
        <Route path="/filter" element={<ProtectedRoute><Layout><FilterCandidats /></Layout></ProtectedRoute>} />
        <Route path="/candidatfilter" element={<ProtectedRoute><Layout><CandidatFilterPage /></Layout></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
