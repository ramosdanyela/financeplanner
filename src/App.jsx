import { Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "./api/api";
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
  const [transactions, setTransactions] = useState([]); // Origem de dados
  const [loading, setLoading] = useState(false); // Certifique-se de que o setLoading está definido corretamente

  useEffect(() => {
    setLoading(true);
    async function fetchData() {
      try {
        const response = await api.get("/transaction/all-transactions");
        setTransactions(response.data); // Carregar a lista de transações uma vez
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data", error);
        setLoading(false);
      }
    }
    fetchData();
  }, []); // Carregar transações apenas uma vez quando o componente é montado

  return (
    <div className="bg-[#252525] m-0 p-0">
      <AuthContextComponent>
        <Navbar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute
                element={<HomePage transactions={transactions} />}
              />
            }
          />
          <Route
            path="/profile"
            element={<ProtectedRoute element={<ProfilePage />} />}
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute
                element={<TransactionsPage transactions={transactions} />}
              />
            }
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
