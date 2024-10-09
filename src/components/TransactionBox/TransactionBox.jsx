function TransactionBox({
  transacMacrotype,
  category,
  subcategory,
  search,
  transactions,
  setSelectedTransaction,
}) {
  // Filtrar transações com base nos valores atuais dos filtros
  const filteredTransactions = transactions
    .filter((transaction) =>
      transacMacrotype ? transaction.transac_macrotype === transacMacrotype : true
    )
    .filter((transaction) =>
      category ? transaction.category?.name === category : true
    )
    .filter((transaction) =>
      subcategory ? transaction.subcategory?.name === subcategory : true
    )
    .filter((transaction) =>
      search ? transaction.description.toLowerCase().includes(search.toLowerCase()) : true
    );

  return (
    <div className="flex-auto flex-col w-[90%] text-black bg-[#FFFFFF] rounded-lg p-[20px] m-[20px] mt-[250px] shadow-lg">
      {filteredTransactions.length === 0 ? (
        <p>No transactions found</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr>
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
