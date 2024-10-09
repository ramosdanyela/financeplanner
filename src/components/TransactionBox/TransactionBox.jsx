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
  // Filtrar transações com base nos valores atuais dos filtros
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
    )
    .sort((a, b) => b.value - a.value);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allVisibleTransactionIds = filteredTransactions.map(
        (transaction) => transaction._id
      );
      setSelectedIds(allVisibleTransactionIds);
    } else {
      setSelectedIds([]);
    }
  };
  // Seleção individual
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
    <div className="flex-auto flex-col w-[90%] text-black bg-[#FFFFFF] rounded-lg p-[20px] m-[20px] mt-[250px] shadow-lg">
      {massEditOpen && (
        <div className="flex flex-col ">
          <p> {selectedIds.length} transactions selected</p>
          <p> Selected Total Value: R$ {totalSelectedValue.toFixed(2)}</p>
        </div>
      )}
      {filteredTransactions.length === 0 ? (
        <p>No transactions found</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr>
              {massEditOpen && (
                <th>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedIds.length === filteredTransactions.length}
                  />
                </th>
              )}
              <th>Subtype</th>
              <th>Bank</th>
              <th>Date</th>
              <th>Description</th>
              <th>Value</th>
              <th>Category</th>
              <th>Subcategory</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr
                key={transaction._id}
                className="cursor-pointer"
                onClick={() => setSelectedTransaction(transaction)}
              >
                {" "}
                {massEditOpen && (
                  <td>
                    {" "}
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(transaction._id)}
                      onChange={() => handleSelect(transaction._id)}
                    />
                  </td>
                )}
                <td>{transaction.transac_subtype}</td>
                <td>{transaction.bank}</td>
                <td>{new Date(transaction.date).toLocaleDateString()}</td>
                <td>{transaction.description}</td>
                <td>{transaction.value}</td>
                <td>{transaction.category?.name}</td>
                <td>{transaction.subcategory?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TransactionBox;
