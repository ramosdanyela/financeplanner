import { useState } from "react";

function TransactionBox({
  transacMacrotype,
  category,
  subcategory,
  search,
  transactions,
  setSelectedTransaction,
  selectedIds,
  setSelectedIds,
  massEditOpen,
}) {
  const [sortBy, setSortBy] = useState("value");
  const [sortDir, setSortDir] = useState("desc");

  const filteredTransactions = transactions
    .filter((transaction) =>
      transacMacrotype === "all" || transacMacrotype === ""
        ? true
        : transaction.transac_macrotype === transacMacrotype
    )
    .filter((transaction) =>
      category ? transaction.category?.name === category : true
    )
    .filter((transaction) =>
      subcategory ? transaction.subcategory?.name === subcategory : true
    )
    .filter((transaction) =>
      search
        ? transaction.description.toLowerCase().includes(search.toLowerCase())
        : true
    );

  const handleSort = (column, dir) => {
    setSortBy(column);
    setSortDir(dir);
  };

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let cmp = 0;
    if (sortBy === "type") {
      cmp = (a.transac_subtype || "").localeCompare(b.transac_subtype || "");
    } else if (sortBy === "bank") {
      cmp = (a.bank || "").localeCompare(b.bank || "");
    } else if (sortBy === "date") {
      cmp = new Date(a.date) - new Date(b.date);
    } else if (sortBy === "description") {
      cmp = (a.description || "").localeCompare(b.description || "");
    } else if (sortBy === "value") {
      cmp = (a.value ?? 0) - (b.value ?? 0);
    } else if (sortBy === "category") {
      cmp = (a.category?.name || "").localeCompare(b.category?.name || "");
    } else if (sortBy === "subcategory") {
      cmp = (a.subcategory?.name || "").localeCompare(b.subcategory?.name || "");
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const SortHeader = ({ column, label, className = "" }) => {
    const isActive = sortBy === column;
    return (
      <th className={className}>
        <span className="inline-flex items-center gap-sm">
          <span>{label}</span>
          <span className="inline-flex items-center gap-1" aria-label={`Sort ${label}`}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSort(column, "asc");
              }}
              title={`${label} ascendente`}
              className={`w-6 h-6 flex items-center justify-center rounded text-sm font-bold transition-colors ${
                isActive && sortDir === "asc"
                  ? "bg-accent-purple text-white"
                  : "text-text-secondary hover:bg-bg-nav-hover hover:text-text-primary"
              }`}
            >
              ↑
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSort(column, "desc");
              }}
              title={`${label} descendente`}
              className={`w-6 h-6 flex items-center justify-center rounded text-sm font-bold transition-colors ${
                isActive && sortDir === "desc"
                  ? "bg-accent-purple text-white"
                  : "text-text-secondary hover:bg-bg-nav-hover hover:text-text-primary"
              }`}
            >
              ↓
            </button>
          </span>
        </span>
      </th>
    );
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allVisibleTransactionIds = sortedTransactions.map(
        (transaction) => transaction._id
      );
      setSelectedIds(allVisibleTransactionIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (transactionId) => {
    if (selectedIds.includes(transactionId)) {
      setSelectedIds(selectedIds.filter((id) => id !== transactionId));
    } else {
      setSelectedIds([...selectedIds, transactionId]);
    }
  };

  const totalSelectedValue = selectedIds
    .map(
      (id) =>
        transactions.find((transaction) => transaction._id === id)?.value || 0
    )
    .reduce((acc, value) => acc + value, 0);

  return (
    <div className="card">
      {massEditOpen && (
        <div className="flex items-center justify-between mb-lg pb-lg border-b border-border-subtle">
          <span className="text-body text-text-secondary">
            {selectedIds.length} transactions selected
          </span>
          <span className="text-item-title text-text-primary">
            Total: R$ {totalSelectedValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>
      )}

      {sortedTransactions.length === 0 ? (
        <p className="text-body text-text-secondary text-center py-xl">
          No transactions found
        </p>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                {massEditOpen && (
                  <th className="w-12">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedIds.length === sortedTransactions.length}
                      className="w-4 h-4 accent-accent-purple"
                    />
                  </th>
                )}
                <SortHeader column="type" label="Type" />
                <SortHeader column="bank" label="Bank" />
                <SortHeader column="date" label="Date" />
                <SortHeader column="description" label="Description" />
                <SortHeader column="value" label="Value" className="text-right" />
                <SortHeader column="category" label="Category" />
                <SortHeader column="subcategory" label="Subcategory" />
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map((transaction) => (
                <tr
                  key={transaction._id}
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  {massEditOpen && (
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(transaction._id)}
                        onChange={() => handleSelect(transaction._id)}
                        className="w-4 h-4 accent-accent-purple"
                      />
                    </td>
                  )}
                  <td>
                    <span
                      className={
                        transaction.transac_macrotype === "income"
                          ? "badge-income"
                          : "badge-outcome"
                      }
                    >
                      {transaction.transac_subtype}
                    </span>
                  </td>
                  <td>{transaction.bank}</td>
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
                  <td>{transaction.category?.name || "-"}</td>
                  <td>{transaction.subcategory?.name || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TransactionBox;
