import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./components/Login";
import Dashboard from "./Pages/Dashboard";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
