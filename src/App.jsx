import { Route, Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import HomePage from "./pages/HomePage/HomePage";
import LoginPage from "./pages/LoginPage/LoginPage";
import SignUpPage from "./pages/SignUpPage/SignUpPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import TransactionsPage from "./pages/TransactionsPage/TransactionsPage";
import ChartsPage from "./pages/ChartsPage/ChartsPage";
//import ErrorPage from "./pages/ErrorPage/ErrorPage";

import { AuthContextComponent } from "./contexts/authContext";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

function App() {
  return (
    <div className="bg-[#252525] m-0 p-0">
      <AuthContextComponent>
        <Navbar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/" element={<ProtectedRoute element={<HomePage />} />} />
          <Route
            path="/profile"
            element={<ProtectedRoute element={<ProfilePage />} />}
          />
          <Route
            path="/transactions"
            element={<ProtectedRoute element={<TransactionsPage />} />}
          />
           <Route
            path="/charts"
            element={<ProtectedRoute element={<ChartsPage />} />}
          />
          {/* <Route path="/error" element={<ErrorPage />} /> */}
        </Routes>
      </AuthContextComponent>
    </div>
  );
}

export default App;
