import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import { AuthContext } from "../../contexts/authContext";

function BatchReviewPage() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const { loggedInUser } = useContext(AuthContext);

  const [batch, setBatch] = useState(null);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [committing, setCommitting] = useState(false);
  const [error, setError] = useState("");
  const [commitResult, setCommitResult] = useState(null);
  const [rulePreview, setRulePreview] = useState({});

  // Fetch batch data on mount
  useEffect(() => {
    fetchBatch();
  }, [batchId]);

  const fetchBatch = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(`/import/batch/${batchId}`);
      setBatch(response.data.batch);
      // Select all pending transactions by default
      const pendingIds = response.data.batch.transactions
        .filter((t) => t.importStatus === "pending")
        .map((t) => t.tempId);
      setSelectedTransactions(pendingIds);

      // Fetch rule preview for descriptions
      const descriptions = [
        ...new Set(
          response.data.batch.transactions
            .map((t) => t.description)
            .filter(Boolean)
        ),
      ];
      if (descriptions.length > 0) {
        try {
          const previewRes = await api.post("/tagging-rule/apply-preview", {
            descriptions,
          });
          setRulePreview(previewRes.data);
        } catch {
          // Non-critical, ignore errors
        }
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to load batch");
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    setCommitting(true);
    setError("");
    try {
      const response = await api.post(`/import/commit/${batchId}`);
      setCommitResult(response.data);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to commit transactions");
    } finally {
      setCommitting(false);
    }
  };

  const handleSelectAll = () => {
    if (batch) {
      const pendingIds = batch.transactions
        .filter((t) => t.importStatus === "pending")
        .map((t) => t.tempId);
      setSelectedTransactions(pendingIds);
    }
  };

  const handleSelectNone = () => {
    setSelectedTransactions([]);
  };

  const handleToggleTransaction = (tempId) => {
    if (selectedTransactions.includes(tempId)) {
      setSelectedTransactions(selectedTransactions.filter((id) => id !== tempId));
    } else {
      setSelectedTransactions([...selectedTransactions, tempId]);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "-";
    return `R$ ${Math.abs(value).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="badge-outcome">Pending</span>;
      case "imported":
        return <span className="badge-income">Imported</span>;
      case "duplicate":
        return <span className="bg-text-secondary/20 text-text-secondary px-sm py-xs rounded-full text-small">Duplicate</span>;
      default:
        return <span className="text-small text-text-secondary">{status}</span>;
    }
  };

  if (!loggedInUser || !loggedInUser.token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-body text-text-secondary">Loading...</p>
      </div>
    );
  }

  // Success state
  if (commitResult) {
    return (
      <div className="min-h-screen px-xl py-xl max-w-4xl mx-auto">
        <div className="card text-center">
          <div className="w-16 h-16 bg-text-income/20 rounded-full flex items-center justify-center mx-auto mb-xl">
            <svg
              className="w-8 h-8 text-text-income"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-h2 text-text-primary font-semibold mb-md">Import Complete</h2>
          <div className="text-body text-text-secondary mb-xl space-y-sm">
            <p>Imported: <span className="text-text-income font-semibold">{commitResult.imported}</span></p>
            <p>Duplicates skipped: <span className="text-text-secondary font-semibold">{commitResult.duplicates}</span></p>
            <p>Total processed: <span className="font-semibold">{commitResult.total}</span></p>
          </div>

          <div className="flex justify-center gap-lg">
            <button onClick={() => navigate("/import/queue")} className="btn-secondary">
              Back to Queue
            </button>
            <button onClick={() => navigate("/transactions")} className="btn-primary">
              View Transactions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-xl py-xl max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-xl">
        <div>
          <h1 className="text-h1 text-text-primary font-semibold">Review Batch</h1>
          {batch && (
            <p className="text-body text-text-secondary mt-sm">
              {batch.filename} - {batch.parserUsed}
            </p>
          )}
        </div>
        <button onClick={() => navigate("/import/queue")} className="btn-secondary">
          Back to Queue
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-text-outcome/20 border border-text-outcome text-text-outcome px-lg py-md rounded-button mb-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="card text-center py-2xl">
          <p className="text-body text-text-secondary">Loading batch...</p>
        </div>
      ) : !batch ? (
        <div className="card text-center py-2xl">
          <p className="text-body text-text-secondary">Batch not found</p>
        </div>
      ) : (
        <>
          {/* Stats Card */}
          <div className="card mb-xl">
            <div className="grid grid-cols-4 gap-lg">
              <div>
                <p className="text-small text-text-secondary">Total</p>
                <p className="text-h2 text-text-primary font-semibold">
                  {batch.stats.totalCount}
                </p>
              </div>
              <div>
                <p className="text-small text-text-secondary">Needs Review</p>
                <p className={`text-h2 font-semibold ${batch.stats.needsReviewCount > 0 ? 'text-text-outcome' : 'text-text-income'}`}>
                  {batch.stats.needsReviewCount}
                </p>
              </div>
              <div>
                <p className="text-small text-text-secondary">Low Confidence</p>
                <p className={`text-h2 font-semibold ${batch.stats.lowConfidenceCount > 0 ? 'text-text-outcome' : 'text-text-income'}`}>
                  {batch.stats.lowConfidenceCount}
                </p>
              </div>
              <div>
                <p className="text-small text-text-secondary">Period</p>
                <p className="text-body text-text-primary">
                  {formatDate(batch.stats.period?.start)} - {formatDate(batch.stats.period?.end)}
                </p>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="card">
            <div className="flex items-center justify-between mb-lg">
              <h2 className="text-h2 text-text-primary font-semibold">Transactions</h2>
              <div className="flex items-center gap-lg">
                <button onClick={handleSelectAll} className="btn-secondary text-small">
                  Select All Pending
                </button>
                <button onClick={handleSelectNone} className="btn-secondary text-small">
                  Select None
                </button>
                <span className="text-body text-text-secondary">
                  {selectedTransactions.length} selected
                </span>
              </div>
            </div>

            <div className="table-container max-h-[60vh] overflow-y-auto mb-xl">
              <table className="table">
                <thead className="sticky top-0 bg-bg-card z-10">
                  <tr>
                    <th className="w-12">
                      <input
                        type="checkbox"
                        checked={
                          selectedTransactions.length ===
                          batch.transactions.filter((t) => t.importStatus === "pending").length
                        }
                        onChange={(e) =>
                          e.target.checked ? handleSelectAll() : handleSelectNone()
                        }
                        className="w-4 h-4 accent-accent-purple"
                      />
                    </th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th className="text-right">Value</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {batch.transactions.map((transaction) => (
                    <tr
                      key={transaction.tempId}
                      className={`${
                        transaction.needsReview ? "bg-text-outcome/5" : ""
                      } ${
                        transaction.importStatus !== "pending" ? "opacity-50" : ""
                      }`}
                      onClick={() =>
                        transaction.importStatus === "pending" &&
                        handleToggleTransaction(transaction.tempId)
                      }
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedTransactions.includes(transaction.tempId)}
                          onChange={() => handleToggleTransaction(transaction.tempId)}
                          disabled={transaction.importStatus !== "pending"}
                          className="w-4 h-4 accent-accent-purple"
                        />
                      </td>
                      <td>{getStatusBadge(transaction.importStatus)}</td>
                      <td>{formatDate(transaction.date)}</td>
                      <td className="max-w-xs truncate" title={transaction.description}>
                        {transaction.description}
                      </td>
                      <td>
                        {(() => {
                          const descKey = (transaction.description || "").toLowerCase().trim();
                          const match = rulePreview[descKey];
                          if (match) {
                            return (
                              <span className="bg-text-income/20 text-text-income px-sm py-xs rounded-full text-small">
                                {match.categoryName}
                                {match.subcategoryName && ` / ${match.subcategoryName}`}
                              </span>
                            );
                          }
                          return <span className="text-small text-text-secondary">--</span>;
                        })()}
                      </td>
                      <td
                        className={`text-right font-semibold ${
                          transaction.isIncome ? "text-text-income" : "text-text-outcome"
                        }`}
                      >
                        {transaction.isIncome ? "+" : "-"}
                        {formatCurrency(transaction.value)}
                      </td>
                      <td>
                        <div className="flex items-center gap-sm">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              transaction.confidence >= 0.9
                                ? "bg-text-income"
                                : transaction.confidence >= 0.7
                                ? "bg-yellow-500"
                                : "bg-text-outcome"
                            }`}
                          />
                          <span className="text-small text-text-secondary">
                            {Math.round(transaction.confidence * 100)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Commit Button */}
            <div className="flex justify-end">
              <button
                onClick={handleCommit}
                disabled={committing}
                className={`btn-primary ${committing ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {committing ? "Importing..." : `Import All Pending Transactions`}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default BatchReviewPage;
