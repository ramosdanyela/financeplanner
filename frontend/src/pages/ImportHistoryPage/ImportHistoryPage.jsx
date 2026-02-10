import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import { AuthContext } from "../../contexts/authContext";

function ImportHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { loggedInUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/import/history", {
        params: { limit: 500 },
      });
      const all = response.data.history || [];
      const importedOnly = all.filter((item) => item.status === "imported");
      setHistory(importedOnly);
    } catch (err) {
      const isNetwork = !err.response && (err.code === "ERR_NETWORK" || err.message?.includes("Network"));
      setError(
        isNetwork
          ? "Servidor inacessível. Inicie o backend e clique em \"Tentar novamente\"."
          : err.response?.data?.msg || "Falha ao carregar histórico"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!loggedInUser || !loggedInUser.token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-body text-text-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-xl py-xl max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-xl">
        <h1 className="text-h1 text-text-primary font-semibold">Arquivos importados</h1>
        <button onClick={() => navigate("/import/queue")} className="btn-secondary">
          Voltar para Fila
        </button>
      </div>

      <p className="text-body text-text-secondary mb-xl">
        Lista de todos os arquivos (PDFs) que foram importados com sucesso para suas transações.
      </p>

      {error && (
        <div className="bg-text-outcome/20 border border-text-outcome text-text-outcome px-lg py-md rounded-button mb-xl">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => { setError(""); fetchHistory(); }}
            className="btn-secondary mt-md"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {loading ? (
        <div className="card text-center py-2xl">
          <p className="text-body text-text-secondary">Carregando...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="card text-center py-2xl">
          <p className="text-body text-text-secondary">Nenhum arquivo importado ainda</p>
          <p className="text-small text-text-secondary mt-sm">
            Use a Fila de importação para escanear e importar PDFs.
          </p>
          <button
            onClick={() => navigate("/import/queue")}
            className="btn-primary mt-lg"
          >
            Ir para Fila de importação
          </button>
        </div>
      ) : (
        <div className="card">
          <h2 className="text-h2 text-text-primary font-semibold mb-lg">
            {history.length} arquivo(s) importado(s)
          </h2>
          <div className="table-container max-h-[70vh] overflow-y-auto">
            <table className="table">
              <thead className="sticky top-0 bg-bg-card z-10">
                <tr>
                  <th>Arquivo</th>
                  <th>Banco</th>
                  <th>Data da importação</th>
                  <th className="text-center">Transações</th>
                  <th className="text-center">Importadas</th>
                  <th className="text-center">Duplicadas</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.fileHash || item._id}>
                    <td className="max-w-xs truncate" title={item.filename}>
                      {item.filename || "-"}
                    </td>
                    <td>
                      <span className="badge-income text-small">
                        {item.bank || "unknown"}
                      </span>
                    </td>
                    <td className="text-small text-text-secondary">
                      {formatDate(item.importedAt)}
                    </td>
                    <td className="text-center">{item.transactionCount ?? "-"}</td>
                    <td className="text-center text-text-income">
                      {item.importedCount ?? "-"}
                    </td>
                    <td className="text-center text-text-secondary">
                      {item.duplicateCount ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-xl">
        <button onClick={() => navigate("/import")} className="btn-secondary">
          Import manual
        </button>
        <button onClick={() => navigate("/transactions")} className="btn-secondary">
          Ver transações
        </button>
      </div>
    </div>
  );
}

export default ImportHistoryPage;
