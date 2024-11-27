import { useState, useContext, useEffect } from "react";
import TransactionBox from "../../components/TransactionBox/TransactionBox";
import DetailBox from "../../components/DetailBox/DetailBox";
import SearchBar from "../../components/SearchBar/SearchBar";
import MassEdit from "../../components/MassEdit/MassEdit";
import AddTransaction from "../../components/AddTransaction/AddTransaction";
import { AuthContext } from "../../contexts/authContext";
import { api } from "../../api/api";

function TransactionsPage({ transactions, setTransactions }) {
  const [loading, setLoading] = useState(false); // Certifique-se de que o setLoading está definido corretamente
  const [search, setSearch] = useState(""); // Filtros
  const [transacMacrotype, setTransacMacrotype] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [massEditOpen, setMassEditOpen] = useState(false);
  const [createTransactionOpen, setCreateTransactionOpen] = useState(false);

  const { loggedInUser } = useContext(AuthContext);

  const handleOpen = (type) => {
    setMassEditOpen(type === "massEdit");
    setCreateTransactionOpen(type === "createTransaction");
  };

  if (!loggedInUser || !loggedInUser.user || !loggedInUser.user._doc) {
    return <p>Carregando...</p>; // Renderiza algo enquanto `loggedInUser` não está disponível
  }

  return (
    <div className="flex-auto flex-col flex items-center w-full mt-0">
      <SearchBar
        search={search}
        setSearch={setSearch}
        transacMacrotype={transacMacrotype}
        setTransacMacrotype={setTransacMacrotype}
        category={category}
        setCategory={setCategory}
        subcategory={subcategory}
        setSubcategory={setSubcategory}
        transactions={transactions}
        massEditOpen={massEditOpen}
        setMassEditOpen={() => handleOpen("massEdit")}
        createTransactionOpen={createTransactionOpen}
        setCreateTransactionOpen={() => handleOpen("createTransaction")}
      />

      <div className="flex w-full flex-row">
        <TransactionBox
          search={search}
          transacMacrotype={transacMacrotype}
          category={category}
          subcategory={subcategory}
          transactions={transactions}
          setSelectedTransaction={setSelectedTransaction}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          massEditOpen={massEditOpen}
        />

        {selectedTransaction && (
          <DetailBox
            key={selectedTransaction._id}
            selectedTransaction={selectedTransaction}
            setTransactions={setTransactions} // Para permitir edição na lista original
          />
        )}
        {massEditOpen && (
          <MassEdit
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            transactions={transactions}
            setTransactions={setTransactions}
          />
        )}
        {createTransactionOpen && (
          <AddTransaction setTransactions={setTransactions} />
        )}
      </div>
    </div>
  );
}

export default TransactionsPage;
