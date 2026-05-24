import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";

function App() {
  return (
    <div className="app-container">
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Pages */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;