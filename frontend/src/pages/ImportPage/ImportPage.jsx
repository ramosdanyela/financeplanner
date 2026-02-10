import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import { AuthContext } from "../../contexts/authContext";

function ImportPage({ setTransactions }) {
  const [step, setStep] = useState(1);
  const [importTypes, setImportTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { loggedInUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchImportTypes() {
      try {
        const response = await api.get("/import/types");
        setImportTypes(response.data);
      } catch (err) {
        setError("Failed to load import types. Please try again.");
      }
    }
    fetchImportTypes();
  }, []);

  const handleFileChange = (e) => {
    console.log("handleFileChange triggered", e);
    console.log("e.target.files:", e.target.files);
    const selectedFile = e.target.files[0];
    console.log("selectedFile:", selectedFile);
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
    }
  };

  const handleFileClick = (e) => {
    console.log("=== FILE INPUT DEBUG ===");
    console.log("React event:", e);
    console.log("Native event:", e.nativeEvent);
    console.log("Event type:", e.type);
    console.log("Default prevented?:", e.defaultPrevented);
    console.log("Native default prevented?:", e.nativeEvent.defaultPrevented);
    console.log("Target:", e.target);
    console.log("Target type:", e.target.type);
    console.log("Target disabled?:", e.target.disabled);
    console.log("isTrusted:", e.nativeEvent.isTrusted);
    console.log("========================");
  };

  const handleUpload = async () => {
    if (!file || !selectedType) {
      setError("Please select a file and import type.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("importType", selectedType);

      const response = await api.post("/import/parse", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setParsedData(response.data);
      setSelectedTransactions(response.data.transactions.map((t) => t.tempId));
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.message || "Failed to parse file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (selectedTransactions.length === 0) {
      setError("Please select at least one transaction to import.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const transactionsToImport = parsedData.transactions.filter((t) =>
        selectedTransactions.includes(t.tempId)
      );

      await api.post("/import/confirm", {
        transactions: transactionsToImport,
      });

      // Refresh transactions list
      const response = await api.get("/transaction/all-transactions");
      if (setTransactions) {
        setTransactions(response.data);
      }

      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to import transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (parsedData) {
      setSelectedTransactions(parsedData.transactions.map((t) => t.tempId));
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

  const resetWizard = () => {
    setStep(1);
    setSelectedType("");
    setFile(null);
    setParsedData(null);
    setSelectedTransactions([]);
    setError("");
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
      <h1 className="text-h1 text-text-primary font-semibold mb-xl">Import Transactions</h1>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-lg mb-2xl">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`w-3 h-3 rounded-full transition-colors ${
              step >= s ? "bg-accent-purple" : "bg-progress-track"
            }`}
          />
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-text-outcome/20 border border-text-outcome text-text-outcome px-lg py-md rounded-button mb-xl">
          {error}
        </div>
      )}

      {/* Step 1: Select Import Type */}
      {step === 1 && (
        <div className="card">
          <h2 className="text-h2 text-text-primary font-semibold mb-lg">Select Import Type</h2>
          <p className="text-body text-text-secondary mb-xl">
            Choose the type of bank statement you want to import.
          </p>

          <div className="mb-xl">
            <label className="label">Import Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="select w-full"
            >
              <option value="">Select an import type...</option>
              {importTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedType}
              className={`btn-primary ${!selectedType ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Upload File */}
      {step === 2 && (
        <div className="card">
          <h2 className="text-h2 text-text-primary font-semibold mb-lg">Upload File</h2>
          <p className="text-body text-text-secondary mb-xl">
            Upload your bank statement file (PDF or CSV).
          </p>

          <div className="mb-xl">
            <label className="label">File</label>
            {/* Input básico para debug */}
            <input
              type="file"
              accept=".pdf,.csv"
              onClick={handleFileClick}
              onChange={handleFileChange}
            />
            {file && (
              <p className="mt-sm text-body text-text-secondary">
                Selected: {file.name}
              </p>
            )}

            {/* Botão de teste alternativo */}
            <button
              type="button"
              className="btn-secondary mt-lg"
              onClick={() => {
                console.log("Test button clicked - creating input programmatically");
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.pdf,.csv';
                input.style.position = 'fixed';
                input.style.top = '0';
                input.style.left = '0';
                input.style.opacity = '0.01';
                document.body.appendChild(input);
                input.onchange = (e) => {
                  console.log("Programmatic input changed:", e.target.files);
                  if (e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                  document.body.removeChild(input);
                };
                setTimeout(() => {
                  console.log("Clicking input after timeout");
                  input.click();
                }, 100);
              }}
            >
              Test: Select file (alternative method)
            </button>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="btn-secondary">
              Back
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className={`btn-primary ${!file || loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? "Processing..." : "Upload & Parse"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review Transactions */}
      {step === 3 && parsedData && (
        <div className="card">
          <h2 className="text-h2 text-text-primary font-semibold mb-lg">Review Transactions</h2>
          <p className="text-body text-text-secondary mb-lg">
            Found {parsedData.transactions.length} transactions. Select which ones to import.
          </p>

          <div className="flex items-center gap-lg mb-lg">
            <button onClick={handleSelectAll} className="btn-secondary text-small">
              Select All
            </button>
            <button onClick={handleSelectNone} className="btn-secondary text-small">
              Select None
            </button>
            <span className="text-body text-text-secondary ml-auto">
              {selectedTransactions.length} of {parsedData.transactions.length} selected
            </span>
          </div>

          <div className="table-container max-h-96 overflow-y-auto mb-xl">
            <table className="table">
              <thead className="sticky top-0 bg-bg-card">
                <tr>
                  <th className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.length === parsedData.transactions.length}
                      onChange={(e) =>
                        e.target.checked ? handleSelectAll() : handleSelectNone()
                      }
                      className="w-4 h-4 accent-accent-purple"
                    />
                  </th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th className="text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {parsedData.transactions.map((transaction) => (
                  <tr
                    key={transaction.tempId}
                    onClick={() => handleToggleTransaction(transaction.tempId)}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(transaction.tempId)}
                        onChange={() => handleToggleTransaction(transaction.tempId)}
                        className="w-4 h-4 accent-accent-purple"
                      />
                    </td>
                    <td>
                      <span
                        className={
                          transaction.transac_macrotype === "income"
                            ? "badge-income"
                            : "badge-outcome"
                        }
                      >
                        {transaction.transac_macrotype}
                      </span>
                    </td>
                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                    <td className="max-w-xs truncate">{transaction.description}</td>
                    <td
                      className={`text-right font-semibold ${
                        transaction.transac_macrotype === "income"
                          ? "text-text-income"
                          : "text-text-outcome"
                      }`}
                    >
                      {transaction.transac_macrotype === "income" ? "+" : "-"}R${" "}
                      {transaction.value.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="btn-secondary">
              Back
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={selectedTransactions.length === 0 || loading}
              className={`btn-primary ${
                selectedTransactions.length === 0 || loading
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {loading ? "Importing..." : `Import ${selectedTransactions.length} Transactions`}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
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
          <p className="text-body text-text-secondary mb-xl">
            Successfully imported {selectedTransactions.length} transactions.
          </p>

          <div className="flex justify-center gap-lg">
            <button onClick={resetWizard} className="btn-secondary">
              Import More
            </button>
            <button onClick={() => navigate("/transactions")} className="btn-primary">
              View Transactions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImportPage;
