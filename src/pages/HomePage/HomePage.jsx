import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ChartsSummary from "../../components/ChartsSummary/ChartsSummary";
import TransactionBox from "../../components/TransactionBox/TransactionBox";


function HomePage({transactions, setTransactions}) {
  const [loading, setLoading] = useState(false); // Certifique-se de que o setLoading está definido corretamente
  const [search, setSearch] = useState(""); // Filtros
  const [transacMacrotype, setTransacMacrotype] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [massEditOpen, setMassEditOpen] = useState(false);




  return (
    <div className=" mt-[200px] no-underline flex-col flex text-[#FFFFFF] font-bold">
    
      <Link to="/charts" className="">
        See detailed charts
      </Link>
<ChartsSummary 
transactions={transactions}/>



<Link to="/transactions" className="">
        See transactions </Link>

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
        



    </div>
  );
}

export default HomePage;
