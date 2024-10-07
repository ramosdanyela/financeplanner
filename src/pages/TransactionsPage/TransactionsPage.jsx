import { useState, useContext } from "react";
import TransactionBox from "../../components/TransactionBox/TransactionBox";
import DetailBox from "../../components/DetailBox/DetailBox";
import SearchBar from "../../components/SearchBar/SearchBar";
import { AuthContext } from "../../contexts/authContext";

function TransactionsPage() {
  const [loading, setLoading] = useState(false); // Certifique-se de que o setLoading está definido corretamente
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [transacMacrotype, setTransacMacrotype] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const { loggedInUser } = useContext(AuthContext);

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
        setTransactions={setTransactions}
        transactions={transactions}
        loading={loading} // Certifique-se de passar loading e setLoading como props
        setLoading={setLoading}
      />

      <div className="flex w-full flex-row">
      <div className="flex w-full flex-row">
        <TransactionBox
          search={search}
          transacMacrotype={transacMacrotype}
          category={category}
          subcategory={subcategory}
          loading={loading}
          setLoading={setLoading}
          transactions={transactions}
          setTransactions={setTransactions}
          selectedTransaction={selectedTransaction}
          setSelectedTransaction={setSelectedTransaction}
        /> </div>
        <div className="flex w-full flex-row">
        {selectedTransaction && (
          <DetailBox
            selectedTransaction={selectedTransaction}
            setTransactions={setTransactions}
          />
        )}
        </div>
      </div>
    </div>
  );
}

export default TransactionsPage;
