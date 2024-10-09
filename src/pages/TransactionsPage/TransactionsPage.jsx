import { useState, useContext, useEffect } from "react";
import TransactionBox from "../../components/TransactionBox/TransactionBox";
import DetailBox from "../../components/DetailBox/DetailBox";
import SearchBar from "../../components/SearchBar/SearchBar";
import MassEdit from "../../components/MassEdit/MassEdit";
import { AuthContext } from "../../contexts/authContext";
import { api } from "../../api/api";

function TransactionsPage() {
  const [loading, setLoading] = useState(false); // Certifique-se de que o setLoading está definido corretamente
  const [transactions, setTransactions] = useState([]); // Origem de dados
  const [search, setSearch] = useState(""); // Filtros
  const [transacMacrotype, setTransacMacrotype] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [massEditOpen, setMassEditOpen] = useState(false);

  const { loggedInUser } = useContext(AuthContext);

  useEffect(() => {
    setLoading(true);
    async function fetchData() {
      try {
        const response = await api.get("/transaction/all-transactions");
        setTransactions(response.data); // Carregar a lista de transações uma vez
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data", error);
        setLoading(false);
      }
    }
    fetchData();
  }, []); // Carregar transações apenas uma vez quando o componente é montado

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
        // Como `transactions` vem da API, passamos apenas para filtrar
        transactions={transactions}
        massEditOpen={massEditOpen}
        setMassEditOpen={setMassEditOpen}
      />

      <div className="flex w-full flex-row">
        <TransactionBox
          search={search}
          transacMacrotype={transacMacrotype}
          category={category}
          subcategory={subcategory}
          transactions={transactions} // A lista original de transações da API
          setSelectedTransaction={setSelectedTransaction}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          massEditOpen={massEditOpen}
        />

        <div className="flex w-full flex-row">
          {massEditOpen ? (
            <MassEdit
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              transactions={transactions}
              setTransactions={setTransactions}
            />
          ) : (
            selectedTransaction && (
              <DetailBox
                key={selectedTransaction._id}
                selectedTransaction={selectedTransaction}
                setTransactions={setTransactions} // Para permitir edição na lista original
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default TransactionsPage;
