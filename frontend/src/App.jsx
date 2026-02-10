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
import ImportPage from "./pages/ImportPage/ImportPage";
import ImportQueuePage from "./pages/ImportQueuePage/ImportQueuePage";
import ImportHistoryPage from "./pages/ImportHistoryPage/ImportHistoryPage";
import BatchReviewPage from "./pages/BatchReviewPage/BatchReviewPage";
import TaggingRulesPage from "./pages/TaggingRulesPage/TaggingRulesPage";

import { AuthContextComponent } from "./contexts/authContext";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    async function fetchData() {
      try {
        const response = await api.get("/transaction/all-transactions");
        setTransactions(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data", error);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-bg-main">
      <AuthContextComponent>
        <Navbar />
        <main className="pt-16">
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
            <Route
              path="/import"
              element={
                <ProtectedRoute
                  element={<ImportPage setTransactions={setTransactions} />}
                />
              }
            />
            <Route
              path="/import/queue"
              element={<ProtectedRoute element={<ImportQueuePage />} />}
            />
            <Route
              path="/import/history"
              element={<ProtectedRoute element={<ImportHistoryPage />} />}
            />
            <Route
              path="/import/review/:batchId"
              element={<ProtectedRoute element={<BatchReviewPage />} />}
            />
            <Route
              path="/tagging-rules"
              element={<ProtectedRoute element={<TaggingRulesPage />} />}
            />
          </Routes>
        </main>
      </AuthContextComponent>
    </div>
  );
}

export default App;
