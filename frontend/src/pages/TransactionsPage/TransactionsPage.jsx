import { useState, useContext, useEffect } from "react";
import { api } from "../../api/api";
import TransactionBox from "../../components/TransactionBox/TransactionBox";
import DetailBox from "../../components/DetailBox/DetailBox";
import SearchBar from "../../components/SearchBar/SearchBar";
import MassEdit from "../../components/MassEdit/MassEdit";
import AddTransaction from "../../components/AddTransaction/AddTransaction";
import { AuthContext } from "../../contexts/authContext";

function TransactionsPage({ transactions, setTransactions }) {
  const [search, setSearch] = useState("");
  const [transacMacrotype, setTransacMacrotype] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [massEditOpen, setMassEditOpen] = useState(false);
  const [createTransactionOpen, setCreateTransactionOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const { loggedInUser } = useContext(AuthContext);

  useEffect(() => {
    async function fetchCategoriesAndSubcategories() {
      try {
        const [catRes, subRes] = await Promise.all([
          api.get("/category/all-categories"),
          api.get("/subcategory/all-subcategories"),
        ]);
        setCategories(catRes.data);
        setSubcategories(subRes.data);
      } catch (err) {
        console.error("Error fetching categories/subcategories", err);
      }
    }
    fetchCategoriesAndSubcategories();
  }, []);

  const handleOpen = (type) => {
    setMassEditOpen(type === "massEdit");
    setCreateTransactionOpen(type === "createTransaction");
  };

  if (!loggedInUser || !loggedInUser.token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-body text-text-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Search Bar */}
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
        categories={categories}
        subcategories={subcategories}
        massEditOpen={massEditOpen}
        setMassEditOpen={() => handleOpen("massEdit")}
        createTransactionOpen={createTransactionOpen}
        setCreateTransactionOpen={() => handleOpen("createTransaction")}
      />

      {/* Main Content */}
      <div className="pt-40 px-xl max-w-7xl mx-auto">
        <div className="flex gap-xl">
          {/* Transaction Table */}
          <div className={`${selectedTransaction || massEditOpen || createTransactionOpen ? "w-2/3" : "w-full"}`}>
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
          </div>

          {/* Side Panel */}
          {(selectedTransaction || massEditOpen || createTransactionOpen) && (
            <div className="w-1/3">
              {selectedTransaction && !massEditOpen && !createTransactionOpen && (
                <DetailBox
                  key={selectedTransaction._id}
                  selectedTransaction={selectedTransaction}
                  setTransactions={setTransactions}
                  onClose={() => setSelectedTransaction(null)}
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
          )}
        </div>
      </div>
    </div>
  );
}

export default TransactionsPage;
