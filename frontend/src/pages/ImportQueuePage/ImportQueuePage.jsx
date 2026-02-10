import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import { AuthContext } from "../../contexts/authContext";

function ImportQueuePage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");
  const [scanResult, setScanResult] = useState(null);

  const { loggedInUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch queue on mount
  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/import/queue");
      setQueue(response.data.queue || []);
    } catch (err) {
      const isNetwork = !err.response && (err.code === "ERR_NETWORK" || err.message?.includes("Network"));
      setError(
        isNetwork
          ? "Servidor inacessível. Inicie o backend (npm run dev:backend) e clique em \"Tentar novamente\"."
          : err.response?.data?.msg || "Falha ao carregar fila"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleScanInbox = async () => {
    setScanning(true);
    setError("");
    setScanResult(null);
    try {
      const response = await api.post("/import/scan");
      setScanResult(response.data);
      await fetchQueue();
    } catch (err) {
      const msg = err.response?.data?.msg || err.message;
      const isNetwork = !err.response && (err.code === "ERR_NETWORK" || err.message?.includes("Network"));
      setError(
        isNetwork
          ? "Servidor inacessível. Inicie o backend (npm run dev:backend) e tente de novo."
          : msg || "Falha ao escanear inbox"
      );
    } finally {
      setScanning(false);
    }
  };

  const handleResetScan = async () => {
    if (!window.confirm("Resetar o scan? Os PDFs da fila e da pasta de falhas voltarão para a pasta de inbox e o estado de importação (pendente/falho) será apagado. Depois clique em \"Scan Inbox\" para processar tudo de novo.")) {
      return;
    }
    setResetting(true);
    setError("");
    setScanResult(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      const response = await api.post("/import/reset", null, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const { movedToInbox, deletedImports, deletedBatches, dbError, dbErrorMessage } = response.data;
      setScanResult({
        summary: { total: 0, successful: 0, failed: 0 },
        processed: [],
        errors: [],
        reset: { movedToInbox, deletedImports, deletedBatches, dbError, dbErrorMessage },
      });
      await fetchQueue();
    } catch (err) {
      const isAborted = err.name === "CanceledError" || err.name === "AbortError";
      setError(
        isAborted
          ? "Reset demorou muito e foi cancelado. Tente de novo."
          : err.response?.data?.msg || "Falha ao resetar scan"
      );
    } finally {
      setResetting(false);
    }
  };

  const handleReviewBatch = (batchId) => {
    navigate(`/import/review/${batchId}`);
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
        <h1 className="text-h1 text-text-primary font-semibold">Import Queue</h1>
        <div className="flex gap-md">
          <button
            onClick={handleResetScan}
            disabled={scanning || resetting}
            className={`btn-secondary ${scanning || resetting ? "opacity-50 cursor-not-allowed" : ""}`}
            title="Devolve PDFs da fila/falhas para o inbox e limpa o estado para escanear tudo de novo"
          >
            {resetting ? "Resetting..." : "Resetar scan"}
          </button>
          <button
            onClick={handleScanInbox}
            disabled={scanning || resetting}
            className={`btn-primary ${scanning || resetting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {scanning ? "Scanning..." : "Scan Inbox"}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-text-outcome/20 border border-text-outcome text-text-outcome px-lg py-md rounded-button mb-xl">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => { setError(""); fetchQueue(); }}
            className="btn-secondary mt-md"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Scan Result */}
      {scanResult && (
        <div className="bg-accent-purple/20 border border-accent-purple text-text-primary px-lg py-md rounded-button mb-xl">
          {scanResult.reset ? (
            <>
              <p className="font-semibold mb-sm">Scan resetado</p>
              <p className="text-body text-text-secondary">
                {scanResult.reset.movedToInbox} PDF(s) devolvidos ao inbox. {scanResult.reset.deletedImports} import(s) e {scanResult.reset.deletedBatches} batch(es) removidos. Clique em &quot;Scan Inbox&quot; para processar tudo de novo.
              </p>
              {scanResult.reset.dbError && (
                <p className="text-body text-text-outcome mt-sm">
                  Aviso: a limpeza no banco falhou ({scanResult.reset.dbErrorMessage || "erro de conexão"}). O servidor continua rodando; tente &quot;Scan Inbox&quot; ou resetar de novo em alguns segundos.
                </p>
              )}
            </>
          ) : (
            <>
              <p className="font-semibold mb-sm">Scan Complete</p>
              <p className="text-body text-text-secondary">
                Found {scanResult.summary.total} file(s): {scanResult.summary.successful} processed,{" "}
                {scanResult.summary.failed} failed
              </p>
              {scanResult.processed.length > 0 && (
                <ul className="mt-sm text-small text-text-secondary">
                  {scanResult.processed.map((p, i) => (
                    <li key={i}>
                      {p.filename}: {p.status} ({p.transactionCount || 0} transactions)
                    </li>
                  ))}
                </ul>
              )}
              {scanResult.errors.length > 0 && (
                <ul className="mt-sm text-small text-text-outcome">
                  {scanResult.errors.map((e, i) => (
                    <li key={i}>
                      {e.filename}: {e.error}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="card mb-xl">
        <h2 className="text-h3 text-text-primary font-semibold mb-md">How to use</h2>
        <p className="text-body text-text-secondary mb-sm">
          Requer o backend rodando na porta 4000 (<code className="bg-bg-main px-xs rounded">npm run dev:backend</code> na raiz do projeto).
        </p>
        <ol className="text-body text-text-secondary list-decimal list-inside space-y-sm">
          <li>Coloque os PDFs no servidor em <code className="bg-bg-main px-xs rounded">backend/express2/data/pdf_inbox</code></li>
          <li>Clique em &quot;Scan Inbox&quot; para detectar e processar</li>
          <li>Revise e confirme as transações na fila abaixo</li>
        </ol>
      </div>

      {/* Queue List */}
      {loading ? (
        <div className="card text-center py-2xl">
          <p className="text-body text-text-secondary">Loading queue...</p>
        </div>
      ) : queue.length === 0 ? (
        <div className="card text-center py-2xl">
          <p className="text-body text-text-secondary">No pending imports in queue</p>
          <p className="text-small text-text-secondary mt-sm">
            Place PDF files in the inbox folder and click &quot;Scan Inbox&quot;
          </p>
        </div>
      ) : (
        <div className="card">
          <h2 className="text-h2 text-text-primary font-semibold mb-lg">
            Pending Imports ({queue.length})
          </h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Parser</th>
                  <th>Transactions</th>
                  <th>Pending</th>
                  <th>Needs Review</th>
                  <th>Parsed At</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {queue.map((batch) => (
                  <tr key={batch._id || batch.fileHash}>
                    <td>
                      <span className="badge-income">{batch.parserUsed || "unknown"}</span>
                    </td>
                    <td>{batch.transactionCount}</td>
                    <td>{batch.pendingCount}</td>
                    <td>
                      {batch.stats?.needsReviewCount > 0 ? (
                        <span className="text-text-outcome">{batch.stats.needsReviewCount}</span>
                      ) : (
                        <span className="text-text-income">0</span>
                      )}
                    </td>
                    <td className="text-small text-text-secondary">
                      {formatDate(batch.parsedAt)}
                    </td>
                    <td>
                      <button
                        onClick={() => handleReviewBatch(batch._id || batch.fileHash)}
                        className="btn-primary text-small py-xs px-md"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex justify-between mt-xl">
        <button onClick={() => navigate("/import")} className="btn-secondary">
          Manual Import
        </button>
        <button onClick={() => navigate("/transactions")} className="btn-secondary">
          View Transactions
        </button>
      </div>
    </div>
  );
}

export default ImportQueuePage;
