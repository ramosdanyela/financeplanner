import { useState, useEffect, useContext } from "react";
import { api } from "../../api/api";
import { AuthContext } from "../../contexts/authContext";

function TransactionBox({
  transacMacrotype,
  category,
  subcategory,
  search,
  setLoading,
  loading,
  transactions,
  setTransactions,
  selectedTransaction,
  setSelectedTransaction,
}) {
  const { loggedInUser } = useContext(AuthContext);

  if (!loggedInUser || !loggedInUser.user || !loggedInUser.user._doc) {
    return <p>Loading...</p>; // Renderiza algo enquanto `loggedInUser` não está disponível
  }

  const [selectedIds, setSelectedIds] = useState([]); // IDs selecionados

  const token = loggedInUser.token;

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
  }, [
    setTransactions,
    setLoading,
    transacMacrotype,
    category,
    subcategory,
    search,
  ]);

  // Seleção de todos os checkboxes
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allVisibleTransactionIds = transactions.map(
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

  const filteredTransactions =
    transactions && transactions.length > 0
      ? transactions
          .filter((transaction) =>
            transacMacrotype
              ? transaction.transac_macrotype === transacMacrotype
              : true
          )
          .filter((transaction) =>
            category ? transaction.category?.name === category : true
          )
          .filter((transaction) =>
            subcategory ? transaction.subcategory?.name === subcategory : true
          )
          .filter((transaction) =>
            search
              ? transaction.description
                  .toLowerCase()
                  .includes(search.toLowerCase())
              : true
          )
      : [];

  return (
    <div className="flex-auto flex-col w-[90%] text-black bg-[#FFFFFF] rounded-lg p-[20px] m-[20px] mt-[250px] shadow-lg">
      {loading && <p>Loading...</p>}
      {!loading && filteredTransactions.length === 0 && (
        <p>No transactions found</p>
      )}
      {!loading && filteredTransactions.length > 0 && (
        <table className="w-full">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedIds.length === filteredTransactions.length}
                />
              </th>
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
                className={`${
                  selectedIds.includes(transaction._id) ? "bg-gray-300" : ""
                } cursor-pointer`}
                onClick={() => setSelectedTransaction(transaction)}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(transaction._id)}
                    onChange={() => handleSelect(transaction._id)}
                  />
                </td>
                <td>{transaction.transac_subtype}</td>
                <td>{transaction.bank}</td>
                <td>{new Date(transaction.date).toLocaleDateString()}</td>
                <td>{transaction.description}</td>
                <td>{transaction.value}</td>
                <td>{transaction.category.name}</td>{" "}
                {/* Acessa o campo 'name' de category */}
                <td>{transaction.subcategory.name}</td>{" "}
                {/* Acessa o campo 'name' de subcategory */}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TransactionBox;
